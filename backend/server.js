import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
//parse form data
app.use(express.json()); // parses req.body
app.use(express.urlencoded({ extended: true })); // parses url-encoded data

app.use(cookieParser()); //parses req to get cookies

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

//when server is up and running connect to db
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
