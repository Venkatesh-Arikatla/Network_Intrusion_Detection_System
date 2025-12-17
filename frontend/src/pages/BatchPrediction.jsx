import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Stack,
  alpha,
  GlobalStyles,
  Grid,
  Card,
  LinearProgress,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Dangerous as DangerousIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import * as XLSX from 'xlsx';

const BatchPrediction = () => {
  const [file, setFile] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'results'

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  `;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      const acceptedTypes = ['csv', 'xlsx'];

      if (!acceptedTypes.includes(fileExtension)) {
        setError('Please upload a CSV or Excel (XLSX) file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const convertXLSXtoCSV = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(firstSheet);
          resolve(csv);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV or Excel file first');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileExtension === 'xlsx') {
        try {
          const csvContent = await convertXLSXtoCSV(file);
          const csvBlob = new Blob([csvContent], { type: 'text/csv' });
          const csvFile = new File(
            [csvBlob],
            `${file.name.replace('.xlsx', '.csv')}`,
            { type: 'text/csv' }
          );
          formData.append('file', csvFile);
        } catch (conversionError) {
          console.error('Conversion error:', conversionError);
          clearInterval(progressInterval);
          setError(
            "Failed to convert Excel file. Please ensure it's a valid XLSX file."
          );
          setLoading(false);
          return;
        }
      } else {
        formData.append('file', file);
      }

      const response = await fetch(`${API_BASE_URL}/api/batch-predict`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPredictions(data.predictions || []);
        setActiveTab('results');

        if (data.database_status?.saved_count > 0) {
          setSnackbar({
            open: true,
            message: `✅ Batch analysis complete! ${data.database_status.saved_count} records saved to database.`,
            severity: 'success',
          });
        } else {
          setSnackbar({
            open: true,
            message:
              '⚠ Batch analysis complete, but no records were saved to database.',
            severity: 'warning',
          });
        }
      } else {
        setError(data.error || 'Batch prediction failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(
        `Failed to connect to the prediction server. Make sure the Flask server is running on port 8000. Error: ${err.message}`
      );
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPredictions([]);
    setError(null);
    setUploadProgress(0);
    setActiveTab('upload');
  };

  const handleDownloadResults = () => {
    if (predictions.length === 0) return;

    const csvContent = [
      [
        'ID',
        'Prediction',
        'Risk Level',
        'Confidence',
        'Normal Probability',
        'Attack Probability',
        'Attack Type',
      ],
      ...predictions.map((pred, index) => [
        index + 1,
        pred.prediction_label || 'Unknown',
        pred.risk_level || 'UNKNOWN',
        `${pred.confidence || 0}%`,
        `${(pred.probabilities?.normal || 0).toFixed(2)}%`,
        `${(pred.probabilities?.attack || 0).toFixed(2)}%`,
        pred.attack_type || 'N/A',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_predictions_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
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
    const level = riskLevel?.toUpperCase();
    if (level === 'NORMAL') {
      return <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 28 }} />;
    }
    if (level === 'LOW' || level === 'MEDIUM' || level === 'WARNING') {
      return <WarningIcon sx={{ color: '#f59e0b', fontSize: 28 }} />;
    }
    if (level === 'HIGH' || level === 'CRITICAL') {
      return (
        <DangerousIcon sx={{ color: getRiskColor(level), fontSize: 28 }} />
      );
    }
    return <InfoIcon sx={{ color: '#6b7280', fontSize: 28 }} />;
  };

  const getStats = () => {
    if (predictions.length === 0) return null;

    const total = predictions.length;
    const normalCount = predictions.filter(
      (p) => p.prediction_label?.toUpperCase() === 'NORMAL'
    ).length;
    const attackCount = total - normalCount;
    const highRiskCount = predictions.filter((p) =>
      ['HIGH', 'CRITICAL'].includes(p.risk_level?.toUpperCase())
    ).length;

    return {
      total,
      normalCount,
      attackCount,
      highRiskCount,
      normalPercentage: ((normalCount / total) * 100).toFixed(1),
      attackPercentage: ((attackCount / total) * 100).toFixed(1),
      highRiskPercentage: ((highRiskCount / total) * 100).toFixed(1),
    };
  };

  const stats = getStats();

  return (
    <>
      {/* Global styles: mobile scroll, desktop fixed (same pattern as SinglePrediction) */}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
        message={snackbar.message}
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
              {/* Header - same pattern as SinglePrediction */}
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
                      Batch Network Analysis
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: alpha('#e5e7eb', 0.7),
                        fontSize: '0.85rem',
                      }}
                    >
                      Upload and analyze multiple network traffic records
                    </Typography>
                  </Box>
                </Box>

                {/* Tab Navigation */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={activeTab === 'upload' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('upload')}
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 0.75,
                      ...(activeTab === 'upload'
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
                    File Upload
                  </Button>
                  <Button
                    variant={activeTab === 'results' ? 'contained' : 'outlined'}
                    onClick={() => setActiveTab('results')}
                    disabled={!predictions.length}
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
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          }
                        : {
                            borderColor: alpha('#e5e7eb', 0.3),
                            color: alpha(
                              '#e5e7eb',
                              predictions.length ? 1 : 0.3
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
                {error && (
                  <Box sx={{ p: 2, pb: 1, flexShrink: 0 }}>
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
                  </Box>
                )}

                {/* Content with internal scrolling */}
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    pt: 1,
                  }}
                >
                  {/* Upload Tab */}
                  {activeTab === 'upload' && (
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
                            Upload Network Traffic Data
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: alpha('#e5e7eb', 0.7),
                              fontSize: '0.9rem',
                            }}
                          >
                            Upload CSV or Excel file containing multiple network
                            traffic records for batch analysis.
                          </Typography>
                        </Box>

                        {/* Upload form */}
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
                          {/* Upload area */}
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: 2,
                              border: '2px dashed',
                              borderColor: file
                                ? '#60a5fa'
                                : alpha('#e5e7eb', 0.3),
                              borderRadius: 2,
                              p: 4,
                              backgroundColor: file
                                ? 'rgba(96, 165, 250, 0.05)'
                                : 'rgba(255, 255, 255, 0.02)',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {file ? (
                              <Box sx={{ textAlign: 'center', width: '100%' }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    mb: 2,
                                  }}
                                >
                                  <CloudUploadIcon
                                    sx={{ color: '#60a5fa', fontSize: 40 }}
                                  />
                                  <Box sx={{ textAlign: 'left' }}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        color: '#e5e7eb',
                                        fontSize: '1rem',
                                      }}
                                    >
                                      {file.name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: alpha('#e5e7eb', 0.6),
                                        fontSize: '0.8rem',
                                      }}
                                    >
                                      {(file.size / 1024).toFixed(2)} KB •{' '}
                                      {file.name.split('.').pop().toUpperCase()}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={handleRemoveFile}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  >
                                    <DeleteIcon
                                      sx={{ color: '#ef4444', fontSize: 20 }}
                                    />
                                  </IconButton>
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: alpha('#e5e7eb', 0.7),
                                    fontSize: '0.8rem',
                                    mb: 2,
                                  }}
                                >
                                  {file.name.endsWith('.csv') ? 'CSV' : 'Excel'}{' '}
                                  file ready for analysis
                                </Typography>
                              </Box>
                            ) : (
                              <>
                                <CloudUploadIcon
                                  sx={{
                                    color: alpha('#e5e7eb', 0.5),
                                    fontSize: 48,
                                  }}
                                />
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: alpha('#e5e7eb', 0.8),
                                    textAlign: 'center',
                                  }}
                                >
                                  Drag & drop your CSV or Excel file here, or
                                  click to browse
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: alpha('#e5e7eb', 0.6),
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                  }}
                                >
                                  Supports CSV and XLSX files with network
                                  traffic features
                                </Typography>
                              </>
                            )}

                            <Button
                              component="label"
                              variant="outlined"
                              startIcon={<CloudUploadIcon />}
                              sx={{
                                mt: 1,
                                borderColor: alpha('#60a5fa', 0.5),
                                color: '#60a5fa',
                                '&:hover': {
                                  borderColor: '#60a5fa',
                                  backgroundColor:
                                    'rgba(96, 165, 250, 0.1)',
                                },
                              }}
                            >
                              {file ? 'Change File' : 'Browse Files'}
                              <input
                                type="file"
                                hidden
                                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                onChange={handleFileChange}
                              />
                            </Button>
                          </Box>

                          {loading && uploadProgress > 0 && (
                            <Box sx={{ width: '100%', mt: 2 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: alpha('#e5e7eb', 0.7),
                                  mb: 1,
                                  fontSize: '0.8rem',
                                }}
                              >
                                Uploading: {uploadProgress}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor:
                                    'rgba(255, 255, 255, 0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    background:
                                      'linear-gradient(90deg, #60a5fa 0%, #38bdf8 100%)',
                                  },
                                }}
                              />
                            </Box>
                          )}

                          {/* Action Buttons */}
                          <Box sx={{ mt: 3, mb: 1, flexShrink: 0 }}>
                            <Stack direction="row" spacing={2}>
                              <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading || !file}
                                startIcon={
                                  loading ? (
                                    <CircularProgress
                                      size={20}
                                      color="inherit"
                                    />
                                  ) : (
                                    <TimelineIcon sx={{ fontSize: 20 }} />
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
                                {loading ? 'Processing...' : 'Analyze Batch'}
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
                                  borderColor: alpha('#e5e7eb', 0.3),
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
                              <TimelineIcon
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
                            Processing Batch Data
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: alpha('#e5e7eb', 0.7),
                              fontSize: '0.95rem',
                            }}
                          >
                            Analyzing {file?.name || 'file'} with AI model...
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
                      ) : predictions.length > 0 ? (
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
                            onClick={() => setActiveTab('upload')}
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
                            Back to Upload
                          </Button>

                          {/* Batch Summary */}
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
                              <TimelineIcon
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
                                Batch Analysis Complete
                              </Typography>
                            </Box>
                            <Chip
                              label={`${predictions.length} RECORDS PROCESSED`}
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
                            {file && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: alpha('#e5e7eb', 0.7),
                                  mt: 2,
                                  fontSize: '0.9rem',
                                }}
                              >
                                Source: {file.name}
                              </Typography>
                            )}
                          </Paper>

                          {stats && (
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
                                Analysis Summary
                              </Typography>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                  <Box
                                    sx={{
                                      p: 2,
                                      background:
                                        'rgba(96, 165, 250, 0.1)',
                                      border:
                                        '1px solid rgba(96, 165, 250, 0.3)',
                                      borderRadius: 1.5,
                                      textAlign: 'center',
                                    }}
                                  >
                                    <Typography
                                      variant="h2"
                                      sx={{
                                        color: '#60a5fa',
                                        fontWeight: 800,
                                        mb: 0.5,
                                        fontSize: '2.5rem',
                                      }}
                                    >
                                      {stats.total}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: alpha('#e5e7eb', 0.9),
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      Total Records
                                    </Typography>
                                  </Box>
                                </Grid>
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
                                      {stats.normalCount}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: alpha('#e5e7eb', 0.9),
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      Normal ({stats.normalPercentage}%)
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
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
                                      variant="h2"
                                      sx={{
                                        color: '#ef4444',
                                        fontWeight: 800,
                                        mb: 0.5,
                                        fontSize: '2.5rem',
                                      }}
                                    >
                                      {stats.attackCount}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: alpha('#e5e7eb', 0.9),
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      Attacks ({stats.attackPercentage}%)
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          )}

                          {/* Risk Distribution */}
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
                              Risk Distribution
                            </Typography>
                            <Grid container spacing={2}>
                              {['NORMAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(
                                (level) => {
                                  const count = predictions.filter(
                                    (p) =>
                                      p.risk_level?.toUpperCase() === level
                                  ).length;
                                  const percentage =
                                    predictions.length > 0
                                      ? (
                                          (count / predictions.length) *
                                          100
                                        ).toFixed(1)
                                      : 0;
                                  return (
                                    <Grid item xs={12} key={level}>
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 2,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: getRiskColor(level),
                                            minWidth: 80,
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                          }}
                                        >
                                          {level}
                                        </Typography>
                                        <Box sx={{ flex: 1 }}>
                                          <LinearProgress
                                            variant="determinate"
                                            value={percentage}
                                            sx={{
                                              height: 10,
                                              borderRadius: 5,
                                              backgroundColor:
                                                'rgba(255, 255, 255, 0.1)',
                                              '& .MuiLinearProgress-bar': {
                                                backgroundColor:
                                                  getRiskColor(level),
                                              },
                                            }}
                                          />
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: alpha('#e5e7eb', 0.8),
                                            minWidth: 60,
                                            fontSize: '0.85rem',
                                          }}
                                        >
                                          {count} ({percentage}%)
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  );
                                }
                              )}
                            </Grid>
                          </Paper>

                          {/* Results Table */}
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
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  color: '#e5e7eb',
                                  fontSize: '1.1rem',
                                  fontWeight: 600,
                                }}
                              >
                                Prediction Results ({predictions.length} records)
                              </Typography>
                              <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadResults}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '0.85rem',
                                  borderRadius: '8px',
                                  borderColor: alpha('#e5e7eb', 0.3),
                                  color: '#e5e7eb',
                                  '&:hover': {
                                    borderColor: '#f9fafb',
                                    backgroundColor: alpha(
                                      '#e5e7eb',
                                      0.1
                                    ),
                                  },
                                }}
                              >
                                Download CSV
                              </Button>
                            </Box>
                            <TableContainer
                              component={Paper}
                              sx={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                border:
                                  '1px solid rgba(148, 163, 184, 0.2)',
                                maxHeight: 300,
                                overflow: 'auto',
                                '&::-webkit-scrollbar': {
                                  width: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  background:
                                    'rgba(255, 255, 255, 0.05)',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  background:
                                    'rgba(249, 115, 22, 0.3)',
                                },
                              }}
                            >
                              <Table size="small" stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell
                                      sx={{
                                        color: '#e5e7eb',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        background:
                                          'rgba(15, 23, 42, 0.9)',
                                      }}
                                    >
                                      ID
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: '#e5e7eb',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        background:
                                          'rgba(15, 23, 42, 0.9)',
                                      }}
                                    >
                                      Prediction
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: '#e5e7eb',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        background:
                                          'rgba(15, 23, 42, 0.9)',
                                      }}
                                    >
                                      Risk Level
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        color: '#e5e7eb',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        background:
                                          'rgba(15, 23, 42, 0.9)',
                                      }}
                                    >
                                      Confidence
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {predictions.slice(0, 20).map((pred, index) => (
                                    <TableRow
                                      key={index}
                                      hover
                                      sx={{
                                        '&:last-child td, &:last-child th': {
                                          border: 0,
                                        },
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          color: '#e5e7eb',
                                          fontSize: '0.85rem',
                                        }}
                                      >
                                        {index + 1}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          color: '#e5e7eb',
                                          fontSize: '0.85rem',
                                        }}
                                      >
                                        {pred.prediction_label || 'Unknown'}
                                      </TableCell>
                                      <TableCell>
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                          }}
                                        >
                                          {getRiskIcon(pred.risk_level)}
                                          <Chip
                                            label={pred.risk_level || 'UNKNOWN'}
                                            size="small"
                                            sx={{
                                              backgroundColor: alpha(
                                                getRiskColor(pred.risk_level),
                                                0.2
                                              ),
                                              color: getRiskColor(
                                                pred.risk_level
                                              ),
                                              border: `1px solid ${alpha(
                                                getRiskColor(pred.risk_level),
                                                0.4
                                              )}`,
                                              fontWeight: 600,
                                              fontSize: '0.75rem',
                                              height: 24,
                                            }}
                                          />
                                        </Box>
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          color: '#e5e7eb',
                                          fontSize: '0.85rem',
                                        }}
                                      >
                                        {pred.confidence || 0}%
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            {predictions.length > 20 && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: alpha('#e5e7eb', 0.6),
                                  mt: 1,
                                  fontSize: '0.8rem',
                                  textAlign: 'center',
                                }}
                              >
                                Showing first 20 of {predictions.length} records
                              </Typography>
                            )}
                          </Paper>
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
                            No Batch Results
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
                            Upload a CSV or Excel file and analyze it to see
                            batch results here.
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => setActiveTab('upload')}
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
                            Go to File Upload
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

export default BatchPrediction;
