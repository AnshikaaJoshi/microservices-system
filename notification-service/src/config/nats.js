import { connect } from "nats";
import dotenv from "dotenv";

dotenv.config();

const connectNats = async () => {
  const nc = await connect({
    servers: process.env.NATS_URL,
  });

  console.log("NATS connected successfully");

  const subscription = nc.subscribe("user.created");

  (async () => {
    for await (const message of subscription) {
      const data = JSON.parse(message.data);

      console.log("📩 User created event received:");
      console.log(data);
    }
  })();

  return nc;
};

export default connectNats;