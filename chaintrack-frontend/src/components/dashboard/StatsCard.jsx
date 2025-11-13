import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ title, value, icon, color = 'primary', change }) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      {/* Background Icon */}
      <Box
        sx={{
          position: 'absolute',
          right: -10,
          top: -10,
          opacity: 0.1,
          color: `${color}.main`,
        }}
      >
        <Box sx={{ fontSize: 120 }}>{icon}</Box>
      </Box>

      {/* Content */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}.main`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {title}
      </Typography>

      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
        {value.toLocaleString()}
      </Typography>

      {change && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TrendingUp size={14} color="#10b981" />
          <Typography variant="caption" color="success.main">
            {change}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default StatsCard;