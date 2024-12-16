import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables from a .env file
dotenv.config();

const prisma = new PrismaClient();
const rabbitmqUrl: any = process.env.RABBITMQ_URL;

// Helper to determine greeting based on time
const getGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return "Good Morning";
  if (currentHour < 18) return "Good Afternoon";
  return "Good Evening";
};

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
        `A new query has been posted: ${data.content}`, // Plain text fallback
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <img src="https://d2xhpbv5g2nzjo.cloudfront.net/mercury-logo-1.png" alt="Company Logo" style="width: 120px;" />
          </div>
          <h2 style="color: #6a1b9a;">${getGreeting()}</h2>
          <p style="font-size: 16px; color: #555; margin-top: 20px;">A new query has been posted:</p>
          <blockquote style="font-style: italic; color: #777; margin: 20px auto; border-left: 4px solid rgb(255, 255, 255); padding-left: 10px; max-width: 600px;">
            ${data.content}
          </blockquote>
          <p style="font-size: 14px; color: #999; margin-top: 10px;">Created At: ${new Date(data.createdAt).toLocaleString()}</p>
          ${data.imageUrl ? `<div style="margin-top: 20px;"><img src="${data.imageUrl}" alt="Query Image" style="max-width: 10rem; border-radius: 8px;" /></div>` : ""}
          <p style="margin-top: 20px;">
            <a href="https://mercury-ai.vercel.app/#/Query/${data.queryId}" 
               style="display: inline-block; padding: 10px 20px; background-color: #6a1b9a; color: white; text-decoration: none; border-radius: 4px;">
              View Query
            </a>
          </p>
        </div>
        `
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
        `Your query: "${query.content}" received an answer: "${data.content}"`, // Plain text fallback
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
          <div style="margin-bottom: 20px;">
            <img src="https://d2xhpbv5g2nzjo.cloudfront.net/mercury-logo-1.png" alt="Company Logo" style="width: 120px;" />
          </div>
          <h2 style="color: #6a1b9a;">${getGreeting()}</h2>
          <p style="font-size: 16px; color: #555; margin-top: 20px;">Your query:</p>
          <blockquote style="font-style: italic; color: #777; margin: 20px auto; border-left: 4px solid #6a1b9a; padding-left: 10px; max-width: 600px;">
            ${query.content}
          </blockquote>
          <p style="font-size: 16px; color: #555; margin-top: 20px;">Received an answer:</p>
          <blockquote style="font-style: italic; color: #777; margin: 20px auto; border-left: 4px solid #6a1b9a; padding-left: 10px; max-width: 600px;">
            ${data.content}
          </blockquote>
          <p style="font-size: 14px; color: #999; margin-top: 10px;">Created At: ${new Date(data.createdAt).toLocaleString()}</p>
          <p style="margin-top: 20px;">
            <a href="https://mercury-ai.vercel.app/#/Query/${data.queryId}" 
               style="display: inline-block; padding: 10px 20px; background-color: #6a1b9a; color: white; text-decoration: none; border-radius: 4px;">
              View Answer
            </a>
          </p>
        </div>
        `
      );
    }
  } catch (error) {
    console.error("Error handling AnswerCreated event:", error);
  }
};

// Send email using nodemailer
const sendEmail = async (
  recipientEmail: string,
  subject: string,
  body: string,
  htmlBody: string
) => {
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
    text: body, // Fallback for email clients that don't support HTML
    html: htmlBody, // Main HTML content for the email
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
