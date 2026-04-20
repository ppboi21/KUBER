import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useExpenses } from "../context/ExpenseContext";
import { exportToCSV } from "../services/expenseService";
import "./Sidebar.css";

const ACCENT_OPTIONS = [
  { key: "green", color: "#10b981" },
  { key: "cyan", color: "#06b6d4" },
  { key: "violet", color: "#6366f1" },
  { key: "orange", color: "#f97316" },
  { key: "pink", color: "#ec4899" },
  { key: "red", color: "#ef4444" },
  { key: "amber", color: "#f59e0b" },
];

const Sidebar = ({ open, onClose }) => {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDark, compactView, toggleCompact, accentKey, setAccent } = useTheme();
  const { expenses } = useExpenses();
  const navigate = useNavigate();
  const sidebarRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/login");
  };

  const goTo = (path) => { onClose(); navigate(path); };

  const handleExportCSV = () => {
    const now = new Date();
    const filename = `expenses_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}.csv`;
    exportToCSV(expenses, filename);
    onClose();
  };

  const getInitials = (user) =>
    user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <>

      <div className={`sidebar-overlay ${open ? "visible" : ""}`} onClick={onClose} />

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} ref={sidebarRef}>

        <button className="sb-user sb-user-btn" onClick={() => goTo("/profile")}>
          <div className="sb-avatar">{getInitials(currentUser)}</div>
          <div className="sb-user-info">
            <p className="sb-name">
              {currentUser?.displayName || "User"}
            </p>
            <p className="sb-email">{currentUser?.email}</p>
          </div>
          <span className="sb-row-chevron" style={{ marginLeft: "auto" }}>›</span>
        </button>

        <div className="sb-section-label">NAVIGATION</div>
        <button className="sb-row sb-nav-item" onClick={() => goTo("/dashboard")}>
          <span className="sb-row-icon">🏠</span>
          <span>Dashboard</span>
          <span className="sb-row-chevron">›</span>
        </button>
        <button className="sb-row sb-nav-item" onClick={() => goTo("/analytics")}>
          <span className="sb-row-icon">📊</span>
          <span>Analytics</span>
          <span className="sb-row-chevron">›</span>
        </button>
        <button className="sb-row sb-nav-item" onClick={() => goTo("/recurring")}>
          <span className="sb-row-icon">🔄</span>
          <span>Recurring</span>
          <span className="sb-row-chevron">›</span>
        </button>
        <button className="sb-row sb-nav-item" onClick={() => goTo("/savings")}>
          <span className="sb-row-icon">🫙</span>
          <span>Savings Jar</span>
          <span className="sb-row-chevron">›</span>
        </button>
        <button className="sb-row sb-nav-item" onClick={() => goTo("/profile")}>
          <span className="sb-row-icon">👤</span>
          <span>Profile &amp; Insights</span>
          <span className="sb-row-chevron">›</span>
        </button>

        <div className="sb-section-label">APPEARANCE</div>

        <div className="sb-row">
          <span className="sb-row-icon">☀️</span>
          <span>Light Mode</span>
          <div
            className={`sb-toggle ${!darkMode ? "sb-toggle-on" : ""}`}
            onClick={toggleDark}
            role="switch"
            aria-checked={!darkMode}
          >
            <div className="sb-toggle-thumb" />
          </div>
        </div>

        <div className="sb-row sb-accent-row">
          <span className="sb-row-icon">🎨</span>
          <span>Accent Color</span>
          <div className="sb-accent-dots">
            {ACCENT_OPTIONS.map(({ key, color }) => (
              <button
                key={key}
                className={`sb-dot ${accentKey === key ? "sb-dot-active" : ""}`}
                style={{ background: color }}
                onClick={() => setAccent(key)}
                title={key}
              />
            ))}
          </div>
        </div>

        <div className="sb-section-label">DATA</div>
        <button className="sb-row sb-nav-item" onClick={handleExportCSV}>
          <span className="sb-row-icon">⬇️</span>
          <span>Export Month CSV</span>
          <span className="sb-row-chevron">›</span>
        </button>
        <button className="sb-row sb-nav-item" onClick={onClose}>
          <span className="sb-row-icon">🗑️</span>
          <span>Reset All Data</span>
          <span className="sb-row-chevron">›</span>
        </button>

        <div className="sb-footer">
          <p className="sb-version">VERSION 1.0.0</p>
          <button className="sb-signout" onClick={handleLogout}>
            ⇥ Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
