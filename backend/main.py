from fastapi import FastAPI, Request
from routers import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(router, prefix="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно ограничить до нужных доменов
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Oprosnik backend is running"}

@app.post("/api/test")
def test_post(request: Request):
    return {"ok": True} 