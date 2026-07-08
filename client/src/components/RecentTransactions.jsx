import { useExpenses, useDeleteExpense } from "../hooks/useExpenses";
import { formatPaise } from "../lib/format";

export default function RecentTransactions() {
  const { data: expenses, isLoading, isError } = useExpenses(10);
  const del = useDeleteExpense();

  if (isLoading) return <div className="panel">Loading…</div>;
  if (isError || !expenses) return <div className="panel error">Failed to load transactions</div>;

  return (
    <div className="panel">
      <h3>Recent transactions</h3>
      {expenses.length === 0 ? (
        <p className="muted">No transactions yet.</p>
      ) : (
        <ul className="txn-list">
          {expenses.map((e) => (
            <li key={e._id} className="txn">
              <div className="txn-main">
                <span className="txn-desc">{e.description || e.category}</span>
                <span className="txn-meta">
                  {e.category} ·{" "}
                  {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <span className="txn-amount">{formatPaise(e.amount)}</span>
              <button className="txn-del" onClick={() => del.mutate(e._id)} aria-label="Delete expense">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}