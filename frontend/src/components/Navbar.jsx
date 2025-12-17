import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Stack,
  Container,
  alpha,
  IconButton,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { keyframes } from '@emotion/react';

const Navbar = () => {
  const [navOpen, setNavOpen] = React.useState(false);
  const location = useLocation();

  const gradientFlow = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  `;

  // Removed Statistics, keeping only 5 buttons
  const navItems = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Abstract', path: '/abstract', icon: <DescriptionIcon /> },
    { name: 'Single Predict', path: '/single-prediction', icon: <SecurityIcon /> },
    { name: 'Batch Predict', path: '/batch-prediction', icon: <TimelineIcon /> },
    { name: 'Attack Dashboard', path: '/attacks', icon: <WarningIcon /> },
    // Statistics button removed
  ];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        background:
          'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            gap: 2,
          }}
        >
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <SecurityIcon
                sx={{
                  fontSize: 28,
                  color: '#f97316',
                  filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.5))',
                }}
              />
            </motion.div>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background:
                  'linear-gradient(120deg, #f9fafb 0%, #fca5a5 30%, #60a5fa 65%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
                animation: `${gradientFlow} 6s ease-in-out infinite`,
                fontSize: { xs: '1rem', sm: '1.2rem' },
              }}
            >
              NIDS AI
            </Typography>
          </Box>

          {/* Desktop Navigation - Now with 5 buttons */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.name}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  color:
                    location.pathname === item.path
                      ? '#f97316'
                      : alpha('#e5e7eb', 0.8),
                  background:
                    location.pathname === item.path
                      ? alpha('#f97316', 0.15)
                      : 'transparent',
                  border:
                    location.pathname === item.path
                      ? '1px solid rgba(249, 115, 22, 0.3)'
                      : '1px solid transparent',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  minWidth: 'auto',
                  '&:hover': {
                    background: alpha('#f97316', 0.1),
                    borderColor: alpha('#f97316', 0.2),
                    color: '#f97316',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.name}
              </Button>
            ))}
          </Stack>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setNavOpen(!navOpen)}
            sx={{
              display: { md: 'none' },
              color: '#f97316',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              background: alpha('#f97316', 0.1),
              '&:hover': {
                background: alpha('#f97316', 0.2),
              },
            }}
          >
            {navOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Mobile Navigation Menu */}
        {navOpen && (
          <Box
            sx={{
              position: 'absolute',
              top: '64px',
              left: 0,
              right: 0,
              zIndex: 1090,
              background:
                'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              display: { md: 'none' },
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: { transform: 'translateX(100%); opacity: 0;' },
                to: { transform: 'translateX(0); opacity: 1;' },
              },
            }}
          >
            <Stack spacing={0} sx={{ p: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  onClick={() => setNavOpen(false)}
                  fullWidth
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1.5,
                    borderRadius: '8px',
                    color:
                      location.pathname === item.path
                        ? '#f97316'
                        : alpha('#e5e7eb', 0.8),
                    background:
                      location.pathname === item.path
                        ? alpha('#f97316', 0.15)
                        : 'transparent',
                    border:
                      location.pathname === item.path
                        ? '1px solid rgba(249, 115, 22, 0.3)'
                        : '1px solid transparent',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    mb: 1,
                    '&:hover': {
                      background: alpha('#f97316', 0.1),
                      borderColor: alpha('#f97316', 0.2),
                      color: '#f97316',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Navbar;