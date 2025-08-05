import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import taskRoute from "./routes/task.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the project root
dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
// CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//parse form data
app.use(express.json()); // parses req.body
app.use(express.urlencoded({ extended: true })); // parses url-encoded data

app.use(cookieParser()); //parses req to get cookies

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/tasks", taskRoute);

//when server is up and running connect to db
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
