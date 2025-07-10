from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
import crud
import schemas
from typing import List

router = APIRouter()

# --- Admin endpoints ---
@router.post("/admin/surveys", response_model=schemas.SurveyRead)
async def create_survey(survey: schemas.SurveyCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_survey(db, survey)

@router.get("/admin/surveys", response_model=List[schemas.SurveyRead])
async def list_surveys(db: AsyncSession = Depends(get_db)):
    surveys = await crud.list_surveys(db)
    return surveys

@router.get("/admin/surveys/{survey_id}/stats")
async def survey_stats(survey_id: int, db: AsyncSession = Depends(get_db)):
    stats = await crud.get_survey_stats(db, survey_id)
    return stats

@router.put("/admin/surveys/{survey_id}", response_model=schemas.SurveyRead)
async def update_survey(survey_id: int, survey: schemas.SurveyCreate, db: AsyncSession = Depends(get_db)):
    return await crud.update_survey(db, survey_id, survey)

@router.delete("/admin/surveys/{survey_id}")
async def delete_survey(survey_id: int, db: AsyncSession = Depends(get_db)):
    await crud.delete_survey(db, survey_id)
    return {"ok": True}

# Endpoint для удаления респондента (ответа пользователя)
@router.delete("/admin/respondents/{respondent_id}")
async def delete_respondent(respondent_id: int, db: AsyncSession = Depends(get_db)):
    await crud.delete_respondent(db, respondent_id)
    return {"ok": True}

@router.get("/admin/surveys/{survey_id}", response_model=schemas.SurveyRead)
async def get_admin_survey(survey_id: int, db: AsyncSession = Depends(get_db)):
    survey = await crud.get_survey(db, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey

# --- Public endpoints ---
@router.get("/surveys/{survey_id}", response_model=schemas.SurveyRead)
async def get_survey(survey_id: int, db: AsyncSession = Depends(get_db)):
    survey = await crud.get_survey(db, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey

@router.get("/surveys/token/{token}", response_model=schemas.SurveyRead)
async def get_survey_by_token(token: str, db: AsyncSession = Depends(get_db)):
    survey = await crud.get_survey_by_token(db, token)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey

@router.post("/surveys/{survey_id}/submit")
async def submit_survey(survey_id: int, submission: schemas.SubmitSurveyRequest, db: AsyncSession = Depends(get_db)):
    respondent = await crud.create_respondent_and_answers(db, survey_id, submission.respondent, submission.answers)
    return {"message": "Спасибо за ответы!", "respondent_id": respondent.id} 