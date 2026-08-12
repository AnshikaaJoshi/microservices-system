import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectNats } from "./config/nats.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await connectNats();

  app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
  });
};

startServer();