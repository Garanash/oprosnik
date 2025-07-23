import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from models import Survey, Question, Option, Respondent, Answer
from schemas import SurveyCreate, QuestionCreate, OptionCreate, RespondentCreate, AnswerCreate

async def create_survey(db: AsyncSession, survey: SurveyCreate) -> Survey:
    db_survey = Survey(title=survey.title, description=survey.description, token=str(uuid.uuid4()))
    db.add(db_survey)
    await db.flush()
    for q in survey.questions:
        db_question = Question(text=q.text, type=q.type, survey=db_survey)
        db.add(db_question)
        await db.flush()
        if q.options:
            for o in q.options:
                db_option = Option(text=o.text, question=db_question)
                db.add(db_option)
    await db.commit()
    # Загружаем survey с вопросами и опциями для сериализации
    result = await db.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == db_survey.id)
    )
    return result.scalars().first()

async def update_survey(db: AsyncSession, survey_id: int, survey: SurveyCreate) -> Survey:
    # Загружаем survey с вопросами через selectinload
    result = await db.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == survey_id)
    )
    db_survey = result.scalars().first()
    if not db_survey:
        raise Exception("Survey not found")
    db_survey.title = survey.title
    db_survey.description = survey.description
    # Удаляем старые вопросы и опции
    for q in list(db_survey.questions):
        await db.delete(q)
    await db.flush()
    # Добавляем новые вопросы и опции
    for q in survey.questions:
        db_question = Question(text=q.text, type=q.type, survey=db_survey)
        db.add(db_question)
        await db.flush()
        if q.options:
            for o in q.options:
                db_option = Option(text=o.text, question=db_question)
                db.add(db_option)
    await db.commit()
    # Загружаем survey с вопросами и опциями для сериализации
    result = await db.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == db_survey.id)
    )
    return result.scalars().first()

async def get_survey(db: AsyncSession, survey_id: int) -> Survey:
    result = await db.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.id == survey_id)
    )
    return result.scalars().first()

async def list_surveys(db: AsyncSession):
    result = await db.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
    )
    return result.scalars().all()

async def create_respondent_and_answers(db: AsyncSession, survey_id: int, respondent: RespondentCreate, answers: list[AnswerCreate]):
    db_respondent = Respondent(first_name=respondent.first_name, last_name=respondent.last_name, survey_id=survey_id)
    db.add(db_respondent)
    await db.flush()
    for ans in answers:
        db_answer = Answer(respondent=db_respondent, question_id=ans.question_id, option_id=ans.option_id, text=ans.text)
        db.add(db_answer)
    await db.commit()
    await db.refresh(db_respondent)
    return db_respondent

async def get_survey_stats(db: AsyncSession, survey_id: int):
    result = await db.execute(select(Respondent).options(selectinload(Respondent.answers)).where(Respondent.survey_id == survey_id))
    return result.scalars().all()

async def delete_survey(db: AsyncSession, survey_id: int):
    db_survey = await db.get(Survey, survey_id)
    if db_survey:
        await db.delete(db_survey)
        await db.commit()

async def delete_respondent(db: AsyncSession, respondent_id: int):
    db_respondent = await db.get(Respondent, respondent_id)
    if db_respondent:
        await db.delete(db_respondent)
        await db.commit()

async def get_survey_by_token(db: AsyncSession, token: str) -> Survey:
    result = await db.execute(
        select(Survey)
        .options(selectinload(Survey.questions).selectinload(Question.options))
        .where(Survey.token == token)
    )
    return result.scalars().first() 