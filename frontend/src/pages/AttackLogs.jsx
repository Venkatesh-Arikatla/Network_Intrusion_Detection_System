import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import Navbar from '../components/Navbar';
import {
  Typography,
  Box,
  Grid,
  Card,
  Stack,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  GlobalStyles,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';

const AttackLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  `;

  const fetchAttackLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/attacks/optimized`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setLogs(result.attacks);
      } else {
        console.error('API Error:', result.error);
      }
    } catch (err) {
      console.error('Network Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttackLogs();
    const interval = setInterval(fetchAttackLogs, 60000);
    return () => clearInterval(interval);
  }, []);

  const severityColors = {
    CRITICAL: '#ff4444',
    HIGH: '#ff6b6b',
    MEDIUM: '#ffa726',
    LOW: '#42a5f5',
  };

  const processChartData = () => {
    const now = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now);
      hour.setHours(now.getHours() - (23 - i));
      return {
        hour: hour.getHours(),
        label: `${hour.getHours().toString().padStart(2, '0')}:00`,
        count: 0,
      };
    });

    logs.forEach((log) => {
      const t = new Date(log.timestamp);
      const diff = Math.floor((now - t) / (1000 * 60 * 60));
      if (diff >= 0 && diff < 24) {
        const idx = 23 - diff;
        if (hours[idx]) hours[idx].count += 1;
      }
    });

    return hours;
  };

  const chartData = processChartData();

  const severityDistribution = [
    {
      name: 'CRITICAL',
      value: logs.filter((l) => l.severity === 'CRITICAL').length,
      color: severityColors.CRITICAL,
    },
    {
      name: 'HIGH',
      value: logs.filter((l) => l.severity === 'HIGH').length,
      color: severityColors.HIGH,
    },
    {
      name: 'MEDIUM',
      value: logs.filter((l) => l.severity === 'MEDIUM').length,
      color: severityColors.MEDIUM,
    },
    {
      name: 'LOW',
      value: logs.filter((l) => l.severity === 'LOW').length,
      color: severityColors.LOW,
    },
  ];

  const attackTypeDistribution = Object.entries(
    logs.reduce((acc, log) => {
      const key = log.attackType || log.prediction_label || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <>
      {/* Global styles: mobile scroll, desktop fixed (same as SinglePrediction) */}
      <GlobalStyles
        styles={{
          'html, body': isMobile
            ? {
                margin: 0,
                padding: 0,
                minHeight: '100%',
                width: '100%',
                overflowX: 'hidden',
                overflowY: 'auto',
                position: 'static',
              }
            : {
                margin: 0,
                padding: 0,
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                position: 'fixed',
              },
          '#root': isMobile
            ? {
                minHeight: '100%',
                width: '100%',
              }
            : {
                height: '100%',
                width: '100%',
                overflow: 'hidden',
              },
        }}
      />

      <Navbar />

      {/* Background wrapper with responsive scrolling */}
      <Box
        sx={{
          position: isMobile ? 'relative' : 'fixed',
          inset: isMobile ? 'auto' : 0,
          minHeight: '100vh',
          width: '100vw',
          overflowX: 'hidden',
          overflowY: isMobile ? 'auto' : 'hidden',
          backgroundImage: 'url("/image1.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          pt: '64px',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.85) 45%, rgba(15,23,42,0.95) 100%),' +
              'radial-gradient(circle at 10% 0%, rgba(239, 68, 68, 0.35) 0%, transparent 55%),' +
              'radial-gradient(circle at 90% 100%, rgba(59, 130, 246, 0.35) 0%, transparent 55%)',
            zIndex: 0,
          },
        }}
      >
        {/* background glows */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            width: 260,
            height: 260,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(248, 250, 252, 0.18) 0%, transparent 70%)',
            filter: 'blur(18px)',
            animation: `${floatAnimation} 18s ease-in-out infinite`,
            opacity: 0.7,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '5%',
            right: '5%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(239, 68, 68, 0.18) 0%, transparent 70%)',
            filter: 'blur(18px)',
            animation: `${floatAnimation} 22s ease-in-out infinite`,
            opacity: 0.7,
            zIndex: 0,
          }}
        />

        {/* Main scrollable content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            pb: isMobile ? 4 : 2,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1200,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* HEADER */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background:
                    'linear-gradient(120deg,#f9fafb 0%,#fca5a5 30%,#60a5fa 70%,#f97316 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.3rem' },
                }}
              >
                Attack Analytics Dashboard
              </Typography>
            </Box>

            {/* CHARTS SECTION */}
            <Grid
              container
              spacing={3}
              sx={{
                width: '100%',
                mx: 'auto',
                alignItems: 'stretch',
                justifyContent: 'center',
              }}
            >
              {/* Left Chart - Time Series */}
              <Grid item xs={12} md={7}>
                <Card
                  sx={{
                    height: { xs: 360, md: 400 },
                    background:
                      'linear-gradient(135deg,rgba(15,23,42,0.95) 0%,rgba(30,41,59,0.95) 100%)',
                    border: '1px solid rgba(148,163,184,0.35)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <TimelineIcon sx={{ color: '#60a5fa' }} />
                      <Typography
                        sx={{
                          color: '#e5e7eb',
                          fontWeight: 600,
                          fontSize: 16,
                        }}
                      >
                        Attacks in last 24 hours
                      </Typography>
                    </Stack>

                    {loading ? (
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient
                                id="attacksFill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#f97316"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#f97316"
                                  stopOpacity={0.05}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(148,163,184,0.3)"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="label"
                              tick={{ fill: '#9ca3af', fontSize: 11 }}
                            />
                            <YAxis
                              tick={{ fill: '#9ca3af', fontSize: 11 }}
                              allowDecimals={false}
                            />
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: '#020617',
                                border: '1px solid rgba(148,163,184,0.6)',
                                borderRadius: 8,
                                color: '#e5e7eb',
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="#f97316"
                              fill="url(#attacksFill)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Chart - Pie/Bar Chart */}
              <Grid item xs={12} md={5}>
                <Card
                  sx={{
                    height: { xs: 420, md: 400 },
                    background:
                      'linear-gradient(135deg,rgba(15,23,42,0.95) 0%,rgba(30,41,59,0.95) 100%)',
                    border: '1px solid rgba(148,163,184,0.35)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardContent
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                    }}
                  >
                    <Tabs
                      value={activeTab}
                      onChange={(_, v) => setActiveTab(v)}
                      sx={{
                        minHeight: 36,
                        mb: 2,
                        '& .MuiTab-root': {
                          minHeight: 36,
                          textTransform: 'none',
                          fontSize: 14,
                          color: '#e5e7eb',
                        },
                        '& .Mui-selected': {
                          color: '#3b82f6 !important',
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    >
                      <Tab
                        label="By Severity"
                        icon={<PieChartIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                      />
                      <Tab
                        label="By Attack Type"
                        icon={<BarChartIcon sx={{ fontSize: 18 }} />}
                        iconPosition="start"
                      />
                    </Tabs>

                    {loading ? (
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Box sx={{ flex: 1, minHeight: 0 }}>
                        {activeTab === 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={severityDistribution}
                                dataKey="value"
                                nameKey="name"
                                innerRadius="40%"
                                outerRadius="70%"
                                paddingAngle={3}
                                label={(entry) =>
                                  `${entry.name}: ${entry.value}`
                                }
                              >
                                {severityDistribution.map((entry, i) => (
                                  <Cell
                                    key={i}
                                    fill={entry.color}
                                    stroke="rgba(15,23,42,0.8)"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Legend
                                verticalAlign="bottom"
                                height={40}
                                wrapperStyle={{
                                  fontSize: 12,
                                  color: '#e5e7eb',
                                }}
                              />
                              <RechartsTooltip
                                formatter={(value, name) => [
                                  `${value} attacks`,
                                  name,
                                ]}
                                contentStyle={{
                                  backgroundColor: '#020617',
                                  border:
                                    '1px solid rgba(148,163,184,0.6)',
                                  borderRadius: 8,
                                  color: '#e5e7eb',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={attackTypeDistribution}
                              margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(148,163,184,0.3)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="name"
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis
                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                allowDecimals={false}
                              />
                              <RechartsTooltip
                                formatter={(value) => [`${value} attacks`]}
                                contentStyle={{
                                  backgroundColor: '#020617',
                                  border:
                                    '1px solid rgba(148,163,184,0.6)',
                                  borderRadius: 8,
                                  color: '#e5e7eb',
                                }}
                              />
                              <Bar
                                dataKey="value"
                                radius={[8, 8, 0, 0]}
                                fill="#3b82f6"
                                name="Attack Count"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </Box>
                    )}

                    {/* Summary Statistics */}
                    {!loading && (
                      <Box
                        sx={{
                          mt: 2,
                          pt: 2,
                          borderTop:
                            '1px solid rgba(148,163,184,0.2)',
                        }}
                      >
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              sx={{ color: '#9ca3af' }}
                            >
                              Total Attacks:
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#e5e7eb',
                                fontWeight: 600,
                              }}
                            >
                              {logs.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography
                              variant="body2"
                              sx={{ color: '#9ca3af' }}
                            >
                              Critical/High:
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                color: '#ff6b6b',
                                fontWeight: 600,
                              }}
                            >
                              {
                                logs.filter(
                                  (l) =>
                                    l.severity === 'CRITICAL' ||
                                    l.severity === 'HIGH'
                                ).length
                              }
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AttackLogs;
