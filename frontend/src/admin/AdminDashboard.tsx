import React, { useState } from 'react';
import SurveyList from './SurveyList';
import SurveyForm from './SurveyForm';
import SurveyStats from './SurveyStats';
import { Box, Paper } from '@mui/material';

const AdminDashboard: React.FC = () => {
  const [mode, setMode] = useState<'list' | 'create' | 'edit' | 'stats'>('list');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100vw',
        minWidth: 320,
        margin: '0 auto',
        p: 3,
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {mode === 'list' && (
        <SurveyList
          onCreate={() => { setMode('create'); setSelectedId(null); }}
          onEdit={id => { setMode('edit'); setSelectedId(id); }}
          onStats={id => { setMode('stats'); setSelectedId(id); }}
        />
      )}
      {mode === 'create' && (
        <SurveyForm onSubmit={() => setMode('list')} onCancel={() => setMode('list')} />
      )}
      {mode === 'edit' && selectedId && (
        <SurveyForm id={selectedId} onSubmit={() => setMode('list')} onCancel={() => setMode('list')} key={selectedId} />
      )}
      {mode === 'stats' && selectedId && (
        <SurveyStats surveyId={selectedId} onBack={() => setMode('list')} />
      )}
    </Box>
  );
};

export default AdminDashboard; 