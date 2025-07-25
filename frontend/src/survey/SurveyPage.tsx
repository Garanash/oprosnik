import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Box, Typography, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup, CircularProgress, Paper
} from '@mui/material';

interface Option { id: number; text: string; }
interface Question { id: number; text: string; type: string; options: Option[]; }
interface Survey { id: number; token: string; title: string; description?: string; questions: Question[]; }

const fetchSurvey = async (token: string): Promise<Survey> => {
  const { data } = await axios.get(`/api/surveys/token/${token}`);
  return data;
};

const SurveyPage: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [error, setError] = useState<string | null>(null);

  const { data: survey, isLoading } = useQuery({ queryKey: ['survey', token], queryFn: () => fetchSurvey(token!) });
  const mutation = useMutation({
    mutationFn: (payload: any) => axios.post(`/api/surveys/${survey?.id}/submit`, payload),
    onSuccess: () => navigate('/thankyou')
  });

  const handleStart = () => setOpen(false);

  const handleAnswer = (q: Question, value: any) => {
    setAnswers(a => ({ ...a, [q.id]: value }));
  };

  const isAllAnswered = survey && survey.questions.every(q => {
    if (q.type === 'text') return (answers[q.id] || '').trim() !== '';
    if (q.type === 'select') return !!answers[q.id];
    if (q.type === 'multiselect') return Array.isArray(answers[q.id]) && answers[q.id].length > 0;
    return true;
  });

  const handleSubmit = () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError('Пожалуйста, введите имя и фамилию.');
      return;
    }
    if (!isAllAnswered) {
      setError('Пожалуйста, ответьте на все вопросы.');
      return;
    }
    if (!survey) return;
    const payload = {
      respondent: { first_name: firstName, last_name: lastName },
      answers: survey.questions.map(q => {
        if (q.type === 'text') {
          return { question_id: q.id, text: answers[q.id] || '' };
        } else if (q.type === 'select') {
          return { question_id: q.id, option_id: answers[q.id] };
        } else if (q.type === 'multiselect') {
          return { question_id: q.id, option_id: null, text: (answers[q.id] || []).join(',') };
        }
        return { question_id: q.id };
      })
    };
    mutation.mutate(payload, {
      onError: (e: any) => setError(e?.response?.data?.detail || 'Ошибка отправки. Попробуйте ещё раз.')
    });
  };

  if (isLoading) return <Box textAlign="center" mt={8}><CircularProgress /></Box>;
  if (!survey) return <Typography>Опрос не найден</Typography>;

  return (
    <Box minHeight="80vh" width="100vw" maxWidth="100vw" p={0} m={0} display="flex" alignItems="center" justifyContent="center" bgcolor="#f8fafc" sx={{ overflowX: 'hidden' }}>
      <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 700, width: '100%' }}>
        <Dialog open={open} disableEscapeKeyDown>
          <DialogTitle>Введите имя и фамилию</DialogTitle>
          <DialogContent>
            <TextField label="Имя" fullWidth margin="normal" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <TextField label="Фамилия" fullWidth margin="normal" value={lastName} onChange={e => setLastName(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStart} disabled={!firstName || !lastName} variant="contained">Начать</Button>
          </DialogActions>
        </Dialog>
        {!open && (
          <Box>
            <Typography variant="h4" mb={2} fontWeight={700}>{survey.title}</Typography>
            <Typography mb={2} color="text.secondary">{survey.description}</Typography>
            {survey.questions.map(q => (
              <Paper key={q.id} elevation={2} sx={{ mb: 4, p: 2, borderLeft: '6px solid #1976d2', background: '#fafdff', boxShadow: '0 2px 12px #e3eaf3' }}>
                <Typography mb={1.5} fontWeight={700} fontSize={24}>{q.text}</Typography>
                {q.type === 'text' && (
                  <TextField fullWidth value={answers[q.id] || ''} onChange={e => handleAnswer(q, e.target.value)} sx={{ background: '#f5f7fa', borderRadius: 2, fontSize: 20, minHeight: 56, '& .MuiInputBase-input': { fontSize: 20, py: 2 } }} InputProps={{ style: { fontSize: 20, minHeight: 56, padding: '18px 16px' } }} />
                )}
                {q.type === 'select' && (
                  <RadioGroup value={answers[q.id] || ''} onChange={e => handleAnswer(q, Number(e.target.value))} sx={{ gap: 2, pl: 1 }}>
                    {q.options.map(opt => (
                      <FormControlLabel key={opt.id} value={opt.id} control={<Radio sx={{ p: 1.5, '& .MuiSvgIcon-root': { fontSize: 32 } }} />} label={<span style={{ fontSize: 18 }}>{opt.text}</span>} sx={{ mb: 1 }} />
                    ))}
                  </RadioGroup>
                )}
                {q.type === 'multiselect' && (
                  <FormGroup sx={{ pl: 1 }}>
                    {q.options.map(opt => (
                      <FormControlLabel
                        key={opt.id}
                        control={
                          <Checkbox
                            checked={Array.isArray(answers[q.id]) && answers[q.id].includes(opt.id)}
                            onChange={e => {
                              const prev = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                              if (e.target.checked) handleAnswer(q, [...prev, opt.id]);
                              else handleAnswer(q, prev.filter((id: number) => id !== opt.id));
                            }}
                            sx={{ p: 1.5, '& .MuiSvgIcon-root': { fontSize: 32 } }}
                          />
                        }
                        label={<span style={{ fontSize: 18 }}>{opt.text}</span>}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </FormGroup>
                )}
              </Paper>
            ))}
            {error && <Typography color="error" mb={2}>{error}</Typography>}
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={mutation.isLoading || !isAllAnswered} sx={{ fontSize: 20, py: 2, px: 5, borderRadius: 3, mt: 3 }}>
              {mutation.isLoading ? <CircularProgress size={24} /> : 'Отправить'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SurveyPage; 