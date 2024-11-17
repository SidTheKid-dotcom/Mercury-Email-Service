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
        console.log("Received event:", event);

        if (event.eventType === "QueryCreated") {
          await sendEmailToAllUsers(event.data);
        }

        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
};

// Fetch all users from the database and send an email
const sendEmailToAllUsers = async (data: any) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: data.creatorId, // Exclude the creator
        },
      },
      select: { email: true }, // Only fetch the email field
    });

    // Send email to each user
    for (const user of users) {
      await sendEmail(user.email, data);
    }
  } catch (error) {
    console.error("Error fetching users or sending emails:", error);
  }
};

// Send email using nodemailer
const sendEmail = async (recipientEmail: string, data: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Or use another email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: "New Query Created",
    text: `A new query has been posted:\n\nContent: ${data.content}\nTags: ${data.tags.join(", ")}\nCreated At: ${data.createdAt}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", recipientEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
