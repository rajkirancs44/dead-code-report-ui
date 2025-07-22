import React, { createContext, useContext, useState, useEffect } from "react";

const AppServiceContext = createContext();

export function useAppService() {
  return useContext(AppServiceContext);
}

export function AppServiceProvider({ children }) {
  const [appId, setAppId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [appIds, setAppIds] = useState([]);
  const [serviceNames, setServiceNames] = useState([]);

  // Load available appIds on mount
  useEffect(() => {
    fetch("http://localhost:8081/api/meta/apps")
      .then(res => res.json())
      .then(setAppIds);
  }, []);

  // Load service names whenever appId changes
  useEffect(() => {
    if (appId) {
      fetch(`http://localhost:8081/api/meta/apps/${encodeURIComponent(appId)}/services`)
        .then(res => res.json())
        .then(setServiceNames);
    } else {
      setServiceNames([]);
      setServiceName("");
    }
  }, [appId]);

  // Auto-select first app/service if present
  useEffect(() => {
    if (appIds.length && !appId) setAppId(appIds[0]);
  }, [appIds]);
  useEffect(() => {
    if (serviceNames.length && !serviceName) setServiceName(serviceNames[0]);
  }, [serviceNames]);

  return (
    <AppServiceContext.Provider value={{
      appId, setAppId, appIds,
      serviceName, setServiceName, serviceNames
    }}>
      {children}
    </AppServiceContext.Provider>
  );
}
