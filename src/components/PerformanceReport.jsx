import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, FormControl, InputLabel, Select, MenuItem, Tooltip as MuiTooltip, Chip, Grid
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LabelList } from "recharts";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";

export default function PerformanceReport() {
  const [reportData, setReportData] = useState(null);
  const [sortKey, setSortKey] = useState("avgTimeMs");

  useEffect(() => {
    fetch("http://localhost:8081/api/deadcode/stats")
      .then((res) => res.json())
      .then(setReportData)
      .catch((err) => console.error("Failed to load performance report:", err));
  }, []);

  if (!reportData || !reportData.methodStats) return <div>Loading...</div>;

  // Prepare method stats
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

  // Dead and used methods breakdown
  const deadClasses = reportData.deadCodeByClass || {};
  const usedClasses = reportData.usedCodeByClass || {};

  // Summary stats
  const summary = reportData.summary || {};

  return (
    <Box sx={{ p: 3, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} mb={3} gutterBottom>
        Method Performance Report
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#1976d2", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle1">Total Methods</Typography>
              <Typography variant="h5" fontWeight={700}>{summary.totalMethods || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#388e3c", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle1">Used Methods</Typography>
              <Typography variant="h5" fontWeight={700}>{summary.usedMethods || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: "#d32f2f", color: "#fff" }}>
            <CardContent>
              <Typography variant="subtitle1">Dead Methods</Typography>
              <Typography variant="h5" fontWeight={700}>{summary.deadMethods || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}><PlayArrowIcon sx={{ verticalAlign: "middle", color: "#388e3c" }} /> Used Code by Class</Typography>
              {Object.entries(usedClasses).map(([cls, methods]) => (
                <Box key={cls} mb={1}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{cls}</Typography>
                  {methods.map((m, idx) => (
                    <Chip key={m} size="small" label={m} sx={{ m: 0.5, bgcolor: "#e8f5e9", color: "#388e3c" }} />
                  ))}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={1}><PauseCircleIcon sx={{ verticalAlign: "middle", color: "#d32f2f" }} /> Dead Code by Class</Typography>
              {Object.entries(deadClasses).map(([cls, methods]) => (
                <Box key={cls} mb={1}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{cls}</Typography>
                  {methods.map((m, idx) => (
                    <Chip key={m} size="small" label={m} sx={{ m: 0.5, bgcolor: "#ffebee", color: "#d32f2f" }} />
                  ))}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={600}>Top Method Stats</Typography>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortKey}
                label="Sort by"
                onChange={e => setSortKey(e.target.value)}
              >
                <MenuItem value="avgTimeMs">Top 10 Slowest Methods</MenuItem>
                <MenuItem value="count">Top 10 Most Called Methods</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Paper elevation={1} sx={{ maxHeight: 300, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Class</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Avg Time (ms)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topMethods.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <MuiTooltip title={row.className}><span>{row.className.split('.').pop()}</span></MuiTooltip>
                    </TableCell>
                    <TableCell>{row.method}</TableCell>
                    <TableCell align="right">{row.count}</TableCell>
                    <TableCell align="right">{row.avgTimeMs.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={1}>Top 10 Methods: Calls vs Avg Time</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMethods} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis yAxisId="left" orientation="left" label={{ value: "Count", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Avg Time (ms)", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="count" fill="#1976d2" name="Invocations">
                <LabelList dataKey="count" position="top" />
              </Bar>
              <Bar yAxisId="right" dataKey="avgTimeMs" fill="#d32f2f" name="Avg Time (ms)">
                <LabelList dataKey="avgTimeMs" position="top" formatter={v => v.toFixed(2)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
