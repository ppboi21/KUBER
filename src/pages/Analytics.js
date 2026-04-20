import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useExpenses } from "../context/ExpenseContext";
import Navbar from "../components/Navbar";
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar, Cell,
  ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useTheme } from "../context/ThemeContext";
import "./Analytics.css";

const CATEGORY_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const Analytics = () => {
  const navigate = useNavigate();
  const { expenses, monthlyBudget, categoryBudgets: rawCategoryBudgets, recurringExpenses, loading } = useExpenses();
  const categoryBudgets = rawCategoryBudgets || {};
  const { darkMode } = useTheme();

  const axisColor = darkMode ? "#8b92a9" : "#64748b";
  const gridColor = darkMode ? "#2a2d3e" : "#e2e8f0";

  const {
    lineData,
    barData,
    areaData,
    insights
  } = useMemo(() => {
    if (!expenses.length) return { lineData: [], barData: [], areaData: [], insights: [] };

    const now = new Date();
    const insightsList = [];

    const lineDataArr = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = expenses
        .filter(e => {
          const ed = new Date(e.date);
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      lineDataArr.push({ month: MONTHS[d.getMonth()], total });
    }

    const catMap = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});
    const barDataArr = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));

    const thisYearExp = expenses.filter(e => new Date(e.date).getFullYear() === now.getFullYear());
    let cumulative = 0;
    const areaDataArr = [];
    for (let i = 0; i <= now.getMonth(); i++) {
      const monthTotal = thisYearExp
        .filter(e => new Date(e.date).getMonth() === i)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      cumulative += monthTotal;
      areaDataArr.push({ month: MONTHS[i], spent: cumulative });
    }

    const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);

    const thisWeekTotal = expenses.filter(e => new Date(e.date) >= oneWeekAgo).reduce((acc, e) => acc + Number(e.amount), 0);
    const lastWeekTotal = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= twoWeeksAgo && d < oneWeekAgo;
    }).reduce((acc, e) => acc + Number(e.amount), 0);

    if (thisWeekTotal > lastWeekTotal && lastWeekTotal > 0) {
      const pct = Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);
      insightsList.push({ icon: "🔥", text: `You spent ${pct}% more this week compared to last week.` });
    } else if (thisWeekTotal < lastWeekTotal && thisWeekTotal > 0) {
      const pct = Math.round(((lastWeekTotal - thisWeekTotal) / lastWeekTotal) * 100);
      insightsList.push({ icon: "📉", text: `Great! You spent ${pct}% less this week compared to last week.` });
    }

    const thisMonthTotal = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((acc, e) => acc + Number(e.amount), 0);

    if (monthlyBudget > 0) {
      const usage = (thisMonthTotal / monthlyBudget) * 100;
      if (usage <= 50) {
        insightsList.push({ icon: "✅", text: `You've only used ${Math.round(usage)}% of your monthly budget so far.` });
      } else if (usage > 100) {
        insightsList.push({ icon: "⚠️", text: `You have exceeded your overall monthly budget by ${fmt(thisMonthTotal - monthlyBudget)}.` });
      } else if (usage > 80) {
        insightsList.push({ icon: "⚠️", text: `Caution: You've used ${Math.round(usage)}% of your monthly budget.` });
      }
    }

    const thisMonthCatMap = thisYearExp
        .filter(e => new Date(e.date).getMonth() === now.getMonth())
        .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});

    Object.entries(categoryBudgets || {}).forEach(([cat, budget]) => {
      const spent = thisMonthCatMap[cat] || 0;
      if (spent > budget) {
        const pctOver = Math.round(((spent - budget) / budget) * 100);
        insightsList.push({ icon: "🚨", text: `${cat} is ${pctOver}% over its category budget!` });
      }
    });

    const dayMap = expenses.reduce((acc, e) => {
      const day = new Date(e.date).getDay();
      acc[day] = (acc[day] || 0) + Number(e.amount);
      return acc;
    }, {});
    if (Object.keys(dayMap).length > 0) {
      const topDayIdx = parseInt(Object.keys(dayMap).reduce((a, b) => dayMap[a] > dayMap[b] ? a : b));
      insightsList.push({ icon: "🗓️", text: `Your heaviest spending day is historically ${DAYS[topDayIdx]}.` });
    }

    const activeRecurring = recurringExpenses?.filter(r => r.isActive).length || 0;
    if (activeRecurring > 0) {
      insightsList.push({ icon: "💡", text: `You have ${activeRecurring} active recurring expense(s) tracked.` });
    }

    if (insightsList.length === 0 && expenses.length > 0) {
       insightsList.push({ icon: "✨", text: "Keep logging expenses to generate more insights!" });
    }

    return { lineData: lineDataArr, barData: barDataArr, areaData: areaDataArr, insights: insightsList };
  }, [expenses, monthlyBudget, categoryBudgets, recurringExpenses]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="analytics-tooltip">
        <p className="at-label">{label}</p>
        <p className="at-value">₹{Number(payload[0]?.value).toLocaleString("en-IN")}</p>
      </div>
    );
  };

  return (
    <div className="analytics-page">
      <Navbar />
      <main className="analytics-main">
        <div className="analytics-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>
          <h1 className="analytics-title">Analytics</h1>
        </div>

        {loading ? (
          <div className="loader-wrap"><div className="spinner" /><p>Analyzing your data...</p></div>
        ) : expenses.length === 0 ? (
          <div className="empty-wrap"><p>No data to analyze yet. Add some expenses first!</p></div>
        ) : (
          <div className="analytics-content">

            <div className="insights-panel">
              <h2 className="section-title"><span>🤖</span> Smart Insights</h2>
              <div className="insights-grid">
                {insights.map((ins, i) => (
                  <div className="insight-card" key={i}>
                    <span className="insight-icon">{ins.icon}</span>
                    <p className="insight-text">{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-charts">

              <div className="chart-container large">
                <h3 className="chart-card-title">12-Month Spending Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={lineData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => v>=1000?`₹${v/1000}k`:`₹${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    {monthlyBudget > 0 && (
                      <ReferenceLine
                        y={monthlyBudget}
                        stroke="#ef4444"
                        strokeDasharray="6 3"
                        strokeWidth={2}
                        label={{
                          value: `Budget ₹${monthlyBudget.toLocaleString("en-IN")}`,
                          position: "insideTopRight",
                          fill: "#ef4444",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--bg)", stroke: "var(--primary)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 className="chart-card-title">All-time Top Categories</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                    <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v>=1000?`${v/1000}k`:v} />
                    <YAxis dataKey="name" type="category" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                      {barData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 className="chart-card-title">Cumulative Spending (This Year)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => v>=1000?`₹${v/1000}k`:`₹${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="spent" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analytics;
