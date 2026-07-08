// server/scripts/claim.js
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Expense } from "../src/models/Expense.js";

await connectDB();
const MY_ID = "6a4e1ebaf09aff322de56083";
const r = await Expense.updateMany(
  { userId: { $exists: false } },
  { $set: { userId: new mongoose.Types.ObjectId(MY_ID) } }
);
console.log(`Claimed ${r.modifiedCount} expenses`);
await mongoose.connection.close();