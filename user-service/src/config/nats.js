import { connect } from "nats";
import dotenv from "dotenv";

dotenv.config();

let nc;
let js;

const connectNats = async () => {
  nc = await connect({
    servers: process.env.NATS_URL,
    user: process.env.NATS_USER,
    pass: process.env.NATS_PASSWORD,
  });

  console.log("NATS connected successfully");

  // Create JetStream manager
  const jsm = await nc.jetstreamManager();

  // Create stream if it doesn't exist
  try {
    await jsm.streams.info("USERS");
  } catch (error) {
    await jsm.streams.add({
      name: "USERS",
      subjects: ["user.created"],
      storage: "file",
    });

    console.log("JetStream stream USERS created");
  }

  js = nc.jetstream();

  return nc;
};

const publishUserCreated = async (user) => {
  if (!js) {
    throw new Error("JetStream is not connected");
  }

  const data = JSON.stringify({
    id: user._id,
    name: user.name,
    email: user.email,
  });

  await js.publish("user.created", data);

  console.log("User created event published to JetStream");
};

export { connectNats, publishUserCreated };