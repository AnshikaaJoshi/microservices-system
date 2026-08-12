const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "API Gateway is running",
  });
});

// Forward user requests to User Service
app.use("/api/users", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${process.env.USER_SERVICE_URL}${req.originalUrl}`,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("User service error:", error.message);

    if (error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data);
    }

    res.status(500).json({
      message: "User service unavailable",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});