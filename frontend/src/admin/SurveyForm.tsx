import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, IconButton, Paper, MenuItem, Divider, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

interface Option {
  text: string;
}
interface Question {
  text: string;
  type: string;
  options: Option[];
}
interface SurveyFormProps {
  id?: number;
  initial?: {
    title: string;
    description?: string;
    questions: Question[];
  };
  onSubmit: () => void;
  onCancel: () => void;
}

const defaultQuestion = (): Question => ({ text: '', type: 'text', options: [] });

const SurveyForm: React.FC<SurveyFormProps> = ({ id, initial, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [questions, setQuestions] = useState<Question[]>(initial?.questions || [defaultQuestion()]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      setInitLoading(true);
      axios.get(`/api/admin/surveys/${id}`)
        .then(({ data }) => {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setQuestions(
            (data.questions || []).map((q: any) => ({
              text: q.text,
              type: q.type,
              options: q.options?.map((o: any) => ({ text: o.text })) || []
            }))
          );
        })
        .finally(() => setInitLoading(false));
    } else {
      setTitle('');
      setDescription('');
      setQuestions([defaultQuestion()]);
    }
  }, [id]);

  const handleAddQuestion = () => setQuestions([...questions, defaultQuestion()]);
  const handleRemoveQuestion = (idx: number) => setQuestions(questions.filter((_, i) => i !== idx));
  const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
    setQuestions(questions.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };
  const handleAddOption = (qIdx: number) => {
    setQuestions(questions.map((q, i) => i === qIdx ? { ...q, options: [...(q.options || []), { text: '' }] } : q));
  };
  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    setQuestions(questions.map((q, i) => i === qIdx ? { ...q, options: q.options.filter((_, j) => j !== oIdx) } : q));
  };
  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(questions.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? { ...o, text: value } : o) } : q));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (id) {
        await axios.put(`/api/admin/surveys/${id}`, {
          title,
          description,
          questions: questions.map(q => ({
            text: q.text,
            type: q.type,
            options: q.type === 'text' ? [] : q.options
          }))
        });
        setSuccess(true);
        setTimeout(() => { setSuccess(false); onSubmit(); }, 1200);
      } else {
        await axios.post('/api/admin/surveys', {
          title,
          description,
          questions: questions.map(q => ({
            text: q.text,
            type: q.type,
            options: q.type === 'text' ? [] : q.options
          }))
        });
        onSubmit();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={800} margin="auto" p={3}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)', boxShadow: 6 }}>
        {initLoading ? (
          <Typography>Загрузка...</Typography>
        ) : (
        <>
        <Box display="flex" alignItems="center" mb={2}>
          {id && (
            <Button startIcon={<ArrowBackIcon />} onClick={onCancel} sx={{ mr: 2, borderRadius: 3, minWidth: 40 }} color="inherit" variant="text">
              Назад
            </Button>
          )}
          <Typography variant="h5" fontWeight={700}>
            {id ? `Редактировать опрос` : 'Создать опрос'}
          </Typography>
        </Box>
        <TextField label="Название опроса" fullWidth margin="normal" value={title} onChange={e => setTitle(e.target.value)} sx={{ mb: 2, background: '#fff', borderRadius: 2 }} />
        <TextField label="Описание" fullWidth margin="normal" multiline rows={2} value={description} onChange={e => setDescription(e.target.value)} sx={{ mb: 2, background: '#fff', borderRadius: 2 }} />
        <Divider sx={{ my: 2 }} />
        {questions.map((q, idx) => (
          <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 3, background: '#fff', boxShadow: 1 }} variant="outlined">
            <Box display="flex" alignItems="center" gap={1}>
              <TextField label={`Вопрос ${idx + 1}`} fullWidth value={q.text} onChange={e => handleQuestionChange(idx, 'text', e.target.value)} sx={{ mr: 2, background: '#f5f7fa', borderRadius: 2 }} />
              <TextField select label="Тип" value={q.type} onChange={e => handleQuestionChange(idx, 'type', e.target.value)} sx={{ width: 180, background: '#f5f7fa', borderRadius: 2 }}>
                <MenuItem value="text">Текст</MenuItem>
                <MenuItem value="select">Один из списка</MenuItem>
                <MenuItem value="multiselect">Несколько из списка</MenuItem>
              </TextField>
              <IconButton onClick={() => handleRemoveQuestion(idx)} disabled={questions.length === 1}><DeleteIcon /></IconButton>
            </Box>
            {(q.type === 'select' || q.type === 'multiselect') && (
              <Box mt={2}>
                <Typography variant="subtitle2">Варианты ответа:</Typography>
                {q.options.map((o, oIdx) => (
                  <Box key={oIdx} display="flex" alignItems="center" gap={1} mt={1}>
                    <TextField label={`Вариант ${oIdx + 1}`} value={o.text} onChange={e => handleOptionChange(idx, oIdx, e.target.value)} sx={{ mr: 1, background: '#f5f7fa', borderRadius: 2 }} />
                    <IconButton onClick={() => handleRemoveOption(idx, oIdx)}><DeleteIcon /></IconButton>
                  </Box>
                ))}
                <Button startIcon={<AddIcon />} onClick={() => handleAddOption(idx)} sx={{ mt: 1, borderRadius: 2 }}>Добавить вариант</Button>
              </Box>
            )}
          </Paper>
        ))}
        <Button startIcon={<AddIcon />} onClick={handleAddQuestion} sx={{ mb: 2, borderRadius: 2 }}>Добавить вопрос</Button>
        <Box mt={2} display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading} sx={{ borderRadius: 3, minWidth: 140 }}>{id ? 'Сохранить изменения' : 'Сохранить'}</Button>
          <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 3, minWidth: 120 }}>Отмена</Button>
        </Box>
        <Snackbar open={success} autoHideDuration={1200} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" sx={{ width: '100%' }}>
            Опрос успешно обновлён
          </Alert>
        </Snackbar>
        </>
        )}
      </Paper>
    </Box>
  );
};

export default SurveyForm; 