import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, Toolbar, AppBar } from "@mui/material";
import { useAppService } from "./AppServiceProvider"; // import your context hook

export function AppServiceHeader() {
  const { appId, setAppId, appIds, serviceName, setServiceName, serviceNames } = useAppService();

  return (
    <AppBar position="sticky" color="default" elevation={2} sx={{ mb: 3 }}>
      <Toolbar>
        <FormControl sx={{ minWidth: 160, mr: 2 }} size="small">
          <InputLabel>Application</InputLabel>
          <Select
              value={appIds.includes(appId) ? appId : ""}
            label="Application"
            onChange={e => setAppId(e.target.value)}
          >
            {appIds.map(id => (
              <MenuItem value={id} key={id}>{id}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160, mr: 2 }} size="small" disabled={!serviceNames.length}>
          <InputLabel>Service</InputLabel>
          <Select
             value={serviceNames.includes(serviceName) ? serviceName : ""}
            label="Service"
            onChange={e => setServiceName(e.target.value)}
          >
            {serviceNames.map(name => (
              <MenuItem value={name} key={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
}
