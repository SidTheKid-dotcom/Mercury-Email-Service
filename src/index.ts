import { connectToRabbitMQ } from "./rabbitmqConsumer";
import dotenv from "dotenv";

// Load environment variables from a .env file
dotenv.config();

const startService = async () => {
    try {
        console.log("Starting Email Service...");
        await connectToRabbitMQ();
    } catch (error) {
        console.error("Error starting the service:", error);
    }
};

startService();
