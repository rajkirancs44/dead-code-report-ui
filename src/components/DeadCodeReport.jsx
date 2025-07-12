import React, { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip, TextField,
  List, ListItem, ListItemIcon, ListItemText, Divider, Paper, ToggleButton, ToggleButtonGroup, Tooltip
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function DeadCodeDashboard() {
  const [reportData, setReportData] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all' or 'dead'

  useEffect(() => {
    fetch("http://localhost:8081/api/deadcode/diff")
      .then((res) => res.json())
      .then(setReportData)
      .catch((err) => console.error("Failed to load report:", err));
  }, []);

  if (!reportData) return <Box p={4}><Typography>Loading...</Typography></Box>;

  // All class names (union of used + dead)
  const allClasses = Array.from(
    new Set([
      ...Object.keys(reportData.usedCodeByClass || {}),
      ...Object.keys(reportData.deadCodeByClass || {})
    ])
  );

  // Compute dead/used count per class for sidebar badges
  const classStats = allClasses.map(className => ({
    className,
    deadCount: (reportData.deadCodeByClass?.[className] || []).length,
    usedCount: (reportData.usedCodeByClass?.[className] || []).length
  }));

  // Filtering sidebar list
  const filteredClasses = classStats
    .filter(cls =>
      (filter === "all" || cls.deadCount > 0) &&
      cls.className.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.deadCount - a.deadCount || a.className.localeCompare(b.className));

  // Excel export for all methods
  const exportData = [
    ...Object.entries(reportData.usedCodeByClass || {}).flatMap(([className, methods]) =>
      methods.map((method) => ({
        Class: className,
        Method: method,
        Status: "Used"
      }))
    ),
    ...Object.entries(reportData.deadCodeByClass || {}).flatMap(([className, methods]) =>
      methods.map((method) => ({
        Class: className,
        Method: method,
        Status: "Dead"
      }))
    )
  ];
  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DeadCodeReport");
    const blob = new Blob([
      XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    ]);
    saveAs(blob, "dead-code-report.xlsx");
  };

  // Summary chart
  const summaryData = [
    { name: "Used", value: reportData.summary.usedMethods },
    { name: "Dead", value: reportData.summary.deadMethods }
  ];

  // For method details
  const usedMethods = selectedClass ? reportData.usedCodeByClass?.[selectedClass] || [] : [];
  const deadMethods = selectedClass ? reportData.deadCodeByClass?.[selectedClass] || [] : [];

  return (
    <Box sx={{ display: "flex", bgcolor: "#f9fafb", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Paper elevation={2} sx={{
        width: 330, minHeight: "100vh", position: "sticky", top: 0, bgcolor: "#fff", p: 2, borderRight: 1, borderColor: "#eee"
      }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Dead Code Classes
        </Typography>
        <Box mb={2}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search class..."
          />
        </Box>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => val && setFilter(val)}
          size="small"
          sx={{ mb: 2, width: "100%" }}
        >
          <ToggleButton value="all" sx={{ flex: 1 }}>All</ToggleButton>
          <ToggleButton value="dead" sx={{ flex: 1 }}>Only with Dead</ToggleButton>
        </ToggleButtonGroup>
        <Divider />
        <List dense sx={{ mt: 1, overflowY: "auto", maxHeight: "72vh" }}>
          {filteredClasses.length === 0 && (
            <ListItem>
              <ListItemText primary="No classes found." />
            </ListItem>
          )}
          {filteredClasses.map(({ className, deadCount, usedCount }) => (
            <ListItem
              key={className}
              button
              selected={selectedClass === className}
              onClick={() => setSelectedClass(className)}
              sx={{
                borderLeft: selectedClass === className
                  ? "4px solid #d32f2f"
                  : deadCount > 0 ? "4px solid #ffcdd2" : "4px solid #388e3c",
                bgcolor: selectedClass === className ? "#fff3e0" : undefined
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight={selectedClass === className ? 700 : 500} sx={{ fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {className.split('.').pop()}
                    </Typography>
                    {deadCount > 0 && (
                      <Chip size="small" label={`${deadCount} Dead`} color="error" sx={{ ml: 0.5 }} />
                    )}
                    {usedCount > 0 && (
                      <Chip size="small" label={`${usedCount} Used`} color="success" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={9}>
            <Typography variant="h4" fontWeight={700} mb={2}>
              Dead Code Report <span style={{ fontSize: 24 }}>🧹</span>
            </Typography>
            <Typography color="text.secondary" mb={2}>
              Identify unreachable or unused methods in your live environment. <b>Dead methods</b> are safe to remove!
            </Typography>
          </Grid>
          <Grid item xs={12} md={3} display="flex" justifyContent={{ md: "flex-end", xs: "flex-start" }} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{ fontWeight: 700 }}
            >
              Download Excel
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#1976d2", color: "#fff" }}>
              <CardContent>
                <Typography>Total Methods</Typography>
                <Typography variant="h5" fontWeight={700}>{reportData.summary.totalMethods}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#388e3c", color: "#fff" }}>
              <CardContent>
                <Typography>Used Methods</Typography>
                <Typography variant="h5" fontWeight={700}>{reportData.summary.usedMethods}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "#d32f2f", color: "#fff" }}>
              <CardContent>
                <Typography>Dead Methods</Typography>
                <Typography variant="h5" fontWeight={700}>{reportData.summary.deadMethods}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600}>Used vs Dead Methods</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={summaryData} margin={{ top: 18, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="value" name="Count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Methods List for Selected Class */}
        {selectedClass && (
          <Card elevation={2} sx={{ mb: 2, border: deadMethods.length > 0 ? "2px solid #d32f2f" : "2px solid #388e3c" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                <span style={{ color: "#1976d2" }}>{selectedClass}</span>
              </Typography>
              {/* DEAD methods first, then used */}
              {deadMethods.length > 0 && (
                <Box mb={2}>
                  <Typography fontWeight={700} color="#d32f2f" mb={1} display="flex" alignItems="center">
                    <DeleteSweepIcon sx={{ mr: 1, color: "#d32f2f" }} /> Dead Methods <span style={{ marginLeft: 8 }}>🧹 Safe to Remove</span>
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {deadMethods.map((method, i) => (
                      <Chip
                        key={`dead-${i}`}
                        icon={<DeleteSweepIcon sx={{ color: "#d32f2f" }} />}
                        label={method}
                        sx={{ bgcolor: "#ffebee", color: "#d32f2f", fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {usedMethods.length > 0 && (
                <Box>
                  <Typography fontWeight={700} color="#388e3c" mb={1} display="flex" alignItems="center">
                    <CheckCircleIcon sx={{ mr: 1, color: "#388e3c" }} /> Used Methods (live)
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {usedMethods.map((method, i) => (
                      <Chip
                        key={`used-${i}`}
                        icon={<CheckCircleIcon sx={{ color: "#388e3c" }} />}
                        label={method}
                        sx={{ bgcolor: "#e8f5e9", color: "#388e3c", fontWeight: 600 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {deadMethods.length === 0 && usedMethods.length === 0 && (
                <Typography>No methods found for this class.</Typography>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedClass && (
          <Card elevation={0} sx={{ mt: 4, p: 2, bgcolor: "#e3f2fd" }}>
            <Typography color="text.secondary" align="center" fontWeight={500}>
              Select a class from the left to view its live/dead methods.
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
