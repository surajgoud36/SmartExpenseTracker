import { Expense } from "../models/Expense.js";
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Returns first-of-month boundaries. offset 0 = this month, -1 = last month.
function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 1);
  return { start, end };
}

// Builds an ordered list of the last N months, all zeroed — the chart skeleton.
function buildTrendSkeleton(monthsBack = 6) {
  const now = new Date();
  const months = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1, // 1-indexed
      label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
      total: 0,
    });
  }
  return months;
}

export async function getSummary(req, res) {
  try {
    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(-1);
    const trendStart = buildTrendSkeleton(6)[0];
    const trendStartDate = new Date(trendStart.year, trendStart.month - 1, 1);

    const [totalThisMonthAgg, totalLastMonthAgg, topCategories, rawTrend] =
      await Promise.all([
        // 1. total spent this month
        Expense.aggregate([
          { $match: { date: { $gte: thisMonth.start, $lt: thisMonth.end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        // 2. total spent last month
        Expense.aggregate([
          { $match: { date: { $gte: lastMonth.start, $lt: lastMonth.end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),

        // 3. top 5 categories this month
        Expense.aggregate([
          { $match: { date: { $gte: thisMonth.start, $lt: thisMonth.end } } },
          {
            $group: {
              _id: "$category",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 5 },
        ]),

        // 4. last 6 months, grouped by year + month
        Expense.aggregate([
          { $match: { date: { $gte: trendStartDate } } },
          {
            $group: {
              _id: { y: { $year: "$date" }, m: { $month: "$date" } },
              total: { $sum: "$amount" },
            },
          },
        ]),
      ]);

    const totalThisMonth = totalThisMonthAgg[0]?.total || 0;
    const totalLastMonth = totalLastMonthAgg[0]?.total || 0;

    // percent change vs last month — null when last month had nothing (no divide-by-zero)
    const percentChange =
      totalLastMonth === 0
        ? null
        : Math.round(
            ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100,
          );

    // merge aggregation results onto the zeroed skeleton so empty months still show
    const trendMap = new Map(
      rawTrend.map((r) => [`${r._id.y}-${r._id.m}`, r.total]),
    );
    const monthlyTrend = buildTrendSkeleton(6).map((m) => ({
      ...m,
      total: trendMap.get(`${m.year}-${m.month}`) || 0,
    }));

    res.json({
      totalThisMonth, // all amounts in paise
      totalLastMonth,
      percentChange, // e.g. 12 means +12%, -8 means down 8%, null if no baseline
      topCategories: topCategories.map((c) => ({
        category: c._id,
        total: c.total,
        count: c.count,
      })),
      monthlyTrend,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
