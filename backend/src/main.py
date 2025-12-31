import os
import shutil
import uuid
from typing import List
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from .database import init_db, get_session
# Додаємо нові схеми в імпорт
from .models import (
    Student, StudentCreate, StudentUpdate, 
    Lesson, LessonCreate, LessonUpdate, 
    Transaction
)

app = FastAPI(title="Tutor CRM API")

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

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

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def on_startup():
    init_db()

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "url": f"/uploads/{unique_filename}"}

@app.get("/")
def read_root():
    return {"message": "Tutor CRM API is running!"}

# --- STUDENTS ---
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

@app.patch("/students/{student_id}", response_model=Student)
def update_student(student_id: uuid.UUID, student_in: StudentUpdate, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_data = student_in.model_dump(exclude_unset=True)
    for key, value in student_data.items():
        setattr(student, key, value)
        
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

# --- LESSONS ---
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

# Використовує LessonCreate та підставляє ціну
@app.post("/lessons/", response_model=Lesson)
def create_lesson(lesson_in: LessonCreate, session: Session = Depends(get_session)):
    # 1. Знаходимо студента
    student = session.get(Student, lesson_in.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # 2. Перевіряємо ціну
    lesson_data = lesson_in.model_dump()
    
    # Якщо ціна не передана, беремо default_price студента
    if lesson_data.get("price") is None:
        lesson_data["price"] = student.default_price
        
    # 3. Створюємо запис
    lesson = Lesson.model_validate(lesson_data)
        
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson

@app.patch("/lessons/{lesson_id}", response_model=Lesson)
def update_lesson(
    lesson_id: str, 
    lesson_in: LessonUpdate, # Використовуємо LessonUpdate для гнучкості
    session: Session = Depends(get_session)
):
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    lesson_data = lesson_in.model_dump(exclude_unset=True)
    for key, value in lesson_data.items():
        setattr(lesson, key, value)
        
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson