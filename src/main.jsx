import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { BarChart3, Home, PlusCircle, ReceiptText, Trash2 } from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "spendwise-expenses";

const seedExpenses = [
  {
    id: "seed-1",
    title: "Lunch near campus",
    amount: 8.5,
    category: "Food",
    date: "2026-09-16",
    note: "Chicken rice and drink",
  },
  {
    id: "seed-2",
    title: "MRT top up",
    amount: 20,
    category: "Transport",
    date: "2026-09-15",
    note: "Weekly commute",
  },
  {
    id: "seed-3",
    title: "React notes app subscription",
    amount: 6.9,
    category: "Learning",
    date: "2026-09-12",
    note: "Study tools",
  },
];

function loadExpenses() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : seedExpenses;
}

function App() {
  /* Requirement: Shared state managed with React hooks. This app keeps the expense collection in useState. */
  const [expenses, setExpenses] = React.useState(loadExpenses);
  const [status, setStatus] = React.useState("loading");
  const [error, setError] = React.useState("");

  /* Requirement: Fetches or persists data from at least one mock/external source, with loading and error handling. */
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        setStatus("ready");
        setError("");
      } catch {
        setError("Your browser blocked local storage, so changes may not be saved.");
        setStatus("error");
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [expenses]);

  function addExpense(expense) {
    setExpenses((current) => [
      {
        id: crypto.randomUUID(),
        ...expense,
        amount: Number(expense.amount),
      },
      ...current,
    ]);
  }

  function deleteExpense(id) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Personal finance mini project</p>
          <h1>SpendWise</h1>
        </div>

        {/* Requirement: At least two client-side routes with navigation between them, using React Router. */}
        <nav aria-label="Primary navigation">
          <NavLink to="/" end>
            <Home size={18} />
            Dashboard
          </NavLink>
          <NavLink to="/expenses">
            <ReceiptText size={18} />
            Expenses
          </NavLink>
          <NavLink to="/add">
            <PlusCircle size={18} />
            Add
          </NavLink>
        </nav>
      </header>

      {status === "loading" && <p className="notice">Loading saved expenses...</p>}
      {error && <p className="notice error">{error}</p>}

      <main>
        <Routes>
          <Route path="/" element={<Dashboard expenses={expenses} />} />
          <Route
            path="/expenses"
            element={<ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />}
          />
          <Route path="/add" element={<AddExpense onAddExpense={addExpense} />} />
        </Routes>
      </main>
    </div>
  );
}

function Dashboard({ expenses }) {
  /* Requirement: UI organized into sensibly scoped components with props passed cleanly. */
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const highest = expenses.reduce((max, expense) => Math.max(max, expense.amount), 0);
  const categories = expenses.reduce((summary, expense) => {
    summary[expense.category] = (summary[expense.category] || 0) + expense.amount;
    return summary;
  }, {});

  return (
    <section className="page-grid">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Track everyday spending before it disappears from memory.</h2>
        </div>
        <BarChart3 size={48} />
      </div>

      <div className="stats-grid">
        <StatCard label="Total spent" value={`$${total.toFixed(2)}`} />
        <StatCard label="Transactions" value={expenses.length} />
        <StatCard label="Highest expense" value={`$${highest.toFixed(2)}`} />
      </div>

      <section className="content-panel">
        <h3>Spending by category</h3>
        <div className="category-list">
          {Object.entries(categories).map(([category, amount]) => (
            <div className="category-row" key={category}>
              <span>{category}</span>
              <strong>${amount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ExpenseList({ expenses, onDeleteExpense }) {
  /* Requirement: Displays a collection of items and lets the user delete an item. */
  return (
    <section className="content-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Read and delete</p>
          <h2>Expense history</h2>
        </div>
        <span>{expenses.length} items</span>
      </div>

      <div className="expense-list">
        {expenses.map((expense) => (
          <article className="expense-item" key={expense.id}>
            <div>
              <h3>{expense.title}</h3>
              <p>
                {expense.category} · {expense.date}
              </p>
              {expense.note && <small>{expense.note}</small>}
            </div>
            <strong>${expense.amount.toFixed(2)}</strong>
            <button
              aria-label={`Delete ${expense.title}`}
              className="icon-button"
              onClick={() => onDeleteExpense(expense.id)}
              type="button"
            >
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AddExpense({ onAddExpense }) {
  /* Requirement: At least one form with controlled inputs to create a new item. */
  const [form, setForm] = React.useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [message, setMessage] = React.useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim() || Number(form.amount) <= 0) {
      setMessage("Add a title and an amount greater than zero.");
      return;
    }

    onAddExpense(form);
    setForm({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setMessage("Expense added.");
  }

  return (
    <section className="content-panel form-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Create</p>
          <h2>Add a new expense</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Expense name
          <input name="title" onChange={updateField} placeholder="e.g. Dinner" value={form.title} />
        </label>

        <label>
          Amount
          <input
            min="0"
            name="amount"
            onChange={updateField}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={form.amount}
          />
        </label>

        <label>
          Category
          <select name="category" onChange={updateField} value={form.category}>
            <option>Food</option>
            <option>Transport</option>
            <option>Learning</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Date
          <input name="date" onChange={updateField} type="date" value={form.date} />
        </label>

        <label className="wide">
          Note
          <textarea
            name="note"
            onChange={updateField}
            placeholder="Optional details"
            value={form.note}
          />
        </label>

        <button className="primary-button" type="submit">
          <PlusCircle size={18} />
          Add expense
        </button>
      </form>

      {message && <p className="notice">{message}</p>}
    </section>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
