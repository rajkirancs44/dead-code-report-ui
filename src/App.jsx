import React, { useState } from "react";
import DeadCodeReport from "./components/DeadCodeReport";
import PerformanceReport from "./components/PerformanceReport";
import UsageDashboard from "./components/UsageDashboard";
import "./styles.css";


export default function App() {
  const [activeTab, setActiveTab] = useState("deadcode");

  return (
    <div className="app-layout">
      <main className="main-content">
        <div className="tabs">
          <button
            className={activeTab === "deadcode" ? "tab active" : "tab"}
            onClick={() => setActiveTab("deadcode")}
          >
            Dead Code
          </button>
          <button
            className={activeTab === "performance" ? "tab active" : "tab"}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </button>
           <button
            className={activeTab === "dashboard" ? "tab active" : "tab"}
            onClick={() => setActiveTab("dashboard")}
          >
            Usage Metrics
          </button>
        </div>
        {activeTab === "deadcode" && <DeadCodeReport />}
        {activeTab === "performance" && <PerformanceReport />}
        {activeTab === "dashboard" && <UsageDashboard />}
      </main>
    </div>
  );
}