import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const username = "admin"; // your admin username
  const password = "123456"; // your admin password

  const existing = await User.findOne({ username });
  if (existing) {
    console.log("Admin already exists");
    return mongoose.disconnect();
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new User({ username, password: hashedPassword, role: "admin" });
  await admin.save();
  console.log("Admin created!");
  mongoose.disconnect();
}

createAdmin();
