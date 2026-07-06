import {Router} from "express";
import {createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense} from "../controllers/expenseController.js";
import { getSummary } from "../controllers/summaryController.js";

const router = Router();

router.get("/summary",getSummary);
router.route("/").get(getExpenses).post(createExpense);
router.route("/:id").get(getExpenseById).patch(updateExpense).delete(deleteExpense);

export default router;