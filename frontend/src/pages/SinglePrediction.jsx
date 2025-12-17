import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Chip,
  Stack,
  alpha,
  Card,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  GlobalStyles,
  CircularProgress,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Dangerous as DangerousIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const SinglePrediction = () => {
  const [formData, setFormData] = useState({
    duration: 0,
    src_bytes: 100,
    dst_bytes: 100,
    count: 1,
    srv_count: 1,
    serror_rate: 0.0,
    srv_serror_rate: 0.0,
    dst_host_count: 1,
    dst_host_srv_count: 1,
    dst_host_serror_rate: 0.0,
    dst_host_srv_serror_rate: 0.0,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('input'); // 'input' or 'results'

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  `;

  // Check server health
  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      return data;
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHealthStatus(null);

    try {
      const health = await checkServerHealth();
      setHealthStatus(health);

      if (health.status !== 'healthy' && health.status !== 'success') {
        setError(
          `Server health check failed: ${health.message || 'Unknown error'}`
        );
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPrediction(data);
        setActiveTab('results');
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      console.error('Prediction error:', err);
      setError(
        `Failed to connect to the prediction server. Error: ${err.message}. Make sure:
        1. Flask server is running on port 8000
        2. CORS is properly configured
        3. Server is accessible from this origin`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      duration: 0,
      src_bytes: 100,
      dst_bytes: 100,
      count: 1,
      srv_count: 1,
      serror_rate: 0.0,
      srv_serror_rate: 0.0,
      dst_host_count: 1,
      dst_host_srv_count: 1,
      dst_host_serror_rate: 0.0,
      dst_host_srv_serror_rate: 0.0,
    });
    setPrediction(null);
    setError(null);
    setHealthStatus(null);
    setActiveTab('input');
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'NORMAL':
        return '#22c55e';
      case 'LOW':
        return '#3b82f6';
      case 'MEDIUM':
      case 'WARNING':
        return '#f59e0b';
      case 'HIGH':
        return '#ef4444';
      case 'CRITICAL':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getRiskIcon = (riskLevel) => {
    if (riskLevel === 'NORMAL') {
      return <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 28 }} />;
    }
    if (
      riskLevel === 'LOW' ||
      riskLevel === 'MEDIUM' ||
      riskLevel === 'WARNING'
    ) {
      return <WarningIcon sx={{ color: '#f59e0b', fontSize: 28 }} />;
    }
    return (
      <DangerousIcon sx={{ color: getRiskColor(riskLevel), fontSize: 28 }} />
    );
  };

  const getExampleData = (type) => {
    const examples = {
      normal: {
        duration: 0,
        src_bytes: 100,
        dst_bytes: 100,
        count: 1,
        srv_count: 1,
        serror_rate: 0.0,
        srv_serror_rate: 0.0,
        dst_host_count: 1,
        dst_host_srv_count: 1,
        dst_host_serror_rate: 0.0,
        dst_host_srv_serror_rate: 0.0,
      },
      dos: {
        duration: 0,
        src_bytes: 100000,
        dst_bytes: 0,
        count: 100,
        srv_count: 100,
        serror_rate: 0.9,
        srv_serror_rate: 0.9,
        dst_host_count: 255,
        dst_host_srv_count: 255,
        dst_host_serror_rate: 0.9,
        dst_host_srv_serror_rate: 0.9,
      },
      portScan: {
        duration: 2,
        src_bytes: 100,
        dst_bytes: 0,
        count: 50,
        srv_count: 50,
        serror_rate: 0.8,
        srv_serror_rate: 0.8,
        dst_host_count: 100,
        dst_host_srv_count: 100,
        dst_host_serror_rate: 0.8,
        dst_host_srv_serror_rate: 0.8,
      },
    };
    setFormData(examples[type]);
  };

  const getFeatureDescription = (feature) => {
    const descriptions = {
      duration: 'Connection duration in seconds',
      src_bytes: 'Bytes sent from source to destination',
      dst_bytes: 'Bytes sent from destination to source',
      count: 'Number of connections to the same host',
      srv_count: 'Number of connections to the same service',
      serror_rate: 'Percentage of connections with SYN errors',
      srv_serror_rate:
        'Percentage of same-service connections with SYN errors',
      dst_host_count: 'Number of connections to the destination host',
      dst_host_srv_count: 'Number of services to the destination host',
      dst_host_serror_rate:
        'Percentage of destination host connections with SYN errors',
      dst_host_srv_serror_rate:
        'Percentage of destination host service connections with SYN errors',
    };
    return descriptions[feature] || 'Network traffic feature';
  };

  return (
    <>
      {/* Global styles: mobile scroll, desktop fixed (same pattern as Abstract) */}
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

      {/* Navbar */}
      <Navbar />

      {/* Main Background Container */}
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
        {/* Background glow effects */}
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

        {/* Main Content - Single Card with Internal Scrolling */}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', maxWidth: '1200px' }}
          >
            <Card
              sx={{
                height: isMobile ? 'auto' : '100%',
                maxHeight: isMobile ? 'none' : 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column',
                background:
                  'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2.5,
                  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SecurityIcon sx={{ color: '#f97316', fontSize: 32 }} />
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        background:
                          'linear-gradient(120deg, #f9fafb 0%, #fca5a5 30%, #60a5fa 65%, #f97316 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.4rem',
                      }}
                    >
                      Network Intrusion Detection
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha('#e5e7eb', 0.7),
                        fontSize: '0.85rem',
                      }}
                    >
                      Real-time traffic analysis and threat detection
                    </Typography>
                  </Box>
                </Box>

                {/* Tab Navigation */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={activeTab === 'input' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('input')}
                    startIcon={<AnalyticsIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.75,
                      ...(activeTab === 'input'
                        ? {
                            background:
                              'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                            boxShadow:
                              '0 4px 12px rgba(248, 113, 113, 0.3)',
                          }
                        : {
                            borderColor: alpha('#e5e7eb', 0.3),
                            color: '#e5e7eb',
                          }),
                    }}
                  >
                    Traffic Input
                  </Button>
                  <Button
                    variant={
                      activeTab === 'results' ? 'contained' : 'outlined'
                    }
                    onClick={() => setActiveTab('results')}
                    disabled={!prediction}
                    startIcon={<TimelineIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.75,
                      ...(activeTab === 'results'
                        ? {
                            background:
                              'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                            boxShadow:
                              '0 4px 12px rgba(59, 130, 246, 0.3)',
                          }
                        : {
                            borderColor: alpha('#e5e7eb', 0.3),
                            color: alpha(
                              '#e5e7eb',
                              prediction ? 1 : 0.3
                            ),
                          }),
                    }}
                  >
                    Analysis Results
                  </Button>
                </Stack>
              </Box>

              {/* Main Content Area */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                {/* Status Alerts */}
                {(healthStatus || error) && (
                  <Box sx={{ p: 2, pb: 1, flexShrink: 0 }}>
                    {healthStatus && (
                      <Alert
                        severity={
                          healthStatus.status === 'healthy'
                            ? 'success'
                            : 'warning'
                        }
                        sx={{
                          mb: error ? 1 : 0,
                          fontSize: '0.85rem',
                          py: 0.75,
                          background: 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        Server Status: {healthStatus.status} -{' '}
                        {healthStatus.message || 'Connected to API server'}
                      </Alert>
                    )}
                    {error && (
                      <Alert
                        severity="error"
                        sx={{
                          fontSize: '0.85rem',
                          py: 0.75,
                          bgcolor: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        {error}
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Inner scroll region */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    pt: 1,
                  }}
                >
                  {/* Input Tab */}
                  {activeTab === 'input' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box
                          sx={{
                            mb: 2,
                            p: 2,
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 1,
                            border:
                              '1px solid rgba(148, 163, 184, 0.1)',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              color: '#e5e7eb',
                              mb: 0.75,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                            }}
                          >
                            Enter Network Traffic Features
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: alpha('#e5e7eb', 0.7),
                              fontSize: '0.9rem',
                            }}
                          >
                            Fill in the network traffic parameters below to
                            analyze for potential intrusions.
                          </Typography>
                        </Box>

                        <Box
                          component="form"
                          onSubmit={handleSubmit}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                            mt: 2,
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              overflow: 'auto',
                              pr: 1,
                              pt: 1,
                              '&::-webkit-scrollbar': {
                                width: '6px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background:
                                  'rgba(255, 255, 255, 0.05)',
                                borderRadius: '3px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background:
                                  'rgba(249, 115, 22, 0.3)',
                                borderRadius: '3px',
                              },
                            }}
                          >
                            <Grid container spacing={2}>
                              {Object.entries(formData).map(
                                ([key, value]) => (
                                  <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={key}
                                  >
                                    <TextField
                                      fullWidth
                                      label={key
                                        .replace(/_/g, ' ')
                                        .toUpperCase()}
                                      name={key}
                                      type="number"
                                      value={value}
                                      onChange={handleInputChange}
                                      size="medium"
                                      InputLabelProps={{
                                        shrink: true,
                                      }}
                                      InputProps={{
                                        sx: {
                                          height: 56,
                                          '& input': {
                                            padding: '15px 14px',
                                            fontSize: '0.9rem',
                                          },
                                        },
                                        endAdornment: (
                                          <Tooltip
                                            title={getFeatureDescription(
                                              key
                                            )}
                                            arrow
                                            placement="top"
                                          >
                                            <IconButton
                                              size="small"
                                              sx={{
                                                p: 0.5,
                                                ml: 0.5,
                                              }}
                                            >
                                              <InfoIcon
                                                sx={{
                                                  fontSize: 16,
                                                  color: alpha(
                                                    '#e5e7eb',
                                                    0.6
                                                  ),
                                                }}
                                              />
                                            </IconButton>
                                          </Tooltip>
                                        ),
                                      }}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          color: '#e5e7eb',
                                          backgroundColor:
                                            'rgba(255, 255, 255, 0.04)',
                                          '& fieldset': {
                                            borderColor: alpha(
                                              '#e5e7eb',
                                              0.2
                                            ),
                                          },
                                          '&:hover fieldset': {
                                            borderColor: alpha(
                                              '#f97316',
                                              0.4
                                            ),
                                          },
                                          '&.Mui-focused fieldset': {
                                            borderColor: '#f97316',
                                          },
                                        },
                                        '& .MuiInputLabel-root': {
                                          color: alpha(
                                            '#e5e7eb',
                                            0.7
                                          ),
                                          fontSize: '0.85rem',
                                        },
                                      }}
                                    />
                                  </Grid>
                                )
                              )}
                            </Grid>
                          </Box>

                          {/* Quick Examples */}
                          <Box sx={{ mt: 3, flexShrink: 0 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: alpha('#e5e7eb', 0.8),
                                mb: 1.5,
                                fontWeight: 600,
                                fontSize: '0.9rem',
                              }}
                            >
                              Quick Test Examples:
                            </Typography>
                            <Grid container spacing={1.5}>
                              {[
                                {
                                  label: 'Normal Traffic',
                                  type: 'normal',
                                  color: '#22c55e',
                                },
                                {
                                  label: 'DoS Attack',
                                  type: 'dos',
                                  color: '#ef4444',
                                },
                                {
                                  label: 'Port Scan',
                                  type: 'portScan',
                                  color: '#f59e0b',
                                },
                              ].map((example) => (
                                <Grid
                                  item
                                  xs={4}
                                  key={example.type}
                                >
                                  <Button
                                    fullWidth
                                    size="medium"
                                    onClick={() =>
                                      getExampleData(example.type)
                                    }
                                    disabled={loading}
                                    sx={{
                                      py: 1,
                                      borderRadius: '8px',
                                      backgroundColor: alpha(
                                        example.color,
                                        0.1
                                      ),
                                      color: example.color,
                                      border: `1px solid ${alpha(
                                        example.color,
                                        0.3
                                      )}`,
                                      fontSize: '0.85rem',
                                      textTransform: 'none',
                                      fontWeight: 500,
                                      '&:hover': {
                                        backgroundColor: alpha(
                                          example.color,
                                          0.2
                                        ),
                                      },
                                    }}
                                  >
                                    {example.label}
                                  </Button>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>

                          {/* Action Buttons */}
                          <Box sx={{ mt: 3, mb: 1, flexShrink: 0 }}>
                            <Stack direction="row" spacing={2}>
                              <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={
                                  loading ? (
                                    <CircularProgress
                                      size={20}
                                      color="inherit"
                                    />
                                  ) : (
                                    <SecurityIcon
                                      sx={{ fontSize: 20 }}
                                    />
                                  )
                                }
                                sx={{
                                  flex: 1,
                                  py: 1.25,
                                  borderRadius: '10px',
                                  background:
                                    'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)',
                                  fontWeight: 700,
                                  fontSize: '1rem',
                                  textTransform: 'none',
                                  boxShadow:
                                    '0 6px 20px rgba(248, 113, 113, 0.3)',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow:
                                      '0 10px 25px rgba(248, 113, 113, 0.4)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {loading
                                  ? 'Analyzing Traffic...'
                                  : 'Analyze Traffic'}
                              </Button>

                              <Button
                                type="button"
                                variant="outlined"
                                size="large"
                                onClick={handleReset}
                                disabled={loading}
                                startIcon={
                                  <RefreshIcon sx={{ fontSize: 20 }} />
                                }
                                sx={{
                                  py: 1.25,
                                  px: 3,
                                  borderRadius: '10px',
                                  borderColor: alpha(
                                    '#e5e7eb',
                                    0.3
                                  ),
                                  color: '#e5e7eb',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  textTransform: 'none',
                                  '&:hover': {
                                    borderColor: '#f9fafb',
                                    backgroundColor: alpha(
                                      '#e5e7eb',
                                      0.1
                                    ),
                                  },
                                }}
                              >
                                Reset
                              </Button>
                            </Stack>
                          </Box>
                        </Box>
                      </Box>
                    </motion.div>
                  )}

                  {/* Results Tab */}
                  {activeTab === 'results' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {loading ? (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            py: 8,
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              position: 'relative',
                            }}
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            >
                              <SecurityIcon
                                sx={{
                                  fontSize: 80,
                                  color: '#f97316',
                                  opacity: 0.8,
                                }}
                              />
                            </motion.div>
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{
                              color: '#e5e7eb',
                              fontSize: '1.4rem',
                              fontWeight: 600,
                            }}
                          >
                            Analyzing Network Traffic
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: alpha('#e5e7eb', 0.7),
                              fontSize: '0.95rem',
                            }}
                          >
                            Processing 11 features with AI model...
                          </Typography>
                          <LinearProgress
                            sx={{
                              mt: 3,
                              width: '60%',
                              height: 8,
                              borderRadius: 4,
                              backgroundColor:
                                'rgba(255, 255, 255, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                background:
                                  'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)',
                              },
                            }}
                          />
                        </Box>
                      ) : prediction ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                          }}
                        >
                          <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setActiveTab('input')}
                            sx={{
                              alignSelf: 'flex-start',
                              color: '#60a5fa',
                              fontSize: '0.9rem',
                              textTransform: 'none',
                              fontWeight: 500,
                              '&:hover': {
                                backgroundColor: alpha('#60a5fa', 0.1),
                              },
                            }}
                          >
                            Back to Input
                          </Button>

                          {/* Risk Level Banner */}
                          <Paper
                            elevation={0}
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(
                                getRiskColor(prediction.risk_level),
                                0.15
                              )} 0%, ${alpha(
                                getRiskColor(prediction.risk_level),
                                0.05
                              )} 100%)`,
                              border: `2px solid ${alpha(
                                getRiskColor(prediction.risk_level),
                                0.3
                              )}`,
                              borderRadius: 2,
                              p: 3,
                              textAlign: 'center',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                mb: 2,
                              }}
                            >
                              {getRiskIcon(prediction.risk_level)}
                              <Typography
                                variant="h3"
                                sx={{
                                  fontWeight: 900,
                                  color: getRiskColor(
                                    prediction.risk_level
                                  ),
                                  fontSize: '2.5rem',
                                }}
                              >
                                {prediction.prediction_label}
                              </Typography>
                            </Box>
                            <Chip
                              label={`RISK LEVEL: ${prediction.risk_level}`}
                              size="large"
                              sx={{
                                backgroundColor: alpha(
                                  getRiskColor(prediction.risk_level),
                                  0.2
                                ),
                                color: getRiskColor(
                                  prediction.risk_level
                                ),
                                border: `1px solid ${alpha(
                                  getRiskColor(prediction.risk_level),
                                  0.4
                                )}`,
                                fontWeight: 800,
                                fontSize: '1rem',
                                height: 40,
                                px: 2,
                              }}
                            />
                          </Paper>

                          <Grid container spacing={3}>
                            {/* Confidence Score */}
                            <Grid item xs={12} md={6}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  background:
                                    'rgba(255, 255, 255, 0.03)',
                                  border:
                                    '1px solid rgba(148, 163, 184, 0.1)',
                                  borderRadius: 2,
                                  height: '100%',
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: '#e5e7eb',
                                    mb: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  Detection Confidence
                                </Typography>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    mb: 1,
                                  }}
                                >
                                  <Box sx={{ flex: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={prediction.confidence}
                                      sx={{
                                        height: 12,
                                        borderRadius: 6,
                                        backgroundColor:
                                          'rgba(255, 255, 255, 0.1)',
                                        '& .MuiLinearProgress-bar': {
                                          background:
                                            'linear-gradient(90deg, #ef4444 0%, #f97316 50%, #22c55e 100%)',
                                          borderRadius: 6,
                                        },
                                      }}
                                    />
                                  </Box>
                                  <Typography
                                    variant="h4"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontWeight: 800,
                                      fontSize: '1.8rem',
                                      minWidth: 65,
                                    }}
                                  >
                                    {prediction.confidence}%
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: alpha('#e5e7eb', 0.7),
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  AI model confidence score for this
                                  prediction
                                </Typography>
                              </Paper>
                            </Grid>

                            {/* Probability Distribution */}
                            <Grid item xs={12} md={6}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  background:
                                    'rgba(255, 255, 255, 0.03)',
                                  border:
                                    '1px solid rgba(148, 163, 184, 0.1)',
                                  borderRadius: 2,
                                  height: '100%',
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: '#e5e7eb',
                                    mb: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  Probability Distribution
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                    <Box
                                      sx={{
                                        p: 2,
                                        background:
                                          'rgba(34, 197, 94, 0.1)',
                                        border:
                                          '1px solid rgba(34, 197, 94, 0.3)',
                                        borderRadius: 1.5,
                                        textAlign: 'center',
                                      }}
                                    >
                                      <Typography
                                        variant="h3"
                                        sx={{
                                          color: '#22c55e',
                                          fontWeight: 800,
                                          mb: 0.5,
                                          fontSize: '2rem',
                                        }}
                                      >
                                        {prediction.probabilities?.normal?.toFixed(
                                          1
                                        ) ?? '0.0'}
                                        %
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: alpha(
                                            '#e5e7eb',
                                            0.9
                                          ),
                                          fontWeight: 500,
                                          fontSize: '0.9rem',
                                        }}
                                      >
                                        Normal Traffic
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Box
                                      sx={{
                                        p: 2,
                                        background:
                                          'rgba(239, 68, 68, 0.1)',
                                        border:
                                          '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: 1.5,
                                        textAlign: 'center',
                                      }}
                                    >
                                      <Typography
                                        variant="h3"
                                        sx={{
                                          color: '#ef4444',
                                          fontWeight: 800,
                                          mb: 0.5,
                                          fontSize: '2rem',
                                        }}
                                      >
                                        {prediction.probabilities?.attack?.toFixed(
                                          1
                                        ) ?? '0.0'}
                                        %
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: alpha(
                                            '#e5e7eb',
                                            0.9
                                          ),
                                          fontWeight: 500,
                                          fontSize: '0.9rem',
                                        }}
                                      >
                                        Attack Probability
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>

                            {/* Detection Details */}
                            <Grid item xs={12}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  background:
                                    'rgba(255, 255, 255, 0.03)',
                                  border:
                                    '1px solid rgba(148, 163, 184, 0.1)',
                                  borderRadius: 2,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: '#e5e7eb',
                                    mb: 2,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  Detection Details
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <Stack spacing={1.5}>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: alpha(
                                              '#e5e7eb',
                                              0.7
                                            ),
                                            fontSize: '0.85rem',
                                            mb: 0.5,
                                          }}
                                        >
                                          Detection Method
                                        </Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{
                                            color: '#e5e7eb',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                          }}
                                        >
                                          {prediction.detection_method ||
                                            'AI Machine Learning Model'}
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: alpha(
                                              '#e5e7eb',
                                              0.7
                                            ),
                                            fontSize: '0.85rem',
                                            mb: 0.5,
                                          }}
                                        >
                                          Features Processed
                                        </Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{
                                            color: '#e5e7eb',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                          }}
                                        >
                                          {prediction.features_received ||
                                            11}{' '}
                                          network parameters
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: alpha(
                                              '#e5e7eb',
                                              0.7
                                            ),
                                            fontSize: '0.85rem',
                                            mb: 0.5,
                                          }}
                                        >
                                          Timestamp
                                        </Typography>
                                        <Typography
                                          variant="body1"
                                          sx={{
                                            color: '#e5e7eb',
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                          }}
                                        >
                                          {new Date().toLocaleString()}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Grid>
                                  {prediction.attack_reasons &&
                                    prediction.attack_reasons.length >
                                      0 && (
                                      <Grid item xs={12} md={6}>
                                        <Box
                                          sx={{
                                            p: 2,
                                            background:
                                              'rgba(239, 68, 68, 0.08)',
                                            border:
                                              '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: 1.5,
                                            height: '100%',
                                          }}
                                        >
                                          <Typography
                                            variant="subtitle1"
                                            sx={{
                                              color: '#ef4444',
                                              mb: 1.5,
                                              fontWeight: 700,
                                              fontSize: '1rem',
                                            }}
                                          >
                                            🚨 Attack Indicators Detected
                                          </Typography>
                                          <Stack spacing={1}>
                                            {prediction.attack_reasons.map(
                                              (reason, index) => (
                                                <Box
                                                  key={index}
                                                  sx={{
                                                    display: 'flex',
                                                    alignItems:
                                                      'flex-start',
                                                    gap: 1,
                                                  }}
                                                >
                                                  <DangerousIcon
                                                    sx={{
                                                      color: '#ef4444',
                                                      fontSize: 16,
                                                      mt: 0.25,
                                                    }}
                                                  />
                                                  <Typography
                                                    variant="body2"
                                                    sx={{
                                                      color: alpha(
                                                        '#e5e7eb',
                                                        0.9
                                                      ),
                                                      fontSize:
                                                        '0.85rem',
                                                    }}
                                                  >
                                                    {reason}
                                                  </Typography>
                                                </Box>
                                              )
                                            )}
                                          </Stack>
                                        </Box>
                                      </Grid>
                                    )}
                                </Grid>
                              </Paper>
                            </Grid>
                          </Grid>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            py: 8,
                            gap: 2,
                          }}
                        >
                          <TimelineIcon
                            sx={{
                              fontSize: 80,
                              color: alpha('#60a5fa', 0.5),
                            }}
                          />
                          <Typography
                            variant="h5"
                            sx={{
                              color: '#e5e7eb',
                              fontSize: '1.4rem',
                              fontWeight: 600,
                            }}
                          >
                            No Analysis Results
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: alpha('#e5e7eb', 0.7),
                              fontSize: '1rem',
                              textAlign: 'center',
                              maxWidth: 500,
                            }}
                          >
                            Submit network traffic data for analysis to see
                            results here.
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => setActiveTab('input')}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                              mt: 2,
                              py: 1.25,
                              px: 3,
                              borderRadius: '10px',
                              background:
                                'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                              fontWeight: 600,
                              fontSize: '1rem',
                              textTransform: 'none',
                            }}
                          >
                            Go to Traffic Input
                          </Button>
                        </Box>
                      )}
                    </motion.div>
                  )}
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </>
  );
};

export default SinglePrediction;
