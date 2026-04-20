import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import { setMonthlyBudget, processRecurringExpenses } from "../services/expenseService";
import Navbar from "../components/Navbar";
import AddExpenseForm from "../components/AddExpenseForm";
import ExpenseList from "../components/ExpenseList";
import CategoryBudgets from "../components/CategoryBudgets";
import Charts from "../components/Charts";
import SavingsJarWidget from "../components/SavingsJarWidget";
import "./Dashboard.css";

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ "--accent-color": color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { expenses, monthlyBudget: budget, recurringExpenses, loading } = useExpenses();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const hasProcessed = useRef(false); 

  useEffect(() => {
    if (budget > 0) setBudgetInput(String(budget));
  }, [budget]);

  useEffect(() => {
    if (loading || hasProcessed.current) return;
    if (!recurringExpenses.length) return;
    hasProcessed.current = true;
    processRecurringExpenses(currentUser.uid, recurringExpenses, expenses);
  }, [loading, recurringExpenses, expenses, currentUser.uid]);

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      await setMonthlyBudget(currentUser.uid, val);
    }
    setIsEditingBudget(false);
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const now = new Date();
  const thisMonthTotal = expenses
    .filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const topCategory = (() => {
    const map = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "—";
  })();

  const fmt = (n) =>
    "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const isOverBudget = budget > 0 && thisMonthTotal > budget;

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Track and manage all your expenses in one place.
            </p>
          </div>
          <div className="budget-controls">
            {isEditingBudget ? (
              <div className="budget-edit-row">
                <input
                  type="number"
                  className="budget-input"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Set Monthly Budget"
                  min="0"
                />
                <button className="save-budget-btn" onClick={handleSaveBudget}>Save</button>
                <button className="cancel-budget-btn" onClick={() => setIsEditingBudget(false)}>Cancel</button>
              </div>
            ) : (
              <div className="budget-display-row">
                <span className="budget-text">
                  Budget: <strong>{budget > 0 ? fmt(budget) : "Not Set"}</strong>
                </span>
                <button className="edit-budget-btn" onClick={() => setIsEditingBudget(true)}>
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {isOverBudget && (
          <div className="budget-alert">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Budget Exceeded!</strong> You have spent {fmt(thisMonthTotal)} this month, overriding your set budget of {fmt(budget)}.
            </div>
          </div>
        )}

        {loading ? (
          <div className="loader-wrap">
            <div className="spinner" />
            <p>Loading your expenses…</p>
          </div>
        ) : (
          <>

            <div className="stats-grid">
              <StatCard icon="💰" label="Total Spending"  value={fmt(total)}         color="#6366f1" />
              <StatCard 
                icon="📅" 
                label="This Month"      
                value={budget > 0 ? `${fmt(thisMonthTotal)} / ${fmt(budget)}` : fmt(thisMonthTotal)} 
                color={isOverBudget ? "#ef4444" : "#10b981"} 
              />
              <StatCard icon="🧾" label="Transactions"    value={expenses.length}     color="#f59e0b" />
              <StatCard icon="🏆" label="Top Category"    value={topCategory}         color="#ec4899" />
            </div>

            <Charts expenses={expenses} budget={budget} />

            <div className="dashboard-grid">
              <div className="col-left">
                <AddExpenseForm />
                <CategoryBudgets />
              </div>
              <div className="col-right">
                <ExpenseList expenses={expenses} />
              </div>
            </div>

            <SavingsJarWidget />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
