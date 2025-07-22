import React from "react";
import {
  Box, Typography, Card, CardContent, Avatar, Grid, Divider
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import LanguageIcon from "@mui/icons-material/Language";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// --- SAMPLE DATA (see above for structure) ---
const usageData = {
  week: "July 13 - July 19 (Week 29)",
  totalScreenTime: 95700,
  dailyAverageScreenTime: 13620,
  days: [
    { day: "S", screenTime: 6300 },
    { day: "M", screenTime: 3900 },
    { day: "T", screenTime: 4800 },
    { day: "W", screenTime: 5100 },
    { day: "T", screenTime: 5700 },
    { day: "F", screenTime: 13800 },
    { day: "S", screenTime: 32400 }
  ],
  screenOn: 13440,
  screenOff: 56460,
  mostUsedApps: [
    { name: "Tape-Central", icon: "chrome", duration: 27360 },
    { name: "Compute-Central", icon: "chrome", duration: 14640 },
    { name: "Publisher", icon: "chrome", duration: 13980 }
  ],
  peakUsage: [
    { day: "S", hours: [0, 0, 0, 0, 5, 10, 12, 12, 10, 20, 25, 30, 30, 45, 60, 45, 45, 50, 50, 35, 15, 10, 0, 0] },
    { day: "M", hours: [0, 0, 0, 0, 0, 5, 10, 15, 10, 15, 25, 15, 10, 15, 20, 25, 25, 10, 5, 0, 0, 0, 0, 0] },
    { day: "T", hours: [0, 0, 0, 0, 0, 0, 10, 15, 15, 20, 20, 20, 15, 10, 15, 20, 25, 25, 20, 10, 5, 0, 0, 0] },
    { day: "W", hours: [0, 0, 0, 0, 0, 0, 10, 10, 12, 18, 18, 15, 12, 20, 20, 30, 35, 20, 10, 0, 0, 0, 0, 0] },
    { day: "T", hours: [0, 0, 0, 0, 5, 5, 10, 20, 18, 18, 15, 12, 10, 18, 20, 25, 25, 15, 10, 5, 0, 0, 0, 0] },
    { day: "F", hours: [0, 0, 0, 0, 0, 10, 15, 25, 25, 30, 40, 45, 40, 38, 40, 50, 50, 45, 30, 20, 10, 0, 0, 0] },
    { day: "S", hours: [0, 0, 0, 0, 5, 12, 25, 30, 40, 45, 50, 55, 60, 60, 60, 60, 50, 40, 35, 25, 15, 10, 0, 0] }
  ]
};

// Helper to convert seconds to "Xh Ym" format
function fmt(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h} h ${m} m`;
}

function getIcon(app) {
  switch (app) {
    case "maps":
      return <MapIcon />;
    case "chrome":
      return <LanguageIcon />;
    case "waze":
      return <DirectionsCarIcon />;
    default:
      return <Avatar />;
  }
}

function Heatmap({ data }) {
  // Find max for color scaling
  const max = Math.max(...data.flatMap(d => d.hours));
  // 0-15, 15-30, 30-45, 45-60 (min)
  function cellColor(val) {
    if (val >= 45) return "#1565c0";
    if (val >= 30) return "#1976d2";
    if (val >= 15) return "#64b5f6";
    if (val > 0)   return "#bbdefb";
    return "#eeeeee";
  }
  return (
    <Box>
      <Typography fontWeight={600} mb={1}>
        Peak usage times
      </Typography>
      <Typography fontSize={13} color="text.secondary" mb={1}>
        (Minutes of screen time per hour for each day)
      </Typography>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: "24px repeat(24, 1fr)",
        gap: 0.5,
        alignItems: "center",
        pb: 2,
        borderRadius: 2,
        bgcolor: "#fafbfc",
        overflowX: "auto"
      }}>
        <Box></Box>
        {[...Array(24).keys()].map(h => (
          <Box key={h} fontSize={11} color="text.secondary" textAlign="center">
            {h % 3 === 0 ? h : ""}
          </Box>
        ))}
        {data.map((row, r) => (
          <React.Fragment key={r}>
            <Box fontWeight={600} fontSize={13} color="text.secondary" textAlign="center">
              {row.day}
            </Box>
            {row.hours.map((val, c) => (
              <Box
                key={c}
                title={`Day ${row.day}, Hour ${c}: ${val} min`}
                sx={{
                  width: 16, height: 16,
                  bgcolor: cellColor(val),
                  borderRadius: 1,
                  border: "1px solid #e0e0e0"
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default function UsageReport() {
  return (
    <Box sx={{ maxWidth: 550, mx: "auto", p: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Weekly report
      </Typography>
      <Typography color="text.secondary" mb={2}>
        {usageData.week}
      </Typography>
      <Card sx={{ mb: 2, bgcolor: "#696363ff", color: "#fff" }}>
        <CardContent>
          <Typography fontSize={14}>Total App Usage time</Typography>
          <Typography variant="h4" fontWeight={700} mb={1}>
            {fmt(usageData.totalScreenTime)}
          </Typography>
          <Typography color="text.secondary" fontSize={13} mb={1}>
            Daily average: {fmt(usageData.dailyAverageScreenTime)}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography fontWeight={600}>Daily usage</Typography>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={usageData.days}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={s => fmt(s)} />
              <Bar dataKey="screenTime" fill="#2979ff" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Heatmap data={usageData.peakUsage} />
        </CardContent>
      </Card>


      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography fontWeight={600} mb={1}>Most used apps</Typography>
          <Grid container spacing={2}>
            {usageData.mostUsedApps.map(app => (
              <Grid item xs={4} key={app.name}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Avatar sx={{ bgcolor: "#1976d2", mb: 1 }}>
                    {getIcon(app.icon)}
                  </Avatar>
                  <Typography fontSize={14}>{app.name}</Typography>
                  <Typography fontSize={13} color="text.secondary">{fmt(app.duration)}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ mt: 2, mb: 1 }} />
      <Typography color="text.secondary" fontSize={13} align="center">
        On average, each day while you were awake, you spent {fmt(usageData.screenOff - usageData.screenOn)} more not using your phone than using it.
      </Typography>
    </Box>
  );
}
