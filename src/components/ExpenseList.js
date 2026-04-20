import React from "react";
import { deleteExpense } from "../services/expenseService";
import "./ExpenseList.css";

const CATEGORY_ICONS = {
  "Food & Dining": "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Health: "🏥",
  Utilities: "💡",
  Education: "📚",
  Travel: "✈️",
  Other: "📦",
};

const ExpenseList = ({ expenses }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
      await deleteExpense(id);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="expense-list-card empty-state">
        <span className="empty-icon">📭</span>
        <p>No expenses yet. Add your first expense above!</p>
      </div>
    );
  }

  return (
    <div className="expense-list-card">
      <h2 className="list-title">
        <span>📋</span> Recent Expenses
      </h2>
      <div className="expense-list">
        {expenses.map((exp) => (
          <div className="expense-item" key={exp.id}>
            <div className="expense-icon">
              {CATEGORY_ICONS[exp.category] || "📦"}
            </div>
            <div className="expense-details">
              <p className="expense-desc">{exp.description}</p>
              <span className="expense-meta">
                {exp.category} &bull;{" "}
                {exp.date
                  ? new Date(exp.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : ""}
              </span>
            </div>
            <div className="expense-right">
              <span className="expense-amount">
                ₹{Number(exp.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <button
                className="delete-btn"
                onClick={() => handleDelete(exp.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
