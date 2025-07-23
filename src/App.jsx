import React, { useState } from "react";
import DeadCodeReport from "./components/DeadCodeReport";
import PerformanceReport from "./components/PerformanceReport";
import UsageDashboard from "./components/UsageDashboard";
import { AppServiceProvider } from "./components/AppServiceProvider";
import { AppServiceHeader } from "./components/AppServiceHeader";
import "./styles.css";
import UsageReport from "./components/UsageReport";
import CodeOnboarding from "./components/CodeOnboarding";

export default function App() {
  const [activeTab, setActiveTab] = useState("deadcode");

  return (
    <AppServiceProvider>
      <div className="app-layout">
        {/* Always show the selector */}
      
        {/* Always show the tabs */}
        <main className="main-content">
            <AppServiceHeader />
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

          <button
            className={activeTab === "dashboard" ? "tab active" : "tab"}
            onClick={() => setActiveTab("usage")}
          >
            Usage Analysis
          </button>

          
          <button
            className={activeTab === "dashboard" ? "tab active" : "tab"}
            onClick={() => setActiveTab("onboard")}
          >
            Onboading New Application
          </button>
        </div>
          {activeTab === "deadcode" && <DeadCodeReport />}
          {activeTab === "performance" && <PerformanceReport />}
          {activeTab === "dashboard" && <UsageDashboard />}
          {activeTab === "usage" && <UsageReport />}
           {activeTab === "onboard" && <CodeOnboarding />}

        </main>
      </div>
    </AppServiceProvider>
  );
}
