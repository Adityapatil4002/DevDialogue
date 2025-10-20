// db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // <-- add this line

console.log("Mongo URI:", process.env.MONGODB_URI);

function connect() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
}

export default connect;
