import React, { useState } from "react";
import DeadCodeReport from "./components/DeadCodeReport";
import PerformanceReport from "./components/PerformanceReport";
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
        </div>
        {activeTab === "deadcode" && <DeadCodeReport />}
        {activeTab === "performance" && <PerformanceReport />}
      </main>
    </div>
  );
}