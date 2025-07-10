import React from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
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
          <div style={{ width: '100vw', maxWidth: '100vw', overflowX: 'auto', overflowY: 'auto', height: '70vh' }}>
            <Table size="small" sx={{ width: '100vw', minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Имя</TableCell>
                  <TableCell>Фамилия</TableCell>
                  <TableCell>Время</TableCell>
                  {questions.map(q => (
                    <TableCell key={q.id} align="center" sx={{ minWidth: 220 }}>{q.text}</TableCell>
                  ))}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {respondents.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{r.first_name}</TableCell>
                    <TableCell>{r.last_name}</TableCell>
                    <TableCell>{new Date(r.started_at).toLocaleString()}</TableCell>
                    {questions.map(q => {
                      const ans = r.answers.find(a => a.question_id === q.id);
                      return (
                        <TableCell key={q.id} align="center" sx={{ minWidth: 220 }}>
                          {ans?.text || ans?.option_id || ''}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteRespondent(r.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
};

export default SurveyStats; 