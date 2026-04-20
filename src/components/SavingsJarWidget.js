import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  addSaving, deleteSaving,
  subscribeToSavings, setSavingsGoal, subscribeToSavingsGoal
} from "../services/savingsService";
import "./SavingsJarWidget.css";

const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const Jar = ({ pct, glow }) => {
  const fill = Math.min(Math.max(pct, 0), 100);
  return (
    <div className={`sjar-scene ${glow ? "sjar-glow" : ""}`}>

      <span className="sfc sfc-1">🪙</span>
      <span className="sfc sfc-2">🪙</span>
      <span className="sfc sfc-3">🥇</span>

      <div className="sjar-wrap">

        <div className="sjar-lid">
          <div className="sjar-knob" />
        </div>

        <div className="sjar-body">
          <div className="sjar-shine" />

          <div className="sjar-liquid" style={{ height: `${fill}%` }}>
            <div className="sjar-wave sjar-wave-1" />
            <div className="sjar-wave sjar-wave-2" />
          </div>

          {fill > 6 && (
            <div className="sjar-pct" style={{ bottom: `${Math.min(fill - 4, 78)}%` }}>
              {Math.round(fill)}%
            </div>
          )}

          {fill > 15 && <span className="sjc sjc-1">🪙</span>}
          {fill > 40 && <span className="sjc sjc-2">🪙</span>}
          {fill > 70 && <span className="sjc sjc-3">🥇</span>}
          {fill >= 100 && <span className="sjc sjc-4">🎉</span>}
        </div>
        <div className="sjar-base" />
      </div>

      {fill >= 100 && (
        <div className="sjar-achieved">🎉 Goal Achieved!</div>
      )}
    </div>
  );
};

const SavingsJarWidget = () => {
  const { currentUser } = useAuth();

  const [savings, setSavingsState] = useState([]);
  const [savingsGoal, setSavingsGoalState] = useState(0);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [glow, setGlow] = useState(false);

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
  const remaining  = Math.max(savingsGoal - totalSaved, 0);
  const pct = savingsGoal > 0 ? (totalSaved / savingsGoal) * 100 : 0;

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
      setGlow(true);
      setTimeout(() => setGlow(false), 1200);
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
    <div className="sjw-card">
      <div className="sjw-header">
        <h2 className="sjw-title"><span>🫙</span> Savings Jar</h2>
        <div className="sjw-goal-area">
          {editingGoal ? (
            <div className="sjw-goal-edit">
              <input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="sjw-goal-input"
                placeholder="Set goal..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSaveGoal()}
              />
              <button className="sjw-btn-save" onClick={handleSaveGoal}>✔</button>
              <button className="sjw-btn-cancel" onClick={() => setEditingGoal(false)}>✗</button>
            </div>
          ) : (
            <button className="sjw-goal-pill" onClick={() => setEditingGoal(true)}>
              🎯 Goal: {savingsGoal > 0 ? fmt(savingsGoal) : "Set Goal"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="sjw-loading">Loading savings...</div>
      ) : (
        <div className="sjw-body">

          <div className="sjw-left">
            <Jar pct={pct} glow={glow} />

            <div className="sjw-stats">
              <div className="sjw-stat gold">
                <span className="sjw-stat-label">Saved</span>
                <span className="sjw-stat-val">{fmt(totalSaved)}</span>
              </div>
              {savingsGoal > 0 && (
                <div className="sjw-stat">
                  <span className="sjw-stat-label">Remaining</span>
                  <span className="sjw-stat-val">{fmt(remaining)}</span>
                </div>
              )}
            </div>

            <form className="sjw-form" onSubmit={handleAddSaving}>
              <input
                type="number"
                className="sjw-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (₹)"
                min="1"
                required
              />
              <input
                type="date"
                className="sjw-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <input
                type="text"
                className="sjw-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
              />
              <button type="submit" className="sjw-drop-btn" disabled={submitting}>
                {submitting ? "..." : "🪙 Drop a Coin!"}
              </button>
            </form>
          </div>

          <div className="sjw-right">
            <p className="sjw-log-label">SAVINGS LOG</p>
            {savings.length === 0 ? (
              <div className="sjw-log-empty">
                <span>🫙</span>
                <p>No savings yet.<br />Drop your first coin!</p>
              </div>
            ) : (
              <div className="sjw-log">
                {savings.slice(0, 10).map((s) => (
                  <div className="sjw-log-item" key={s.id}>
                    <span className="sjw-log-icon">🪙</span>
                    <div className="sjw-log-info">
                      <p className="sjw-log-note">{s.note || "Savings deposit"}</p>
                      <p className="sjw-log-date">
                        {s.date
                          ? new Date(s.date).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : ""}
                      </p>
                    </div>
                    <span className="sjw-log-amount">+{fmt(s.amount)}</span>
                    <button
                      className="sjw-log-del"
                      onClick={() => {
                        if (window.confirm("Remove this saving?")) deleteSaving(s.id);
                      }}
                    >🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default SavingsJarWidget;
