import React from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import Navbar from "../components/Navbar";
import { updateRecurring, deleteRecurring } from "../services/expenseService";
import "./Recurring.css";

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`;

const Recurring = () => {
  const navigate = useNavigate();
  const { recurringExpenses, loading } = useExpenses();

  const handleToggle = async (id, currentStatus) => {
    await updateRecurring(id, { isActive: !currentStatus });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this recurring expense permanently?")) {
      await deleteRecurring(id);
    }
  };

  const activeCount = recurringExpenses.filter(r => r.isActive).length;
  const totalMonthly = recurringExpenses
    .filter(r => r.isActive)
    .reduce((sum, r) => {

      if (r.frequency === "Monthly") return sum + Number(r.amount);
      if (r.frequency === "Weekly") return sum + (Number(r.amount) * 4);
      if (r.frequency === "Yearly") return sum + (Number(r.amount) / 12);
      return sum;
    }, 0);

  return (
    <div className="recurring-page">
      <Navbar />
      <main className="recurring-main">
        <div className="recurring-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
          <h1 className="recurring-title">Recurring Expenses</h1>
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner" /><p>Loading recurring expenses...</p></div>
        ) : (
          <>

            <div className="recurring-stats">
              <div className="r-stat-card">
                <span className="r-stat-icon">🔄</span>
                <div className="r-stat-info">
                  <p className="r-stat-label">ACTIVE SUBSCRIPTIONS / EMIs</p>
                  <p className="r-stat-value">{activeCount}</p>
                </div>
              </div>
              <div className="r-stat-card">
                <span className="r-stat-icon">💸</span>
                <div className="r-stat-info">
                  <p className="r-stat-label">APPROX. MONTHLY OBLIGATION</p>
                  <p className="r-stat-value">{fmt(totalMonthly)}</p>
                </div>
              </div>
            </div>

            <div className="recurring-list">
              <h2 className="section-title"><span>🗓️</span> Manage Recurring</h2>

              {recurringExpenses.length === 0 ? (
                <div className="r-empty">
                  No recurring expenses found. You can add them from the "Add Expense" form on the Dashboard by checking "This is a recurring expense".
                </div>
              ) : (
                <div className="r-grid">
                  {recurringExpenses.map(r => (
                    <div className={`r-card ${!r.isActive ? "inactive" : ""}`} key={r.id}>
                      <div className="r-card-header">
                        <div>
                          <h3 className="r-card-title">{r.description || "Recurring Expense"}</h3>
                          <span className="r-category-chip">{r.category}</span>
                        </div>
                        <div className="r-card-amount">{fmt(r.amount)}</div>
                      </div>

                      <div className="r-card-body">
                        <div className="r-info-row">
                          <span className="r-info-label">Frequency:</span>
                          <span className="r-info-value">{r.frequency}</span>
                        </div>
                        {r.nextDueDate && (
                          <div className="r-info-row">
                            <span className="r-info-label">Next Auto-Charge:</span>
                            <span className="r-info-value" style={{ color: "var(--primary)", fontWeight: 600 }}>
                              {new Date(r.nextDueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        )}
                        {r.endDate ? (
                          <div className="r-info-row">
                            <span className="r-info-label">Ends On:</span>
                            <span className="r-info-value" style={{ color: "var(--warning)" }}>
                              {new Date(r.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        ) : (
                          <div className="r-info-row">
                            <span className="r-info-label">Duration:</span>
                            <span className="r-info-value">Indefinite</span>
                          </div>
                        )}
                        {r.dayOfMonth && (
                          <div className="r-info-row">
                            <span className="r-info-label">Billing Day:</span>
                            <span className="r-info-value">{r.dayOfMonth}</span>
                          </div>
                        )}
                      </div>

                      <div className="r-card-footer">
                        <button 
                          className={`r-btn ${r.isActive ? "btn-pause" : "btn-play"}`}
                          onClick={() => handleToggle(r.id, r.isActive)}
                        >
                          {r.isActive ? "⏸ Pause" : "▶ Resume"}
                        </button>
                        <button className="r-btn btn-delete" onClick={() => handleDelete(r.id)}>
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Recurring;
