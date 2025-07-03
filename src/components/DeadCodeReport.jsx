import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function DeadCodeReport() {
  const [reportData, setReportData] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8081/api/deadcode/diff")
      .then((res) => res.json())
      .then(setReportData)
      .catch((err) => console.error("Failed to load report:", err));
  }, []);

  if (!reportData) return <div className="container">Loading...</div>;

  const summaryData = [
    { name: "Used", value: reportData.summary.usedMethods },
    { name: "Dead", value: reportData.summary.deadMethods }
  ];

  const filteredClasses = Object.entries(reportData.deadCodeByClass).filter(
    ([className]) => className.toLowerCase().includes(search.toLowerCase())
  );

  const downloadExcel = () => {
    const data = Object.entries(reportData.deadCodeByClass).flatMap(
      ([className, methods]) =>
        methods.map((method) => ({ Class: className, Method: method }))
    );
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DeadCodeReport");
    const blob = new Blob([
      XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    ]);
    saveAs(blob, "dead-code-report.xlsx");
  };

  return (
    <div className="report">
      <h1 className="section-title">Dead Code Report</h1>
      <div className="summary-row">
        <div className="card">Total Methods: {reportData.summary.totalMethods}</div>
        <div className="card green">Used: {reportData.summary.usedMethods}</div>
        <div className="card red">Dead: {reportData.summary.deadMethods}</div>
        <button onClick={downloadExcel} className="download-button">Download Excel</button>
      </div>

      <div className="card">
        <h2 className="section-title">Used vs Dead Methods</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={summaryData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="explorer">
        <div className="tree-view">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class..."
            className="search-box"
          />
          {filteredClasses.map(([className]) => (
            <div
              key={className}
              className={`tree-item ${className === selectedClass ? "selected" : ""}`}
              onClick={() => setSelectedClass(className)}
            >
              📄 {className}
            </div>
          ))}
        </div>
        <div className="method-list">
          <h3>Methods in {selectedClass ||""}</h3>
          <ul>
            {selectedClass &&
              reportData.deadCodeByClass[selectedClass].map((method, i) => (
                <li key={i} className="dead-method">❌ {method}</li>
              ))}
            {selectedClass &&
              reportData.usedCodeByClass?.[selectedClass]?.map((method, i) => (
                <li key={`used-${i}`} className="used-method">✔️ {method}</li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
