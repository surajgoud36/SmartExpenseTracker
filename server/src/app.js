import express from "express";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/expenses",expenseRoutes);

app.use((req,res)=> res.status(400).json({message: "Route not found"}));

export default app;