import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import auth from "./routes/auth.js";
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
//parse form data
app.use(express.json()); // parses req.body
app.use(express.urlencoded({ extended: true })); // parses url-encoded data

app.use(cookieParser()); //parses req to get cookies

app.use("/api/auth", auth);

//when server is up and running connect to db
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
