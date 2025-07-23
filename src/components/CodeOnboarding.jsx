import React, { useState } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Checkbox, FormControlLabel,
  Button, Chip, Grid, Divider, MenuItem, InputAdornment, Alert, CircularProgress
} from "@mui/material";

const initialForm = {
  "static-scan": true,
  repo: "https://github.com/rajkirancs44/app-code-test.git",
  branch: "main",
  "base-packages": ["com.citi.test"],
  "track-execution-time": true,
  "track-invocation-count": true,
  "analyzer-base-url": "http://localhost:8081",
  "dump-interval-time": 100,
  "stats-dump-interval-time": 180,
  "stats-scan": true,
  "app-id": "174198",
  "service-name": "test-code-1"
};

export default function CodeOnboarding() {
  const [form, setForm] = useState(initialForm);
  const [newPackage, setNewPackage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [uniqueId, setUniqueId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }
  function addPackage() {
    if (newPackage && !form["base-packages"].includes(newPackage)) {
      setForm(f => ({
        ...f,
        "base-packages": [...f["base-packages"], newPackage]
      }));
      setNewPackage("");
    }
  }
  function removePackage(pkg) {
    setForm(f => ({
      ...f,
      "base-packages": f["base-packages"].filter(x => x !== pkg)
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setUniqueId(null);
    try {
      // POST to your backend API
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadcode: form })
      });
      if (!res.ok) throw new Error("Failed to save config");
      const json = await res.json();
      setUniqueId(json.id || "N/A");
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Error submitting form");
    }
    setLoading(false);
  }

  return (
    <Box sx={{ maxWidth: 620, mx: "auto", p: 2 }}>
      <Card elevation={3} sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Dead Code Analyzer Onboarding
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Repository URL"
                  value={form.repo}
                  onChange={e => handleChange("repo", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Branch"
                  value={form.branch}
                  onChange={e => handleChange("branch", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="App ID"
                  value={form["app-id"]}
                  onChange={e => handleChange("app-id", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Service Name"
                  value={form["service-name"]}
                  onChange={e => handleChange("service-name", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Analyzer Base URL"
                  value={form["analyzer-base-url"]}
                  onChange={e => handleChange("analyzer-base-url", e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box mb={1}>
                  <Typography fontWeight={500}>Base Packages</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                  {form["base-packages"].map(pkg => (
                    <Chip
                      key={pkg}
                      label={pkg}
                      color="primary"
                      onDelete={() => removePackage(pkg)}
                    />
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    label="Add Package"
                    value={newPackage}
                    onChange={e => setNewPackage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPackage();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={addPackage} disabled={!newPackage}>
                    Add
                  </Button>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form["static-scan"]}
                      onChange={e => handleChange("static-scan", e.target.checked)}
                    />
                  }
                  label="Enable Static Scan"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form["stats-scan"]}
                      onChange={e => handleChange("stats-scan", e.target.checked)}
                    />
                  }
                  label="Enable Stats Scan"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form["track-execution-time"]}
                      onChange={e => handleChange("track-execution-time", e.target.checked)}
                    />
                  }
                  label="Track Execution Time"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form["track-invocation-count"]}
                      onChange={e => handleChange("track-invocation-count", e.target.checked)}
                    />
                  }
                  label="Track Invocation Count"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dump Interval (seconds)"
                  value={form["dump-interval-time"]}
                  onChange={e => handleChange("dump-interval-time", Number(e.target.value))}
                  type="number"
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">sec</InputAdornment> }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stats Dump Interval (seconds)"
                  value={form["stats-dump-interval-time"]}
                  onChange={e => handleChange("stats-dump-interval-time", Number(e.target.value))}
                  type="number"
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">sec</InputAdornment> }}
                  required
                />
              </Grid>
            </Grid>
            <Box mt={3} textAlign="right">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </Box>
          </form>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
        </CardContent>
      </Card>
      {submitted && (
        <Card elevation={0} sx={{ mt: 3, bgcolor: "#e3f2fd", p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Onboarding successful!
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your configuration ID: <b>{uniqueId}</b>
          </Alert>
          <Typography fontWeight={600} mb={1}>
            Submitted Config JSON:
          </Typography>
          <pre style={{
            fontSize: 15,
            background: "#f7fafc",
            padding: "16px 8px",
            borderRadius: 6,
            overflow: "auto"
          }}>
            {JSON.stringify({ deadcode: form }, null, 2)}
          </pre>
        </Card>
      )}
    </Box>
  );
}
