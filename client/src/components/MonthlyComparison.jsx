import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useSummary } from "../hooks/useExpenses";
import { paiseToRupees, formatPaise } from "../lib/format";

export default function MonthlyComparison() {
  const { data, isLoading } = useSummary();
  if (isLoading) return <div className="panel">Loading…</div>;

  const chartData = data.monthlyTrend.map((m) => ({
    label: m.label.replace(" 20", " '"), // "Jun '26"
    amount: paiseToRupees(m.total),
    paise: m.total,
  }));

  return (
    <div className="panel">
      <h3>Monthly spending</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" fontSize={12} tickLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false}
                 tickFormatter={(v) => (v >= 1000 ? `₹${v / 1000}k` : `₹${v}`)} />
          <Tooltip formatter={(_v, _n, p) => formatPaise(p.payload.paise)} />
          <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}