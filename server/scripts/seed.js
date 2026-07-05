import "dotenv/config";
import { connectDB } from "../src/config/db.js";
import { Expense } from "../src/models/Expense.js";
import mongoose from "mongoose";

const CATS = ["Food", "Transport", "Shopping", "Bills", "Health", "Other"];

await connectDB();
await Expense.deleteMany({}); // clean slate — remove this line if you want to keep existing rows

const docs = [];
for (let m = 0; m < 6; m++) {                 // last 6 months
  const count = 5 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    d.setDate(1 + Math.floor(Math.random() * 27));
    docs.push({
      amount: (100 + Math.floor(Math.random() * 900)) * 100, // ₹100–₹1000 in paise
      category: CATS[Math.floor(Math.random() * CATS.length)],
      description: "seed",
      date: d,
    });
  }
}

await Expense.insertMany(docs);
console.log(`Seeded ${docs.length} expenses`);
await mongoose.connection.close();