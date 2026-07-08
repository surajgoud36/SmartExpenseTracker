import SummaryCards from "./components/SummaryCards.jsx";
import MonthlyComparison from "./components/MonthlyComparison.jsx";
import TopCategories from "./components/TopCategories.jsx";
import RecentTransactions from "./components/RecentTransactions.jsx";
import AddExpenseForm from "./components/AddExpenseForm.jsx";
import ChatPanel from "./components/ChatPanel.jsx";

export default function Dashboard({ user, onLogout }) {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <div className="header-right">
          <span className="muted">Hi, {user.name}</span>
          <button className="btn-ghost" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <SummaryCards />

      <div className="grid">
        <div className="col-main">
          <div className="charts-row">
            <MonthlyComparison />
            <TopCategories />
          </div>
          <RecentTransactions />
        </div>
        <aside className="col-side">
          <AddExpenseForm />
          <ChatPanel />
        </aside>
      </div>
    </div>
  );
}
