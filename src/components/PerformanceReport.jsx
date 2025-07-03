import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function PerformanceReport() {
  const [reportData, setReportData] = useState(null);
  const [sortKey, setSortKey] = useState("avgTimeMs");

  useEffect(() => {
    fetch("http://localhost:8081/api/deadcode/stats")
      .then((res) => res.json())
      .then(setReportData)
      .catch((err) => console.error("Failed to load performance report:", err));
  }, []);

  if (!reportData || !reportData.methodStats) return <div className="container">Loading...</div>;

  const methodStatsArray = Object.entries(reportData.methodStats).map(([fullMethod, stats]) => {
    const [className, method] = fullMethod.split("#");
    return {
      className,
      method,
      count: stats.count,
      avgTimeMs: stats.avgTimeMs
    };
  });

  const topMethods = [...methodStatsArray]
    .sort((a, b) => b[sortKey] - a[sortKey])
    .slice(0, 10);

  return (
    <div className="report">
      <h1 className="section-title">Performance Report</h1>
      <div className="dropdown-row">
        <label>Sort by:</label>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="avgTimeMs">Top 10 slowest methods</option>
          <option value="count">Top 10 most called methods</option>
        </select>
      </div>

      <div className="card">
        <table className="perf-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Method</th>
              <th>Count</th>
              <th>Avg Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {topMethods.map((row, idx) => (
              <tr key={idx}>
                <td>{row.className}</td>
                <td>{row.method}</td>
                <td>{row.count}</td>
                <td>{row.avgTimeMs.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="section-title">Count vs. Avg Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topMethods}>
            <XAxis dataKey="method" />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Count" />
            <Bar yAxisId="right" dataKey="avgTimeMs" fill="#82ca9d" name="Avg Time (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}