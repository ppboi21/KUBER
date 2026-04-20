import React, { useState } from "react";
import { addExpense, addRecurring } from "../services/expenseService";
import { useAuth } from "../context/AuthContext";
import "./AddExpenseForm.css";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Education",
  "Travel",
  "Other",
];

const FREQUENCY_OPTIONS = ["Monthly", "Weekly", "Yearly"];

const computeNextDueDate = (dateStr, frequency) => {
  const d = new Date(dateStr);
  if (frequency === "Monthly")  d.setMonth(d.getMonth() + 1);
  else if (frequency === "Weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "Yearly") d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
};

const AddExpenseForm = () => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    amount: "",
    category: CATEGORIES[0],
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("Monthly");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      return setError("Please enter a valid amount.");
    }
    if (!form.description.trim()) {
      return setError("Please enter a description.");
    }
    if (isRecurring && endDate && endDate <= form.date) {
      return setError("End date must be after the start date.");
    }

    setLoading(true);

    try {
      const expenseData = {
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        description: form.description.trim(),
      };

      await addExpense(currentUser.uid, expenseData);

      if (isRecurring) {
        const nextDueDate = computeNextDueDate(form.date, frequency);
        await addRecurring(currentUser.uid, {
          ...expenseData,
          frequency,
          dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null,
          nextDueDate,                    
          endDate: endDate || null,       
          isActive: true,
        });
      }

      setForm({
        amount: "",
        category: CATEGORIES[0],
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      setIsRecurring(false);
      setFrequency("Monthly");
      setDayOfMonth("");
      setEndDate("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Add Expense Error:", err);
      setError("Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-expense-card">
      <h2 className="form-title">
        <span>➕</span> Add Expense
      </h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">✅ Expense added successfully!</div>
      )}
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What did you spend on?"
            required
          />
        </div>

        <div className="recurring-toggle-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <span className="toggle-text">🔄 This is a recurring expense (EMI / Subscription)</span>
          </label>
        </div>

        {isRecurring && (
          <div className="recurring-extra-fields">
            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Billing Day (optional)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="e.g. 15"
                />
              </div>
            </div>
            <div className="form-group">
              <label>End Date <span className="label-hint">(leave blank = runs forever)</span></label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={form.date}
              />
            </div>
            <p className="recurring-info">
              💡 This expense will be <strong>automatically added every {frequency.toLowerCase()}</strong>
              {endDate ? ` until ${new Date(endDate).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}` : " indefinitely"}
              {" "}when you open the app.
            </p>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Adding..." : isRecurring ? "Add & Track as Recurring" : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;
