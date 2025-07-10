from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Survey(Base):
    __tablename__ = 'surveys'
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    questions = relationship("Question", back_populates="survey", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True, index=True)
    survey_id = Column(Integer, ForeignKey('surveys.id', ondelete='CASCADE'))
    text = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # text, select, multiselect
    survey = relationship("Survey", back_populates="questions")
    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")

class Option(Base):
    __tablename__ = 'options'
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey('questions.id', ondelete='CASCADE'))
    text = Column(String, nullable=False)
    question = relationship("Question", back_populates="options")

class Respondent(Base):
    __tablename__ = 'respondents'
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)
    survey_id = Column(Integer, ForeignKey('surveys.id', ondelete='SET NULL'), nullable=True)
    answers = relationship("Answer", back_populates="respondent", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = 'answers'
    id = Column(Integer, primary_key=True, index=True)
    respondent_id = Column(Integer, ForeignKey('respondents.id', ondelete='CASCADE'))
    question_id = Column(Integer, ForeignKey('questions.id', ondelete='CASCADE'))
    option_id = Column(Integer, ForeignKey('options.id', ondelete='SET NULL'), nullable=True)
    text = Column(Text, nullable=True)  # для текстовых ответов
    respondent = relationship("Respondent", back_populates="answers") 