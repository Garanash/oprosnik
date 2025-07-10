import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import SurveyPage from './survey/SurveyPage';
import ThankYouPage from './survey/ThankYouPage';
import { Box, Paper } from '@mui/material';

const App: React.FC = () => (
  <Box minHeight="100vh" display="flex" flexDirection="column">
    <Box flex={1} display="flex" flexDirection="column">
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/survey/:token" element={<SurveyPage />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </Box>
    <Paper component="footer" elevation={8} sx={{ width: '100vw', minWidth: '100vw', py: 2, px: 3, position: 'sticky', bottom: 0, left: 0, bgcolor: '#181A1B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, zIndex: 100, borderRadius: 0 }}>
      <img src="https://almazgeobur.kz/wp-content/uploads/2021/08/agb_logo_h-2.svg" alt="" style={{ height: 32, marginRight: 12, filter: 'brightness(0) invert(1)' }} />
      <span style={{ fontWeight: 500, fontSize: 16, color: '#FCB813', letterSpacing: 1 }}></span>
    </Paper>
  </Box>
);

export default App; 