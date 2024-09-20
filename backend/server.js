import express from "express";
import dotenv from "dotenv";

import auth from "./routes/auth.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/auth", auth);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
