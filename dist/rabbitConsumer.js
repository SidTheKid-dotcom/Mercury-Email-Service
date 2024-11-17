"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// Set up RabbitMQ consumer
const connectToRabbitMQ = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield amqplib_1.default.connect("amqp://rabbitmq_container:5672");
    const channel = yield connection.createChannel();
    yield channel.assertQueue("crud-service-events", { durable: true });
    console.log("Connected to RabbitMQ, waiting for messages...");
    channel.consume("crud-service-events", (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (msg) {
            const event = JSON.parse(msg.content.toString());
            console.log("Received event:", event);
            if (event.eventType === "AnswerCreated") {
                yield sendEmail(event.data);
            }
            channel.ack(msg); // Acknowledge the message
        }
    }));
});
// Set up email sender
const sendEmail = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail", // Or another email service
        auth: {
            user: "your-email@gmail.com",
            pass: "your-email-password",
        },
    });
    const mailOptions = {
        from: "your-email@gmail.com",
        to: "recipient@example.com", // Can be dynamic based on event data
        subject: "New Answer Created",
        text: `A new answer has been posted:\n\n${data.content}`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
});
connectToRabbitMQ().catch(console.error);
