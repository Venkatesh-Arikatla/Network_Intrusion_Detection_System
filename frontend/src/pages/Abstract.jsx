import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  Paper,
  alpha,
  Grid,
  Stack,
  Button,
  Card,
  Chip,
  GlobalStyles,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Security as SecurityIcon,
  ModelTraining as ModelTrainingIcon,
  Dataset as DatasetIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

const Abstract = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'metrics'

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  `;

  // ✅ UPDATED VALUES FROM VERIFICATION RESULTS
  const metrics = {
    datasetSize: '7,063',
    accuracy: '92.22%',
    inferenceTime: '1.933 ms',
    trainingTime: '0.02 minutes',
    f1Score: '95.34%',
    precision: '93.51%',
    recall: '97.23%',
    errorRate: '7.78%',
    features: '11',
    totalFeatures: '41',
    trees: '100',
    algorithm: 'Random Forest',
    comparisons: [
      { name: 'SVM', accuracy: '92.14%' },
      { name: 'Naïve Bayes', accuracy: '90.30%' },
      { name: 'Decision Tree', accuracy: '90.80%' },
      { name: 'Our Model', accuracy: '92.22%', isOurs: true },
    ],
  };

  return (
    <>
      {/* Global styles: mobile scroll, desktop fixed */}
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

        {/* Main Content - center card; on mobile page itself can scroll top->bottom */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, md: 2 },
            pb: isMobile ? 4 : 2, // extra bottom space on mobile
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
                      System Overview & Metrics
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha('#e5e7eb', 0.7),
                        fontSize: '0.85rem',
                      }}
                    >
                      NIDS Architecture, Performance Analysis, and Technical
                      Specifications
                    </Typography>
                  </Box>
                </Box>

                {/* Tab Navigation */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={activeTab === 'overview' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('overview')}
                    startIcon={<InfoIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.75,
                      ...(activeTab === 'overview'
                        ? {
                            background:
                              'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                            boxShadow: '0 4px 12px rgba(248, 113, 113, 0.3)',
                          }
                        : {
                            borderColor: alpha('#e5e7eb', 0.3),
                            color: '#e5e7eb',
                          }),
                    }}
                  >
                    System Overview
                  </Button>
                  <Button
                    variant={activeTab === 'metrics' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('metrics')}
                    startIcon={<AnalyticsIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.75,
                      ...(activeTab === 'metrics'
                        ? {
                            background:
                              'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          }
                        : {
                            borderColor: alpha('#e5e7eb', 0.3),
                            color: '#e5e7eb',
                          }),
                    }}
                  >
                    Performance Metrics
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
                {/* Inner scroll: on desktop this scrolls inside the card;
                    on mobile the page can scroll and this can also scroll if needed */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    pt: 1,
                  }}
                >
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
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
                          gap: 3,
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 1,
                            border: '1px solid rgba(148, 163, 184, 0.1)',
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
                            System Architecture Overview
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: alpha('#e5e7eb', 0.7),
                              fontSize: '0.9rem',
                            }}
                          >
                            Random Forest-based NIDS with optimized feature
                            selection
                          </Typography>
                        </Box>

                        {/* Main Content Grid */}
                        <Grid container spacing={3}>
                          {/* Left Column - Abstract Text */}
                          <Grid item xs={12} md={8}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                background: 'rgba(255, 255, 255, 0.03)',
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
                                Project Abstract
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: alpha('#e5e7eb', 0.95),
                                  lineHeight: 1.7,
                                  fontSize: '0.95rem',
                                  textAlign: 'justify',
                                  mb: 3,
                                }}
                              >
                                This Network Intrusion Detection System employs a{' '}
                                {metrics.algorithm} classification algorithm with
                                feature selection for optimal performance. The
                                model is trained on the KDD Cup 1999 dataset
                                containing {metrics.datasetSize} network
                                connection samples with {metrics.totalFeatures}{' '}
                                features, which are optimized to{' '}
                                {metrics.features} key features through feature
                                selection.
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: alpha('#e5e7eb', 0.95),
                                  lineHeight: 1.7,
                                  fontSize: '0.95rem',
                                  textAlign: 'justify',
                                }}
                              >
                                The {metrics.algorithm} ensemble consists of{' '}
                                {metrics.trees} decision trees and achieves an
                                accuracy rate of {metrics.accuracy} with an
                                error rate of {metrics.errorRate}. The system
                                demonstrates robust performance with an F1 score
                                of {metrics.f1Score}, precision of{' '}
                                {metrics.precision}, and recall of{' '}
                                {metrics.recall}. The training time is
                                approximately {metrics.trainingTime}, while
                                inference time is {metrics.inferenceTime} per
                                prediction.
                              </Typography>
                            </Paper>
                          </Grid>

                          {/* Right Column - Key Features */}
                          <Grid item xs={12} md={4}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                background: 'rgba(255, 255, 255, 0.03)',
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
                                Key Technical Features
                              </Typography>
                              <Stack spacing={2}>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    background:
                                      'rgba(96, 165, 250, 0.1)',
                                    border:
                                      '1px solid rgba(96, 165, 250, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#60a5fa',
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      mb: 0.5,
                                    }}
                                  >
                                    <ModelTrainingIcon
                                      sx={{
                                        fontSize: 16,
                                        mr: 1,
                                        verticalAlign: 'middle',
                                      }}
                                    />
                                    Algorithm
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    {metrics.algorithm} with {metrics.trees}{' '}
                                    trees
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    p: 1.5,
                                    background:
                                      'rgba(34, 197, 94, 0.1)',
                                    border:
                                      '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#22c55e',
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      mb: 0.5,
                                    }}
                                  >
                                    <DatasetIcon
                                      sx={{
                                        fontSize: 16,
                                        mr: 1,
                                        verticalAlign: 'middle',
                                      }}
                                    />
                                    Dataset
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    KDD Cup 1999 ({metrics.datasetSize}{' '}
                                    samples)
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    p: 1.5,
                                    background:
                                      'rgba(168, 85, 247, 0.1)',
                                    border:
                                      '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#a855f7',
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      mb: 0.5,
                                    }}
                                  >
                                    <AssessmentIcon
                                      sx={{
                                        fontSize: 16,
                                        mr: 1,
                                        verticalAlign: 'middle',
                                      }}
                                    />
                                    Feature Engineering
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    {metrics.totalFeatures} →{' '}
                                    {metrics.features} features
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    p: 1.5,
                                    background:
                                      'rgba(245, 158, 11, 0.1)',
                                    border:
                                      '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#f59e0b',
                                      fontWeight: 600,
                                      fontSize: '0.9rem',
                                      mb: 0.5,
                                    }}
                                  >
                                    <SpeedIcon
                                      sx={{
                                        fontSize: 16,
                                        mr: 1,
                                        verticalAlign: 'middle',
                                      }}
                                    />
                                    Performance
                                  </Typography>
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    {metrics.inferenceTime} inference time
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    </motion.div>
                  )}

                  {/* Metrics Tab */}
                  {activeTab === 'metrics' && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                        }}
                      >
                        {/* Back Button */}
                        <Button
                          startIcon={<ArrowBackIcon />}
                          onClick={() => setActiveTab('overview')}
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
                          Back to Overview
                        </Button>

                        {/* Performance Summary */}
                        <Paper
                          elevation={0}
                          sx={{
                            background: `linear-gradient(135deg, ${alpha(
                              '#3b82f6',
                              0.15
                            )} 0%, ${alpha('#3b82f6', 0.05)} 100%)`,
                            border: `2px solid ${alpha('#3b82f6', 0.3)}`,
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
                            <AnalyticsIcon
                              sx={{ color: '#3b82f6', fontSize: 32 }}
                            />
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 900,
                                color: '#3b82f6',
                                fontSize: '2.5rem',
                              }}
                            >
                              Performance Metrics
                            </Typography>
                          </Box>
                          <Chip
                            label={`VERIFIED: ${metrics.accuracy} ACCURACY`}
                            size="large"
                            sx={{
                              backgroundColor: alpha('#3b82f6', 0.2),
                              color: '#3b82f6',
                              border: `1px solid ${alpha('#3b82f6', 0.4)}`,
                              fontWeight: 800,
                              fontSize: '1rem',
                              height: 40,
                              px: 2,
                            }}
                          />
                        </Paper>

                        {/* Core Metrics */}
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            background: 'rgba(255, 255, 255, 0.03)',
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
                            Core Performance Metrics
                          </Typography>
                          <Grid container spacing={3}>
                            {/* Accuracy */}
                            <Grid item xs={12} md={4}>
                              <Box
                                sx={{
                                  p: 2,
                                  background:
                                    'rgba(34, 197, 94, 0.1)',
                                  border:
                                    '1px solid rgba(34, 197, 94, 0.3)',
                                  borderRadius: 1.5,
                                  textAlign: 'center',
                                  height: '100%',
                                }}
                              >
                                <Typography
                                  variant="h2"
                                  sx={{
                                    color: '#22c55e',
                                    fontWeight: 800,
                                    mb: 0.5,
                                    fontSize: '2.5rem',
                                  }}
                                >
                                  {metrics.accuracy}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: alpha('#e5e7eb', 0.9),
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                  }}
                                >
                                  Overall Accuracy
                                </Typography>
                              </Box>
                            </Grid>

                            {/* F1 Score */}
                            <Grid item xs={12} md={4}>
                              <Box
                                sx={{
                                  p: 2,
                                  background:
                                    'rgba(168, 85, 247, 0.1)',
                                  border:
                                    '1px solid rgba(168, 85, 247, 0.3)',
                                  borderRadius: 1.5,
                                  textAlign: 'center',
                                  height: '100%',
                                }}
                              >
                                <Typography
                                  variant="h2"
                                  sx={{
                                    color: '#a855f7',
                                    fontWeight: 800,
                                    mb: 0.5,
                                    fontSize: '2.5rem',
                                  }}
                                >
                                  {metrics.f1Score}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: alpha('#e5e7eb', 0.9),
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                  }}
                                >
                                  F1 Score
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Precision */}
                            <Grid item xs={12} md={4}>
                              <Box
                                sx={{
                                  p: 2,
                                  background:
                                    'rgba(59, 130, 246, 0.1)',
                                  border:
                                    '1px solid rgba(59, 130, 246, 0.3)',
                                  borderRadius: 1.5,
                                  textAlign: 'center',
                                  height: '100%',
                                }}
                              >
                                <Typography
                                  variant="h2"
                                  sx={{
                                    color: '#3b82f6',
                                    fontWeight: 800,
                                    mb: 0.5,
                                    fontSize: '2.5rem',
                                  }}
                                >
                                  {metrics.precision}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: alpha('#e5e7eb', 0.9),
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                  }}
                                >
                                  Precision
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Additional Metrics */}
                        <Grid container spacing={3}>
                          {/* Left Column - Performance Details */}
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                background: 'rgba(255, 255, 255, 0.03)',
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
                                Additional Metrics
                              </Typography>
                              <Stack spacing={2}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    background:
                                      'rgba(239, 68, 68, 0.1)',
                                    border:
                                      '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    Recall
                                  </Typography>
                                  <Chip
                                    label={metrics.recall}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(
                                        '#ef4444',
                                        0.2
                                      ),
                                      color: '#ef4444',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    background:
                                      'rgba(245, 158, 11, 0.1)',
                                    border:
                                      '1px solid rgba(245, 158, 11, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    Inference Time
                                  </Typography>
                                  <Chip
                                    label={metrics.inferenceTime}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(
                                        '#f59e0b',
                                        0.2
                                      ),
                                      color: '#f59e0b',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    background:
                                      'rgba(59, 130, 246, 0.1)',
                                    border:
                                      '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    Training Time
                                  </Typography>
                                  <Chip
                                    label={metrics.trainingTime}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(
                                        '#3b82f6',
                                        0.2
                                      ),
                                      color: '#3b82f6',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1.5,
                                    background:
                                      'rgba(168, 85, 247, 0.1)',
                                    border:
                                      '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      color: '#e5e7eb',
                                      fontSize: '0.95rem',
                                    }}
                                  >
                                    Error Rate
                                  </Typography>
                                  <Chip
                                    label={metrics.errorRate}
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(
                                        '#a855f7',
                                        0.2
                                      ),
                                      color: '#a855f7',
                                      fontWeight: 600,
                                    }}
                                  />
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>

                          {/* Right Column - Algorithm Comparison */}
                          <Grid item xs={12} md={6}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2.5,
                                background: 'rgba(255, 255, 255, 0.03)',
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
                                Algorithm Comparison
                              </Typography>
                              <Stack spacing={1.5}>
                                {metrics.comparisons.map((algo, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      p: 1.5,
                                      background: algo.isOurs
                                        ? 'rgba(34, 197, 94, 0.1)'
                                        : 'rgba(15, 23, 42, 0.5)',
                                      border: `1px solid ${
                                        algo.isOurs
                                          ? 'rgba(34, 197, 94, 0.3)'
                                          : 'rgba(148, 163, 184, 0.2)'
                                      }`,
                                      borderRadius: 1,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Typography
                                      variant="body1"
                                      sx={{
                                        color: algo.isOurs
                                          ? '#22c55e'
                                          : '#e5e7eb',
                                        fontSize: '0.95rem',
                                        fontWeight: algo.isOurs ? 600 : 400,
                                      }}
                                    >
                                      {algo.name}
                                    </Typography>
                                    <Chip
                                      label={algo.accuracy}
                                      size="small"
                                      sx={{
                                        backgroundColor: algo.isOurs
                                          ? alpha('#22c55e', 0.2)
                                          : alpha('#6b7280', 0.2),
                                        color: algo.isOurs
                                          ? '#22c55e'
                                          : '#6b7280',
                                        fontWeight: 600,
                                      }}
                                    />
                                  </Box>
                                ))}
                              </Stack>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
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

export default Abstract;
