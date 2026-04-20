import React, { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ReferenceLine,
} from "recharts";
import { useTheme } from "../context/ThemeContext";
import "./Charts.css";

const CATEGORY_COLORS = [
  "#6366f1","#10b981","#f59e0b","#ec4899",
  "#06b6d4","#f97316","#8b5cf6","#14b8a6","#6b7280",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const renderCustomLabel = ({ name, percent }) =>
  percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : null;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="ct-label">{label || payload[0]?.name}</p>
      <p className="ct-value">₹{Number(payload[0]?.value).toLocaleString("en-IN")}</p>
    </div>
  );
};

const Charts = ({ expenses, budget = 0 }) => {
  const { darkMode } = useTheme();
  const axisColor = darkMode ? "#71788e" : "#64748b";
  const gridColor = darkMode ? "#1e1f2a" : "#e2e8f0";

  const barData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const total = expenses
        .filter((e) => {
          const ed = new Date(e.date);
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);
      return { month: MONTHS[d.getMonth()], total };
    });
  }, [expenses]);

  const pieData = useMemo(() => {
    const now = new Date();
    const map = expenses
      .filter((e) => {
        const ed = new Date(e.date);
        return ed.getMonth() === now.getMonth() && ed.getFullYear() === now.getFullYear();
      })
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {});
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const hasBarData = barData.some((d) => d.total > 0);
  const hasPieData = pieData.length > 0;

  return (
    <div className="charts-grid">

      <div className="chart-card">
        <h3 className="chart-title">📈 Monthly Spending (Last 6 Months)</h3>
        {hasBarData ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={32} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: axisColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
              {budget > 0 && (
                <ReferenceLine
                  y={budget}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{
                    value: `Budget ₹${budget.toLocaleString("en-IN")}`,
                    position: "insideTopRight",
                    fill: "#ef4444",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
              <Bar
                dataKey="total"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">No data yet — add some expenses!</div>
        )}
      </div>

      <div className="chart-card">
        <h3 className="chart-title">🥧 This Month by Category</h3>
        {hasPieData ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ color: axisColor, fontSize: "0.78rem" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">No expenses this month yet!</div>
        )}
      </div>
    </div>
  );
};

export default Charts;
