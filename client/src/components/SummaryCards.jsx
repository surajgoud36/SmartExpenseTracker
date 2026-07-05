import { useSummary } from "../hooks/useExpenses";
import { formatPaise } from "../lib/format";

export default function SummaryCards() {
  const { data, isLoading, isError } = useSummary();

  if (isLoading) return <div className="cards"><div className="card skeleton" /></div>;
  if (isError) return <div className="card error">Failed to load summary</div>;

  const { totalThisMonth, totalLastMonth, percentChange } = data;
  const spentMore = percentChange > 0;

  return (
    <div className="cards">
      <div className="card">
        <span className="card-label">This month</span>
        <span className="card-value">{formatPaise(totalThisMonth)}</span>
        {percentChange === null ? (
          <span className="card-delta muted">No prior month to compare</span>
        ) : (
          <span className={`card-delta ${spentMore ? "down" : "up"}`}>
            {spentMore ? "▲" : "▼"} {Math.abs(percentChange)}% vs last month
          </span>
        )}
      </div>
      <div className="card">
        <span className="card-label">Last month</span>
        <span className="card-value">{formatPaise(totalLastMonth)}</span>
      </div>
    </div>
  );
}