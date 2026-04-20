import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useExpenses } from "../context/ExpenseContext";
import Navbar from "../components/Navbar";
import "./Profile.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const StatTile = ({ icon, value, label, color }) => (
  <div className="profile-tile">
    <div className="tile-icon-wrap" style={{ background: color }}>
      <span className="tile-icon">{icon}</span>
    </div>
    <p className="tile-value">{value}</p>
    <p className="tile-label">{label}</p>
  </div>
);

const InfoRow = ({ label, value, mono }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className={`info-value ${mono ? "mono" : ""}`}>{value}</span>
  </div>
);

const Profile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { expenses, loading } = useExpenses();

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalTxns  = expenses.length;

  const monthSet = new Set(
    expenses.map((e) => {
      const d = new Date(e.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    })
  );
  const activeMonths = monthSet.size;

  const monthMap = expenses.reduce((acc, e) => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    acc[key] = (acc[key] || 0) + Number(e.amount);
    return acc;
  }, {});
  const bestEntry = Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0];
  const bestMonth = bestEntry
    ? (() => {
        const [yr, mo] = bestEntry[0].split("-");
        return `${MONTHS[Number(mo)].slice(0, 3)} ${yr}`;
      })()
    : "—";
  const bestMonthAmt = bestEntry ? bestEntry[1] : 0;

  const avgPerMonth = activeMonths > 0 ? totalSpent / activeMonths : 0;

  const biggest = expenses.reduce(
    (max, e) => (Number(e.amount) > max ? Number(e.amount) : max),
    0
  );

  const catMap = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const uid = currentUser?.uid ?? "";
  const shortUid = uid.length > 12 ? uid.slice(0, 12) + "…" : uid;

  const getInitial = (u) =>
    u?.displayName?.[0]?.toUpperCase() || u?.email?.[0]?.toUpperCase() || "U";

  const fmt = (n) =>
    "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-main">

        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <h1 className="profile-heading">Profile &amp; Insights</h1>
        </div>

        {loading ? (
          <div className="loader-wrap">
            <div className="spinner" />
            <p>Loading your profile…</p>
          </div>
        ) : (
          <>

            <section className="profile-section">
              <p className="section-label">👤 ACCOUNT</p>
              <div className="profile-card">

                <div className="user-row">
                  <div className="profile-avatar">{getInitial(currentUser)}</div>
                  <div>
                    <p className="profile-name">
                      {currentUser?.displayName || "User"}
                    </p>
                    <p className="profile-email">{currentUser?.email}</p>
                  </div>
                </div>
                <div className="card-divider" />
                <InfoRow label="Member Since" value={memberSince} />
                <div className="card-divider" />
                <InfoRow label="User ID" value={shortUid} mono />
              </div>
            </section>

            <section className="profile-section">
              <p className="section-label">📊 ALL-TIME INSIGHTS</p>
              <div className="tiles-grid">
                <StatTile
                  icon="💰"
                  value={fmt(totalSpent)}
                  label="TOTAL SPENT"
                  color="linear-gradient(135deg,#6366f1,#4f46e5)"
                />
                <StatTile
                  icon="🧾"
                  value={totalTxns}
                  label="TRANSACTIONS"
                  color="linear-gradient(135deg,#f59e0b,#d97706)"
                />
                <StatTile
                  icon="📅"
                  value={activeMonths}
                  label="ACTIVE MONTHS"
                  color="linear-gradient(135deg,#06b6d4,#0891b2)"
                />
                <StatTile
                  icon="🏆"
                  value={bestMonth}
                  label={`BEST MONTH${bestMonthAmt ? ` (${fmt(bestMonthAmt)})` : ""}`}
                  color="linear-gradient(135deg,#f97316,#ea580c)"
                />
                <StatTile
                  icon="📈"
                  value={fmt(avgPerMonth)}
                  label="AVG / MONTH"
                  color="linear-gradient(135deg,#10b981,#059669)"
                />
                <StatTile
                  icon="💸"
                  value={fmt(biggest)}
                  label="BIGGEST EXPENSE"
                  color="linear-gradient(135deg,#ec4899,#db2777)"
                />
              </div>
            </section>

            <section className="profile-section">
              <p className="section-label">🏅 SPENDING HABITS</p>
              <div className="profile-card">
                <InfoRow label="Top Category" value={topCat} />
                <div className="card-divider" />
                <InfoRow label="Total Categories Used" value={Object.keys(catMap).length} />
                <div className="card-divider" />
                <InfoRow
                  label="Avg Transaction"
                  value={totalTxns ? fmt(totalSpent / totalTxns) : "₹0"}
                />
              </div>
            </section>

            <section className="profile-section">
              <p className="section-label">🛡 ABOUT</p>
              <div className="profile-card">
                <InfoRow label="App"     value="KUBE₹" />
                <div className="card-divider" />
                <InfoRow label="Version" value="1.0.0" />
                <div className="card-divider" />
                <InfoRow label="Stack"   value="React 19 + Firebase" />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
