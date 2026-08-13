import { connect } from "nats";
import dotenv from "dotenv";

dotenv.config();

const connectNats = async () => {
  const nc = await connect({
    servers: process.env.NATS_URL,
    user: process.env.NATS_USER,
    pass: process.env.NATS_PASSWORD,
  });

  console.log("NATS connected successfully");

  const jsm = await nc.jetstreamManager();

  // Create USERS stream if it doesn't exist
  try {
    await jsm.streams.info("USERS");
    console.log("JetStream USERS stream found");
  } catch (error) {
    await jsm.streams.add({
      name: "USERS",
      subjects: ["user.created"],
      storage: "file",
    });

    console.log("JetStream USERS stream created");
  }

  const js = nc.jetstream();

  // Create durable consumer if it doesn't exist
  try {
    await jsm.consumers.info("USERS", "notification-service");
    console.log("Notification consumer found");
  } catch (error) {
    await jsm.consumers.add("USERS", {
      durable_name: "notification-service",
      ack_policy: "explicit",
      filter_subject: "user.created",
    });

    console.log("Notification consumer created");
  }

  const consumer = await js.consumers.get(
    "USERS",
    "notification-service"
  );

  console.log("Notification Service listening for events...");

  (async () => {
    for await (const message of await consumer.consume()) {
      try {
        const data = JSON.parse(message.string());

        console.log("📩 User created event received:");
        console.log(data);

        message.ack();

        console.log("✅ Message acknowledged");
      } catch (error) {
        console.error("❌ Error processing message:", error);
      }
    }
  })();

  return nc;
};

export default connectNats;