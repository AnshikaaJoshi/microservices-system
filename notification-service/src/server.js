import connectNats from "./config/nats.js";

console.log("Starting notification service...");

const startServer = async () => {
    try {
        await connectNats();
        console.log("Notification service started");
    } catch (error) {
        console.error("NATS connection failed:", error.message);
    }
};

startServer();