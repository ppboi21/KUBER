import React from "react";
import "./CategorySummary.css";

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

const CategorySummary = ({ expenses }) => {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const categoryMap = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return (
      <div className="summary-card">
        <h2 className="summary-title">
          <span>📊</span> Category Breakdown
        </h2>
        <p className="no-data">No data to display yet.</p>
      </div>
    );
  }

  return (
    <div className="summary-card">
      <h2 className="summary-title">
        <span>📊</span> Category Breakdown
      </h2>
      <div className="category-list">
        {sorted.map(([cat, amount]) => {
          const pct = total > 0 ? (amount / total) * 100 : 0;
          const color = CATEGORY_COLORS[cat] || "#6b7280";
          return (
            <div className="category-row" key={cat}>
              <div className="cat-label">
                <span className="cat-icon">
                  {CATEGORY_ICONS[cat] || "📦"}
                </span>
                <span className="cat-name">{cat}</span>
              </div>
              <div className="cat-bar-wrap">
                <div
                  className="cat-bar"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
              <div className="cat-meta">
                <span className="cat-amount">
                  ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </span>
                <span className="cat-pct">{pct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySummary;
