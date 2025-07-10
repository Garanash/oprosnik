import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button, List, ListItem, ListItemText, Typography, Box, Paper, Pagination } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { QRCodeSVG } from 'qrcode.react';
import IconButton from '@mui/material/IconButton';
import QrCodeIcon from '@mui/icons-material/QrCode';
import Popover from '@mui/material/Popover';

interface Survey {
  id: number;
  token: string;
  title: string;
  description?: string;
  created_at: string;
}

const fetchSurveys = async (): Promise<Survey[]> => {
  const { data } = await axios.get('/api/admin/surveys');
  return Array.isArray(data) ? data : [];
};

const SurveyList: React.FC<{ onCreate: () => void; onEdit: (id: number) => void; onStats: (id: number) => void; }> = ({ onCreate, onEdit, onStats }) => {
  const queryClient = useQueryClient();
  const { data: surveys = [], isLoading } = useQuery({ queryKey: ['surveys'], queryFn: fetchSurveys });
  const [page, setPage] = useState(1);
  const [qrAnchorEl, setQrAnchorEl] = useState<null | HTMLElement>(null);
  const [qrValue, setQrValue] = useState<string>('');

  const handleQrOpen = (event: React.MouseEvent<HTMLElement>, token: string) => {
    setQrAnchorEl(event.currentTarget);
    setQrValue(`${window.location.origin}/survey/${token}`);
  };
  const handleQrClose = () => {
    setQrAnchorEl(null);
    setQrValue('');
  };
  const qrOpen = Boolean(qrAnchorEl);
  const perPage = 10;
  const totalPages = Math.ceil(surveys.length / perPage);
  const pagedSurveys = surveys.slice((page - 1) * perPage, page * perPage);

  const handleDelete = async (id: number) => {
    if (window.confirm('Удалить этот опрос?')) {
      await axios.delete(`/api/admin/surveys/${id}`);
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  };

  return (
    <Box width="80vw" maxWidth={1100} minWidth={320} margin="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={700}>Опросы</Typography>
        <Button variant="contained" color="primary" size="large" onClick={onCreate} sx={{ borderRadius: 3, boxShadow: 2 }}>Создать опрос</Button>
      </Box>
      {isLoading ? (
        <Typography>Загрузка...</Typography>
      ) : Array.isArray(surveys) && surveys.length > 0 ? (
        <>
        <List sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          {pagedSurveys.map(survey => (
            <Paper key={survey.id} elevation={2} sx={{ p: 3, borderRadius: 3, transition: 'box-shadow 0.2s', ':hover': { boxShadow: 8 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box flex={1} minWidth={0}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{survey.title}</Typography>
                <Typography sx={{ color: '#666', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 500 }}>{survey.description}</Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center" ml={2}>
                <Button onClick={() => onEdit(survey.id)} variant="outlined" sx={{ minWidth: 120 }}>Редактировать</Button>
                <Button onClick={() => onStats(survey.id)} variant="outlined" sx={{ minWidth: 110 }}>Статистика</Button>
                <Button color="error" onClick={() => handleDelete(survey.id)} variant="outlined" sx={{ minWidth: 90 }}>Удалить</Button>
                <a href={`/survey/${survey.token}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 12, color: '#1976d2', display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Ссылка для прохождения">
                  <LinkIcon fontSize="medium" />
                </a>
                <IconButton onClick={e => handleQrOpen(e, survey.token)} sx={{ ml: 1 }} title="QR-код для прохождения">
                  <QrCodeIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </List>
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
          </Box>
        )}
        </>
      ) : (
        <Typography>Опросов пока нет</Typography>
      )}
      <Popover
        open={qrOpen}
        anchorEl={qrAnchorEl}
        onClose={handleQrClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box p={2} display="flex" flexDirection="column" alignItems="center">
          <QRCodeSVG value={qrValue} size={180} />
          <Typography variant="caption" mt={1} sx={{ wordBreak: 'break-all', maxWidth: 200 }}>{qrValue}</Typography>
        </Box>
      </Popover>
    </Box>
  );
};

export default SurveyList; 