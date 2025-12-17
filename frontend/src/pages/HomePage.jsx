import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Stack,
  alpha,
  Fab,
  useMediaQuery,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import { GlobalStyles, useTheme } from '@mui/material';

const HomePage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const theme = useTheme();
  // Treat md and below as “mobile”
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  `;

  const pulseAnimation = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.03); }
  `;

  const gradientFlow = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  `;

  useEffect(() => {
    if (!isMobile) {
      setShowScrollTop(false);
      return;
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  const scrollToTop = () => {
    if (!isMobile) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const attackTypes = [
    { type: 'DoS / DDoS', severity: 'High' },
    { type: 'Port Scan', severity: 'Medium' },
    { type: 'Malware', severity: 'Critical' },
    { type: 'Brute Force', severity: 'High' },
    { type: 'SQL Injection', severity: 'Critical' },
    { type: 'Phishing Traffic', severity: 'Medium' },
  ];

  const stats = [
    { value: '24/7', label: 'Continuous Monitoring' },
    { value: '<100ms', label: 'Alert Latency' },
    { value: '99%+', label: 'Detection Accuracy' },
    { value: '10K+', label: 'Threats Stopped' },
  ];

  return (
    <>
      {/* Global styles:
          - mobile: normal vertical scroll
          - desktop: fixed viewport, no scroll */}
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
          '::-webkit-scrollbar': isMobile
            ? { width: 6 }
            : { display: 'none' },
          '::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 3,
          },
          '::-webkit-scrollbar-thumb': {
            background: 'rgba(249, 115, 22, 0.3)',
            borderRadius: 3,
          },
          '-ms-overflow-style': isMobile ? 'auto' : 'none',
          'scrollbar-width': isMobile ? 'thin' : 'none',
        }}
      />

      <Box
        sx={{
          bgcolor: '#020617',
          minHeight: '100vh',
          width: '100%',
          position: isMobile ? 'relative' : 'fixed',
          inset: isMobile ? 'auto' : 0,
          overflowX: 'hidden',
          overflowY: isMobile ? 'auto' : 'hidden',
          '& *': {
            boxSizing: 'border-box',
          },
        }}
      >
        {/* Navbar */}
        <Navbar />

        {/* Hero / main content */}
        <Box
          sx={{
            minHeight: '100vh',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'url("/home.webp")',
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
          {/* glows */}
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
            }}
          />

          <Container
            maxWidth="lg"
            sx={{
              position: 'relative',
              zIndex: 1,
              minHeight: 'calc(100vh - 64px)',
              display: 'flex',
              alignItems: 'center',
              py: isMobile ? 4 : 0,
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Grid
                container
                spacing={6}
                alignItems="center"
                sx={{
                  pb: isMobile ? 8 : 0,
                }}
              >
                {/* Left side content */}
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Chip
                      label="AI-Driven Network Intrusion Detection System"
                      sx={{
                        mb: 3,
                        px: 1.5,
                        py: 0.5,
                        height: 'auto',
                        minHeight: 30,
                        borderRadius: '999px',
                        background:
                          'linear-gradient(135deg, rgba(248, 250, 252, 0.08) 0%, rgba(248, 250, 252, 0.03) 100%)',
                        border: '1px solid rgba(248, 250, 252, 0.25)',
                        color: '#e5e7eb',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        letterSpacing: '0.02em',
                        backdropFilter: 'blur(14px)',
                        animation: `${pulseAnimation} 2.8s ease-in-out infinite`,
                        '& .MuiChip-label': {
                          px: 0.4,
                          py: 0.3,
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      }}
                    />

                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: {
                          xs: '2rem',
                          sm: '2.4rem',
                          md: '2.8rem',
                          lg: '3.4rem',
                        },
                        fontWeight: 800,
                        lineHeight: 1.05,
                        mb: 3,
                        background:
                          'linear-gradient(120deg, #f9fafb 0%, #fca5a5 30%, #60a5fa 65%, #f97316 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundSize: '260% 260%',
                        animation: `${gradientFlow} 10s ease-in-out infinite`,
                      }}
                    >
                      Detect intrusions
                      <br />
                      before they become breaches.
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        mb: 4,
                        color: alpha('#e5e7eb', 0.78),
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        lineHeight: 1.7,
                        maxWidth: 520,
                      }}
                    >
                      Monitor every packet across your network, identify suspicious
                      behavior in real time, and stop attacks such as malware, DDoS,
                      brute force, and data exfiltration before they cause damage.
                    </Typography>

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2.5}
                      sx={{ mb: 5 }}
                    >
                      <Button
                        component={Link}
                        to="/single-prediction"
                        variant="contained"
                        size="large"
                        endIcon={<SecurityIcon />}
                        sx={{
                          px: { xs: 3, sm: 4 },
                          py: 1.6,
                          borderRadius: '999px',
                          background:
                            'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)',
                          fontWeight: 700,
                          fontSize: { xs: '0.85rem', sm: '0.95rem' },
                          boxShadow: '0 18px 40px rgba(248, 113, 113, 0.35)',
                          textTransform: 'none',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 24px 50px rgba(248, 113, 113, 0.5)',
                          },
                          transition: 'all 0.26s ease',
                        }}
                      >
                        Run Live Detection
                      </Button>

                      <Button
                        component={Link}
                        to="/batch-prediction"
                        variant="outlined"
                        size="large"
                        startIcon={<TimelineIcon />}
                        sx={{
                          px: { xs: 3, sm: 4 },
                          py: 1.6,
                          borderRadius: '999px',
                          borderColor: alpha('#e5e7eb', 0.4),
                          color: '#e5e7eb',
                          fontWeight: 600,
                          fontSize: { xs: '0.85rem', sm: '0.95rem' },
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#f9fafb',
                            backgroundColor: alpha('#e5e7eb', 0.08),
                          },
                          transition: 'all 0.24s ease',
                        }}
                      >
                        Analyze Traffic Data
                      </Button>
                    </Stack>

                    {/* Stats */}
                    <Grid container spacing={2}>
                      {stats.map((stat, index) => (
                        <Grid item xs={6} sm={3} key={stat.label}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography
                                variant="h5"
                                sx={{
                                  fontWeight: 800,
                                  color: '#f9fafb',
                                  mb: 0.5,
                                  fontSize: { xs: '1.1rem', sm: '1.3rem' },
                                  textAlign: 'left',
                                }}
                              >
                                {stat.value}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: alpha('#e5e7eb', 0.7),
                                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                  textAlign: 'left',
                                }}
                              >
                                {stat.label}
                              </Typography>
                            </Box>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </motion.div>
                </Grid>

                {/* Right visual / mini dashboard */}
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 24,
                        p: { xs: 2, sm: 2.5 },
                        background:
                          'linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.7) 40%, rgba(30,64,175,0.75) 100%)',
                        border: '1px solid rgba(148, 163, 184, 0.5)',
                        boxShadow: '0 30px 80px rgba(15,23,42,0.9)',
                        backdropFilter: 'blur(16px)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Header bar */}
                      <Box
                        sx={{
                          mb: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '999px',
                              backgroundColor: '#f97316',
                            }}
                          />
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '999px',
                              backgroundColor: '#22c55e',
                            }}
                          />
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '999px',
                              backgroundColor: '#38bdf8',
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha('#e5e7eb', 0.75),
                            letterSpacing: 0.4,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            textAlign: 'center',
                          }}
                        >
                          Live Network Threat Monitor
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        {/* Threat level card */}
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              borderRadius: 16,
                              p: { xs: 1.5, sm: 2 },
                              background:
                                'radial-gradient(circle at 0% 0%, rgba(248,113,113,0.45) 0%, transparent 55%), rgba(15,23,42,0.95)',
                              border: '1px solid rgba(248,113,113,0.45)',
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              mb={1}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: alpha('#fecaca', 0.9),
                                  fontWeight: 600,
                                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                }}
                              >
                                Threat Level
                              </Typography>
                              <Chip
                                label="Elevated"
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(248,113,113,0.15)',
                                  color: '#fecaca',
                                  borderRadius: '999px',
                                  border: '1px solid rgba(248,113,113,0.5)',
                                  fontSize: { xs: '0.55rem', sm: '0.65rem' },
                                }}
                              />
                            </Stack>
                            <Typography
                              variant="h4"
                              sx={{
                                color: '#fee2e2',
                                fontWeight: 800,
                                mb: 0.5,
                                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                              }}
                            >
                              37 active alerts
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: alpha('#fecaca', 0.8),
                                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                              }}
                            >
                              Most frequent: Port scans, brute force logins.
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Detection methods */}
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              borderRadius: 16,
                              p: { xs: 1.5, sm: 2 },
                              background:
                                'radial-gradient(circle at 100% 0%, rgba(96,165,250,0.45) 0%, transparent 60%), rgba(15,23,42,0.95)',
                              border: '1px solid rgba(96,165,250,0.5)',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: alpha('#bfdbfe', 0.95),
                                fontWeight: 600,
                                mb: 1,
                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                              }}
                            >
                              Detection Engine
                            </Typography>
                            <Stack spacing={0.5}>
                              {[
                                'Signature-based rules',
                                'Behavioral anomaly models',
                                'Reputation & threat intel',
                              ].map((item) => (
                                <Stack
                                  key={item}
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Box
                                    sx={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: '999px',
                                      backgroundColor: '#93c5fd',
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: alpha('#dbeafe', 0.9),
                                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                    }}
                                  >
                                    {item}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                        </Grid>

                        {/* Bottom mini cards */}
                        <Grid item xs={12}>
                          <Grid container spacing={1}>
                            {attackTypes.slice(0, 4).map((attack) => (
                              <Grid item xs={6} sm={3} key={attack.type}>
                                <Box
                                  sx={{
                                    borderRadius: 12,
                                    p: 1,
                                    backgroundColor: 'rgba(15,23,42,0.9)',
                                    border: '1px solid rgba(148,163,184,0.5)',
                                    minHeight: 64,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontWeight: 600,
                                      fontSize: { xs: '0.62rem', sm: '0.7rem' },
                                      mb: 0.25,
                                      textAlign: 'center',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {attack.type}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: alpha('#9ca3af', 0.9),
                                      fontSize: { xs: '0.52rem', sm: '0.58rem' },
                                      textAlign: 'center',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    Severity: {attack.severity}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                      </Grid>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>

        {/* Scroll-to-top button (mobile only) */}
        <AnimatePresence>
          {isMobile && showScrollTop && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Fab
                onClick={scrollToTop}
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                  background:
                    'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                  color: 'white',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                    transform: 'scale(1.1)',
                  },
                  zIndex: 1000,
                  boxShadow: '0 8px 32px rgba(249, 115, 22, 0.4)',
                  animation: `${pulseAnimation} 2s ease-in-out infinite`,
                }}
              >
                <ArrowUpwardIcon />
              </Fab>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </>
  );
};

export default HomePage;
