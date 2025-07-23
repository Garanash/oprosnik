import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Pagination, Stack } from '@mui/material';
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

  // Пагинация
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pageCount = Math.ceil(respondents.length / rowsPerPage);
  const pagedRespondents = respondents.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
      <div style={{ width: '100vw', minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%)', margin: 0, padding: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 0 12px 0', background: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 8px #e0e0e0', zIndex: 2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ ml: 3, color: '#222' }}>Статистика по опросу #{surveyId}</Typography>
          <Button onClick={onBack} sx={{ ml: 2, fontWeight: 600, color: '#1976d2' }}>Назад</Button>
        </div>
        {isLoading ? (
          <Typography sx={{ px: 3 }}>Загрузка...</Typography>
        ) : (
          <Box sx={{ flex: 1, width: '100%', maxWidth: '100vw', overflowX: 'hidden', overflowY: 'auto', p: { xs: 0, md: 2 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 'calc(100vh - 120px)' }}>
            <Paper elevation={4} sx={{ width: '100%', maxWidth: 'calc(100vw - 32px)', borderRadius: 3, p: 2, boxShadow: '0 4px 24px #e0e7ef', background: 'rgba(255,255,255,0.98)', overflowX: 'auto', m: '0 auto' }}>
              <Table size="small" sx={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ border: '1px solid #e0e0e0', fontWeight: 600, background: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Имя</TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', fontWeight: 600, background: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Фамилия</TableCell>
                    <TableCell sx={{ border: '1px solid #e0e0e0', fontWeight: 600, background: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Время</TableCell>
                    {questions.map(q => (
                      <TableCell key={q.id} align="center" sx={{ border: '1px solid #e0e0e0', fontWeight: 600, background: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</TableCell>
                    ))}
                    <TableCell sx={{ border: '1px solid #e0e0e0', background: '#f1f5f9', p: 0, width: 1 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRespondents.map(r => (
                    <TableRow key={r.id}>
                      <TableCell sx={{ border: '1px solid #e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.first_name}</TableCell>
                      <TableCell sx={{ border: '1px solid #e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.last_name}</TableCell>
                      <TableCell sx={{ border: '1px solid #e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{new Date(r.started_at).toLocaleString()}</TableCell>
                      {questions.map(q => {
                        const ans = r.answers.find(a => a.question_id === q.id);
                        const value = ans?.text || ans?.option_id || '';
                        return (
                          <TableCell
                            key={q.id}
                            align="center"
                            sx={{ border: '1px solid #e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: value ? 'pointer' : 'default', background: value ? '#f9fafb' : undefined, p: 0.5 }}
                            onClick={() => value && handleOpenDialog(String(value))}
                          >
                            <span style={{
                              display: 'inline-block',
                              maxWidth: '100%',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              verticalAlign: 'middle',
                              color: value ? '#1976d2' : '#222',
                              fontWeight: value ? 500 : 400,
                              fontSize: 15
                            }}>{value}</span>
                          </TableCell>
                        );
                      })}
                      <TableCell sx={{ border: '1px solid #e0e0e0', p: 0, textAlign: 'center', width: 1 }}>
                        <IconButton color="error" onClick={() => handleDeleteRespondent(r.id)} size="small" sx={{ m: 0 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pageCount > 1 && (
                <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                  <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" shape="rounded" />
                </Stack>
              )}
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