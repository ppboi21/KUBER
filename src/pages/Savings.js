import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  addSaving, deleteSaving,
  subscribeToSavings, setSavingsGoal, subscribeToSavingsGoal
} from "../services/savingsService";
import Navbar from "../components/Navbar";
import "./Savings.css";

const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const SavingsJar = ({ pct, glow }) => {
  const fill = Math.min(Math.max(pct, 0), 100);
  return (
    <div className={`jar-scene ${glow ? "jar-glow" : ""}`}>

      <div className="fc fc-1">🪙</div>
      <div className="fc fc-2">🪙</div>
      <div className="fc fc-3">🪙</div>
      <div className="fc fc-4">🥇</div>

      <div className="jar-wrap">

        <div className="jar-lid">
          <div className="jar-lid-knob" />
        </div>

        <div className="jar-body">

          <div className="jar-shine" />

          <div className="jar-liquid" style={{ height: `${fill}%` }}>
            <div className="wave wave-1" />
            <div className="wave wave-2" />
          </div>

          {fill > 5 && (
            <div className="jar-pct" style={{ bottom: `${Math.min(fill - 4, 80)}%` }}>
              {Math.round(fill)}%
            </div>
          )}

          {fill > 10 && <div className="jar-coin jc-1">🪙</div>}
          {fill > 30 && <div className="jar-coin jc-2">🪙</div>}
          {fill > 50 && <div className="jar-coin jc-3">🪙</div>}
          {fill > 75 && <div className="jar-coin jc-4">🥇</div>}
          {fill >= 100 && <div className="jar-coin jc-5">🎉</div>}
        </div>

        <div className="jar-base" />
      </div>

      {fill >= 100 && (
        <div className="goal-achieved">🎉 Goal Achieved!</div>
      )}
    </div>
  );
};

const Savings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [savings, setSavingsState] = useState([]);
  const [savingsGoal, setSavingsGoalState] = useState(0);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [glowJar, setGlowJar] = useState(false);

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    const unsubSavings = subscribeToSavings(currentUser.uid, (data) => {
      setSavingsState(data);
      setLoading(false);
    });
    const unsubGoal = subscribeToSavingsGoal(currentUser.uid, (goal) => {
      setSavingsGoalState(goal);
      setGoalInput(goal ? String(goal) : "");
    });
    return () => { unsubSavings(); unsubGoal(); };
  }, [currentUser.uid]);

  const totalSaved = savings.reduce((sum, s) => sum + Number(s.amount), 0);
  const remaining = Math.max(savingsGoal - totalSaved, 0);
  const pct = savingsGoal > 0 ? (totalSaved / savingsGoal) * 100 : Math.min(totalSaved / 1000 * 10, 80);

  const handleAddSaving = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    setSubmitting(true);
    try {
      await addSaving(currentUser.uid, {
        amount: parseFloat(amount),
        note: note.trim(),
        date,
      });
      setAmount("");
      setNote("");
      setDate(new Date().toISOString().split("T")[0]);
      setGlowJar(true);
      setTimeout(() => setGlowJar(false), 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveGoal = async () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val) && val > 0) await setSavingsGoal(currentUser.uid, val);
    setEditingGoal(false);
  };

  return (
    <div className="savings-page">
      <Navbar />
      <main className="savings-main">
        <div className="savings-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <div>
            <h1 className="savings-title">💰 Savings Jar</h1>
            <p className="savings-subtitle">Watch your jar fill up as you save more!</p>
          </div>
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner" /><p>Loading your savings...</p></div>
        ) : (
          <>

            <div className="s-stats-grid">
              <div className="s-stat-card" style={{ "--sc": "#f59e0b" }}>
                <span className="s-stat-icon">🪙</span>
                <div>
                  <p className="s-stat-label">TOTAL SAVED</p>
                  <p className="s-stat-value">{fmt(totalSaved)}</p>
                </div>
              </div>
              <div className="s-stat-card" style={{ "--sc": "#6366f1" }}>
                <span className="s-stat-icon">🎯</span>
                <div>
                  <p className="s-stat-label">SAVINGS GOAL</p>
                  {editingGoal ? (
                    <div className="goal-edit-row">
                      <input
                        type="number"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="goal-input"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
                      />
                      <button className="goal-save-btn" onClick={handleSaveGoal}>✔</button>
                      <button className="goal-cancel-btn" onClick={() => setEditingGoal(false)}>✗</button>
                    </div>
                  ) : (
                    <p
                      className="s-stat-value clickable"
                      onClick={() => setEditingGoal(true)}
                      title="Click to set goal"
                    >
                      {savingsGoal > 0 ? fmt(savingsGoal) : "Set Goal →"}
                    </p>
                  )}
                </div>
              </div>
              <div className="s-stat-card" style={{ "--sc": "#10b981" }}>
                <span className="s-stat-icon">📈</span>
                <div>
                  <p className="s-stat-label">PROGRESS</p>
                  <p className="s-stat-value">
                    {savingsGoal > 0 ? `${Math.min(Math.round(pct), 100)}%` : "—"}
                  </p>
                </div>
              </div>
              <div className="s-stat-card" style={{ "--sc": "#ec4899" }}>
                <span className="s-stat-icon">🏁</span>
                <div>
                  <p className="s-stat-label">REMAINING</p>
                  <p className="s-stat-value">
                    {savingsGoal > 0 ? fmt(remaining) : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="savings-layout">

              <div className="jar-col">
                <SavingsJar pct={pct} glow={glowJar} />

                <div className="add-savings-card">
                  <h3 className="add-savings-title">🪙 Drop a Coin</h3>
                  <form onSubmit={handleAddSaving} className="add-savings-form">
                    <div className="s-form-row">
                      <div className="s-form-group">
                        <label>Amount (₹)</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="500"
                          min="1"
                          required
                        />
                      </div>
                      <div className="s-form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="s-form-group">
                      <label>Note (optional)</label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Monthly savings, bonus..."
                      />
                    </div>
                    <button type="submit" className="drop-coin-btn" disabled={submitting}>
                      {submitting ? "Adding..." : "🪙 Drop a Coin!"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="log-col">
                <h2 className="log-title">📋 Savings Log</h2>
                {savings.length === 0 ? (
                  <div className="log-empty">
                    <span className="log-empty-icon">🫙</span>
                    <p>No savings yet.<br />Drop your first coin!</p>
                  </div>
                ) : (
                  <div className="savings-log">
                    {savings.map((s, i) => (
                      <div className="log-item" key={s.id} style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="log-coin-icon">🪙</div>
                        <div className="log-info">
                          <p className="log-note">{s.note || "Savings deposit"}</p>
                          <p className="log-date">
                            {s.date ? new Date(s.date).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            }) : ""}
                          </p>
                        </div>
                        <span className="log-amount">+{fmt(s.amount)}</span>
                        <button
                          className="log-del"
                          onClick={() => { if (window.confirm("Remove this saving?")) deleteSaving(s.id); }}
                          title="Delete"
                        >🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Savings;
