import { connect } from "nats";
import dotenv from "dotenv";

dotenv.config();

let nc;

const connectNats = async () => {
  nc = await connect({
    servers: process.env.NATS_URL,
    user: process.env.NATS_USER,
    pass: process.env.NATS_PASSWORD,
  });

  console.log("NATS connected successfully");

  return nc;
};

const publishUserCreated = (user) => {
  if (!nc) {
    throw new Error("NATS is not connected");
  }

  nc.publish(
    "user.created",
    JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
    })
  );

  console.log("User created event published");
};

export { connectNats, publishUserCreated };