import mongoose from "mongoose";
import { Expense } from "../models/Expense.js";

const toRupees = (paise) => Math.round(paise) / 100;

async function getSpendingSummary(userId) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const uid = new mongoose.Types.ObjectId(userId);

  const [thisMonth, categories, trend] = await Promise.all([
    Expense.aggregate([
      { $match: {userId: uid, date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: {userId: uid, date: { $gte: monthStart } } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: {userId: uid, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { y: { $year: "$date" }, m: { $month: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
  ]);

  return {
    currentMonth: { year: now.getFullYear(), month: now.getMonth() + 1 },
    totalThisMonthRupees: toRupees(thisMonth[0]?.total || 0),
    categoriesThisMonth: categories.map((c) => ({
      category: c._id,
      totalRupees: toRupees(c.total),
      count: c.count,
    })),
    monthlyTrend: trend.map((t) => ({
      year: t._id.y,
      month: t._id.m,
      totalRupees: toRupees(t.total),
    })),
  };
}

async function getCategoryBreakdown(userId,{ year, month }) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const uid = new mongoose.Types.ObjectId(userId);
  const rows = await Expense.aggregate([
    { $match: {userId: uid, date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
  return {
    year,
    month,
    categories: rows.map((r) => ({
      category: r._id,
      totalRupees: toRupees(r.total),
      count: r.count,
    })),
  };
}

async function queryExpenses(userId,{ category, dateFrom, dateTo, limit }) {
  const filter = {userId};
  if (category) filter.category = category;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lt = new Date(dateTo);
  }
  const cap = Math.min(limit || 20, 50);
  const rows = await Expense.find(filter).sort({ date: -1 }).limit(cap).lean();
  return {
    count: rows.length,
    expenses: rows.map((e) => ({
      amountRupees: toRupees(e.amount),
      category: e.category,
      description: e.description,
      date: e.date.toISOString().slice(0, 10),
    })),
  };
}

async function addExpense(userId,{ amountRupees, category, description, date }) {
  if (!amountRupees || amountRupees <= 0) {
    return { error: "Amount must be greater than 0." };
  }
  const expense = await Expense.create({
    userId,
    amount: Math.round(amountRupees * 100), // rupees -> paise, server-side
    category,
    description: description || "",
    date: date ? new Date(date) : new Date(),
  });
  return {
    created: true,
    expense: {
      id: expense._id.toString(),
      amountRupees,
      category: expense.category,
      description: expense.description,
      date: expense.date.toISOString().slice(0, 10),
    },
  };
}

export const executors = {
  get_spending_summary: getSpendingSummary,
  get_category_breakdown: getCategoryBreakdown,
  query_expenses: queryExpenses,
  add_expense: addExpense,
};
