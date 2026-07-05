import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSummary } from "../hooks/useExpenses";
import { paiseToRupees, formatPaise } from "../lib/format";
import { CATEGORY_COLORS } from "../lib/constants";

export default function TopCategories() {
  const { data, isLoading } = useSummary();
  if (isLoading) return <div className="panel">Loading…</div>;

  const chartData = data.topCategories.map((c) => ({
    name: c.category,
    value: paiseToRupees(c.total),
    paise: c.total,
  }));

  if (chartData.length === 0) {
    return (
      <div className="panel">
        <h3>Top categories</h3>
        <p className="muted">No spending yet this month.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>Top categories</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name"
               innerRadius={55} outerRadius={80} paddingAngle={2}>
            {chartData.map((e) => (
              <Cell key={e.name} fill={CATEGORY_COLORS[e.name] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip formatter={(_v, _n, p) => formatPaise(p.payload.paise)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}