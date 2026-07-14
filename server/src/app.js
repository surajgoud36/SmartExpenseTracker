import express from "express";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { requireAuth } from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";
import { generalLimiter, chatLimiter, authLimiter } from "./middleware/rateLimit.js";

const app = express();
app.set("trust proxy", 1);
const allowed = [process.env.CLIENT_ORIGIN, "http://localhost:5173"].filter(Boolean);
app.use(cors({origin: allowed}));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api",generalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/expenses", requireAuth,expenseRoutes);
app.use("/api/chat", requireAuth,chatLimiter,chatRoutes);

app.use((req,res)=> res.status(400).json({message: "Route not found"}));

export default app;