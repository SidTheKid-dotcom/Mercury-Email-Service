import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables from a .env file
dotenv.config();

const prisma = new PrismaClient();
const rabbitmqUrl: any = process.env.RABBITMQ_URL;

// Set up RabbitMQ consumer
export const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue("crud-service-events", { durable: true });
    console.log("Connected to RabbitMQ, waiting for messages...");

    // Start consuming the queue
    channel.consume("crud-service-events", async (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());

        switch (event.eventType) {
          case "QueryCreated":
            await handleQueryCreatedEvent(event.data);
            break;
          case "AnswerCreated":
            await handleAnswerCreatedEvent(event.data);
            break;
          default:
            console.log(`Unknown event type: ${event.eventType}`);
        }

        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
};

// Handle the "QueryCreated" event
const handleQueryCreatedEvent = async (data: any) => {
  try {
    // Fetch all users except the creator of the query
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: data.creatorId,
        },
      },
      select: { email: true },
    });

    // Send email to each user
    for (const user of users) {
      await sendEmail(
        user.email,
        "New Query Created",
        `A new query has been posted:\n\nContent: ${data.content}\nCreated At: ${data.createdAt}`
      );
    }
  } catch (error) {
    console.error("Error handling QueryCreated event:", error);
  }
};

// Handle the "AnswerCreated" event
const handleAnswerCreatedEvent = async (data: any) => {
  try {
    // Fetch the query and its creator's email
    const query = await prisma.query.findUnique({
      where: { id: data.queryId },
      select: {
        content: true,
        User_Query_creatorIdToUser: { select: { email: true } },
      },
    });

    if (query?.User_Query_creatorIdToUser?.email) {
      await sendEmail(
        query.User_Query_creatorIdToUser.email,
        "Your Query Received an Answer",
        `Your query:\n\n"${query.content}"\n\nReceived an answer:\n\n"${data.content}"\nCreated At: ${data.createdAt}`
      );
    }
  } catch (error) {
    console.error("Error handling AnswerCreated event:", error);
  }
};

// Send email using nodemailer
const sendEmail = async (recipientEmail: string, subject: string, body: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
