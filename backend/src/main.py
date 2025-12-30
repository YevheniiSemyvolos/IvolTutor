# backend/src/main.py
import os
import shutil
import uuid
from typing import List
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # <--- Імпорт для статики
from sqlmodel import Session, select


from .database import init_db, get_session
from .models import Student, StudentCreate, StudentUpdate, Lesson, Transaction

app = FastAPI(title="Tutor CRM API")

# --- Налаштування папки завантажень ---
UPLOAD_DIR = "uploads"
# Створюємо папку, якщо її немає (важливо для першого запуску)
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# --- Налаштування CORS ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Підключення статики (доступ до файлів за посиланням) ---
# Тепер файли з папки uploads доступні за адресою http://localhost:8000/uploads/...
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def on_startup():
    init_db()

# --- ЕНДПОІНТ ЗАВАНТАЖЕННЯ ФАЙЛІВ ---
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    Зберігає завантажений файл і повертає посилання на нього.
    """
    # 1. Генеруємо унікальне ім'я файлу, щоб уникнути конфліктів
    # Отримуємо розширення (наприклад, .pdf або .jpg)
    file_extension = os.path.splitext(file.filename)[1]
    # Створюємо нове ім'я: uuid + розширення
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # 2. Повний шлях до файлу
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 3. Зберігаємо файл на диск
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 4. Формуємо URL для доступу
    # (У реальному проді тут може бути повний домен, але для локальної розробки достатньо відносного шляху)
    file_url = f"/uploads/{unique_filename}"
    
    return {"filename": file.filename, "url": file_url}


# --- Базові Ендпоінти ---

@app.get("/")
def read_root():
    return {"message": "Tutor CRM API is running!"}

@app.get("/students/", response_model=List[Student])
def read_students(session: Session = Depends(get_session)):
    students = session.exec(select(Student)).all()
    return students

@app.post("/students/", response_model=Student)
def create_student(student_in: StudentCreate, session: Session = Depends(get_session)):
    student = Student.model_validate(student_in)
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@app.get("/lessons/", response_model=List[Lesson])
def get_lessons(
    start: datetime, 
    end: datetime, 
    session: Session = Depends(get_session)
):
    statement = select(Lesson).where(
        Lesson.start_time >= start,
        Lesson.start_time <= end
    )
    results = session.exec(statement).all()
    return results

@app.post("/lessons/", response_model=Lesson)
def create_lesson(lesson: Lesson, session: Session = Depends(get_session)):
    student = session.get(Student, lesson.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson

@app.patch("/lessons/{lesson_id}", response_model=Lesson)
def update_lesson_date(
    lesson_id: str, 
    lesson_data: dict,
    session: Session = Depends(get_session)
):
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if "start_time" in lesson_data:
        lesson.start_time = datetime.fromisoformat(lesson_data["start_time"].replace("Z", "+00:00"))
    if "end_time" in lesson_data:
        lesson.end_time = datetime.fromisoformat(lesson_data["end_time"].replace("Z", "+00:00"))
        
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson

@app.patch("/students/{student_id}", response_model=Student)
def update_student(student_id: uuid.UUID, student_in: StudentUpdate, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Оновлюємо тільки ті поля, що прийшли
    student_data = student_in.model_dump(exclude_unset=True)
    for key, value in student_data.items():
        setattr(student, key, value)
        
    session.add(student)
    session.commit()
    session.refresh(student)
    return student