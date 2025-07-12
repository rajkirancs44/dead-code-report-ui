import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, FormGroup, FormControlLabel, Checkbox, Grid, Divider, Paper
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";

const METRICS = [
  { key: "cpuLoad", label: "Process CPU (%)", format: v => (v * 100).toFixed(1) + "%" },
  { key: "systemCpuLoad", label: "System CPU (%)", format: v => (v * 100).toFixed(1) + "%" },
  { key: "heapUsed", label: "Heap Used (MB)", format: v => (v / 1024 / 1024).toFixed(1) + " MB" },
  { key: "heapMax", label: "Heap Max (MB)", format: v => (v / 1024 / 1024).toFixed(1) + " MB" },
  { key: "threadCount", label: "Thread Count" },
  { key: "gcTime", label: "GC Time (ms)" },
  { key: "gcCount", label: "GC Count" },
  { key: "systemLoadAverage", label: "System Load Avg" },
  { key: "freePhysicalMemorySize", label: "Free Physical Memory (MB)", format: v => (v / 1024 / 1024).toFixed(1) + " MB" },
];

const METRIC_COLORS = {
  cpuLoad: "#1976d2",
  systemCpuLoad: "#2e7d32",
  heapUsed: "#ef6c00",
  heapMax: "#ab47bc",
  threadCount: "#d32f2f",
  gcTime: "#00bcd4",
  gcCount: "#8d6e63",
  systemLoadAverage: "#fbc02d",
  freePhysicalMemorySize: "#388e3c",
};

export default function UsageDashboard() {
  const [data, setData] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([
    "cpuLoad", "heapUsed", "threadCount"
  ]);

  useEffect(() => {
    fetch("http://localhost:8081/api/stats/timeline")
      .then(res => res.json())
      .then(setData);
  }, []);

  const latest = data.length > 0 ? data[data.length - 1] : {};

  return (
    <Box sx={{ bgcolor: "#f5f6fa", minHeight: "100vh", p: { xs: 1, md: 3 } }}>
      {/* Page Header */}
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: 1, mb: 1 }}>
          Application Usage Dashboard
        </Typography>
        <Typography color="text.secondary" fontSize={16}>
          Monitor live application and system metrics over time. Pick one or more metrics to visualize usage trends.
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>

      {/* Metric Picker */}
      <Card elevation={2} sx={{ p: 2, mb: 3, bgcolor: "#fff" }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Select Metrics to Plot
        </Typography>
        <FormGroup row>
          {METRICS.map(metric => (
            <FormControlLabel
              key={metric.key}
              control={
                <Checkbox
                  checked={selectedMetrics.includes(metric.key)}
                  onChange={() => {
                    setSelectedMetrics(metrics =>
                      metrics.includes(metric.key)
                        ? metrics.filter(k => k !== metric.key)
                        : [...metrics, metric.key]
                    );
                  }}
                />
              }
              label={metric.label}
              sx={{ mr: 2 }}
            />
          ))}
        </FormGroup>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {METRICS.filter(m => latest[m.key] !== undefined).map(metric => (
          <Grid item key={metric.key} xs={12} sm={6} md={3}>
            <Card sx={{ minWidth: 170, bgcolor: "#fff" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {metric.label}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: METRIC_COLORS[metric.key] || "#1976d2" }}
                >
                  {metric.format ? metric.format(latest[metric.key]) : latest[metric.key]}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Usage Line Chart */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Metrics Over Time
        </Typography>
        <Box style={{ width: "100%", height: 420 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={ts => {
                  const d = new Date(ts);
                  return d.toLocaleTimeString();
                }}
                minTickGap={20}
              />
              <YAxis />
              <Tooltip
                labelFormatter={ts => new Date(ts).toLocaleString()}
                formatter={(value, name) => {
                  const metric = METRICS.find(m => m.key === name);
                  return metric && metric.format ? metric.format(value) : value;
                }}
              />
              <Legend />
              {selectedMetrics.map(key => (
                <Line
                  type="monotone"
                  dataKey={key}
                  key={key}
                  name={METRICS.find(m => m.key === key)?.label || key}
                  stroke={METRIC_COLORS[key] || "#8884d8"}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}
