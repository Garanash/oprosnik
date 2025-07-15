import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

interface Answer {
  question_id: number;
  option_id?: number | null;
  text?: string | null;
}
interface Respondent {
  id: number;
  first_name: string;
  last_name: string;
  started_at: string;
  finished_at?: string;
  answers: Answer[];
}
interface Question { id: number; text: string; }

const fetchStats = async (surveyId: number): Promise<{ respondents: Respondent[]; questions: Question[] }> => {
  const [respRes, surveyRes] = await Promise.all([
    axios.get(`/api/admin/surveys/${surveyId}/stats`),
    axios.get(`/api/admin/surveys/${surveyId}`)
  ]);
  return { respondents: respRes.data, questions: (surveyRes.data.questions || []) };
};

const SurveyStats: React.FC<{ surveyId: number; onBack: () => void }> = ({ surveyId, onBack }) => {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['stats', surveyId], queryFn: () => fetchStats(surveyId) });

  const handleDeleteRespondent = async (respondentId: number) => {
    if (!window.confirm('Удалить этот ответ?')) return;
    await axios.delete(`/api/admin/respondents/${respondentId}`);
    refetch();
  };
  const respondents = data?.respondents || [];
  const questions = data?.questions || [];

  // Состояние для всплывающего окна
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<string>('');

  // Открытие диалога с ответом
  const handleOpenDialog = (content: string) => {
    setDialogContent(content);
    setOpenDialog(true);
  };
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <>
      <div style={{ width: '100vw', minHeight: '100vh', background: '#f8fafc', margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 0 12px 0' }}>
          <Typography variant="h5" fontWeight={700} sx={{ ml: 3 }}>Статистика по опросу #{surveyId}</Typography>
          <Button onClick={onBack} sx={{ ml: 2 }}>Назад</Button>
        </div>
        {isLoading ? (
          <Typography sx={{ px: 3 }}>Загрузка...</Typography>
        ) : (
          <Box sx={{ width: '100vw', maxWidth: '100vw', overflowX: 'auto', overflowY: 'auto', height: '70vh', p: 2 }}>
            <Paper elevation={3} sx={{ width: '100%', overflow: 'auto', borderRadius: 2 }}>
              <Table size="small" sx={{ minWidth: 1200, borderCollapse: 'separate', borderSpacing: 0 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #e0e0e0', fontWeight: 600, width: 120, background: '#f1f5f9' }}>Имя</TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', fontWeight: 600, width: 120, background: '#f1f5f9' }}>Фамилия</TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', fontWeight: 600, width: 180, background: '#f1f5f9' }}>Время</TableCell>
                    {questions.map(q => (
                      <TableCell key={q.id} align="center" sx={{ border: '1px solid #e0e0e0', fontWeight: 600, width: 220, background: '#f1f5f9' }}>{q.text}</TableCell>
                    ))}
                    <TableCell sx={{ border: '1px solid #e0e0e0', width: 60, background: '#f1f5f9' }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {respondents.map(r => (
                    <TableRow key={r.id}>
                      <TableCell sx={{ border: '1px solid #e0e0e0', width: 120 }}>{r.first_name}</TableCell>
                      <TableCell sx={{ border: '1px solid #e0e0e0', width: 120 }}>{r.last_name}</TableCell>
                      <TableCell sx={{ border: '1px solid #e0e0e0', width: 180 }}>{new Date(r.started_at).toLocaleString()}</TableCell>
                      {questions.map(q => {
                        const ans = r.answers.find(a => a.question_id === q.id);
                        const value = ans?.text || ans?.option_id || '';
                        return (
                          <TableCell
                            key={q.id}
                            align="center"
                            sx={{ border: '1px solid #e0e0e0', width: 220, cursor: value ? 'pointer' : 'default', background: value ? '#f9fafb' : undefined }}
                            onClick={() => value && handleOpenDialog(String(value))}
                          >
                            <span style={{
                              display: 'inline-block',
                              maxWidth: 180,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              verticalAlign: 'middle',
                              color: value ? '#1976d2' : '#222',
                              fontWeight: value ? 500 : 400
                            }}>{value}</span>
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{ border: '1px solid #e0e0e0', width: 60 }}>
                        <IconButton color="error" onClick={() => handleDeleteRespondent(r.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Ответ</DialogTitle>
          <DialogContent>
            <Typography sx={{ wordBreak: 'break-word', fontSize: 18 }}>{dialogContent}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default SurveyStats; 