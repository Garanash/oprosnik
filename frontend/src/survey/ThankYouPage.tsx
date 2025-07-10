import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ThankYouPage: React.FC = () => (
  <Box minHeight="100vh" minWidth="100vw" width="100vw" maxWidth="100vw" height="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f8fafc" p={0} m={0} sx={{ overflowX: 'hidden' }}>
    <Paper elevation={4} sx={{ p: 6, borderRadius: 4, textAlign: 'center', background: 'linear-gradient(90deg, #e0f7fa 0%, #f8fafc 100%)', maxWidth: 600, width: '100%' }}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h4" fontWeight={700} mb={2} color="success.main">Спасибо за участие!</Typography>
      <Typography variant="h6" color="text.secondary">Ваши ответы успешно отправлены.</Typography>
    </Paper>
  </Box>
);

export default ThankYouPage; 