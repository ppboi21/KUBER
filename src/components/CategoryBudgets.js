import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import { setCategoryBudgets } from "../services/expenseService";
import "./CategoryBudgets.css";

const CATEGORY_COLORS = {
  "Food & Dining": "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Entertainment: "#8b5cf6",
  Health: "#10b981",
  Utilities: "#06b6d4",
  Education: "#f97316",
  Travel: "#14b8a6",
  Other: "#6b7280",
};

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

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const CategoryBudgets = () => {
  const { currentUser } = useAuth();
  const { expenses, categoryBudgets: rawCategoryBudgets } = useExpenses();
  const categoryBudgets = rawCategoryBudgets || {};
  const [editingCat, setEditingCat] = useState(null);
  const [editVal, setEditVal] = useState("");

  const now = new Date();
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const spentMap = thisMonthExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const allCategories = new Set([...Object.keys(spentMap), ...Object.keys(categoryBudgets)]);

  const sortedCategories = Array.from(allCategories).sort((a, b) => {
    const spentA = spentMap[a] || 0;
    const spentB = spentMap[b] || 0;
    return spentB - spentA;
  });

  const handleSaveBudget = async (category) => {
    const val = parseFloat(editVal);
    const newBudgets = { ...categoryBudgets };

    if (isNaN(val) || val <= 0) {
      delete newBudgets[category];
    } else {
      newBudgets[category] = val;
    }

    await setCategoryBudgets(currentUser.uid, newBudgets);
    setEditingCat(null);
  };

  if (sortedCategories.length === 0) {
    return (
      <div className="cb-card cb-empty">
        <h2 className="cb-title"><span>🏷️</span> Category Budgets</h2>
        <p className="no-data">No expenses or budgets set this month.</p>
      </div>
    );
  }

  return (
    <div className="cb-card">
      <h2 className="cb-title">
        <span>🏷️</span> Category Budgets
      </h2>
      <div className="cb-list">
        {sortedCategories.map((cat) => {
          const spent = spentMap[cat] || 0;
          const budget = categoryBudgets[cat] || 0;
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const isOver = budget > 0 && spent > budget;
          const color = CATEGORY_COLORS[cat] || "#6b7280";

          return (
            <div className={`cb-row ${isOver ? "cb-over" : ""}`} key={cat}>
              <div className="cb-header">
                <div className="cb-label">
                  <span className="cb-icon">{CATEGORY_ICONS[cat] || "📦"}</span>
                  <span className="cb-name">{cat}</span>
                </div>

                {editingCat === cat ? (
                  <div className="cb-edit-group">
                    <input 
                      autoFocus
                      type="number" 
                      className="cb-input" 
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      placeholder="Amt"
                    />
                    <button className="cb-btn cb-save" onClick={() => handleSaveBudget(cat)}>✔️</button>
                    <button className="cb-btn cb-cancel" onClick={() => setEditingCat(null)}>❌</button>
                  </div>
                ) : (
                  <div className="cb-budget-display">
                    {budget > 0 ? (
                      <span className={`cb-budget-pill ${isOver ? "pill-alert" : ""}`}>
                        {fmt(spent)} / {fmt(budget)}
                      </span>
                    ) : (
                      <span className="cb-budget-pill pill-none">
                        {fmt(spent)} 
                      </span>
                    )}
                    <button 
                      className="cb-edit-btn" 
                      onClick={() => {
                        setEditingCat(cat);
                        setEditVal(budget > 0 ? budget : spent);
                      }}
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>

              {budget > 0 && (
                <div className="cb-bar-wrapper">
                  <div 
                    className={`cb-bar ${isOver ? "bg-red" : ""}`} 
                    style={{ width: `${pct}%`, backgroundColor: isOver ? "var(--danger)" : color }} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBudgets;
