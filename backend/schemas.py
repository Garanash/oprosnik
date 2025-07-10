from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OptionCreate(BaseModel):
    text: str

class OptionRead(BaseModel):
    id: int
    text: str
    class Config:
        orm_mode = True

class QuestionCreate(BaseModel):
    text: str
    type: str  # text, select, multiselect
    options: Optional[List[OptionCreate]] = None

class QuestionRead(BaseModel):
    id: int
    text: str
    type: str
    options: List[OptionRead] = []
    class Config:
        orm_mode = True

class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionCreate]

class SurveyRead(BaseModel):
    id: int
    token: str
    title: str
    description: Optional[str]
    created_at: datetime
    questions: List[QuestionRead]
    class Config:
        orm_mode = True

class RespondentCreate(BaseModel):
    first_name: str
    last_name: str

class AnswerCreate(BaseModel):
    question_id: int
    option_id: Optional[int] = None
    text: Optional[str] = None

class SubmitSurveyRequest(BaseModel):
    respondent: RespondentCreate
    answers: List[AnswerCreate] 