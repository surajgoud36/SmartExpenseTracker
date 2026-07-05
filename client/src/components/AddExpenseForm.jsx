import { useState } from "react";
import { useCreateExpense } from "../hooks/useExpenses";
import { CATEGORIES } from "../lib/constants";

const today = () => new Date().toISOString().slice(0, 10);

export default function AddExpenseForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today());
  const [error, setError] = useState("");

  const create = useCreateExpense();

  function handleSubmit() {
    const rupees = parseFloat(amount);
    if (!rupees || rupees <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    setError("");
    create.mutate(
      {
        amount: Math.round(rupees * 100), // rupees -> paise
        category,
        description: description.trim(),
        date,
      },
      {
        onSuccess: () => {
          setAmount("");
          setDescription("");
          setDate(today());
        },
        onError: (err) => setError(err.response?.data?.message || "Failed to add expense"),
      }
    );
  }

  return (
    <div className="panel">
      <h3>Add expense</h3>
      <div className="form">
        <label>
          Amount (₹)
          <input type="number" min="0" step="0.01" value={amount}
                 onChange={(e) => setAmount(e.target.value)} placeholder="500" />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          Description
          <input type="text" value={description}
                 onChange={(e) => setDescription(e.target.value)} placeholder="Groceries" />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn-primary" onClick={handleSubmit} disabled={create.isPending}>
          {create.isPending ? "Adding…" : "Add expense"}
        </button>
      </div>
    </div>
  );
}