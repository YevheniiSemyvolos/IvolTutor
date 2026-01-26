import os
import uuid
from typing import List
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session, select

from .database import init_db, get_session
# Додаємо нові схеми в імпорт
from .models import (
    Student, StudentCreate, StudentUpdate, 
    Lesson, LessonCreate, LessonUpdate, 
    Transaction, Payment, PaymentCreate, generate_slug,
    User, UserCreate, UserLogin, Token
)
from .services.billing import apply_status_change
from .services.uploads import enforce_upload_constraints, save_file, validate_extension
from .services.auth import (
    get_password_hash, 
    authenticate_user, 
    create_access_token,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
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


# ==================== AUTH ENDPOINTS ====================

@app.post("/auth/signup", response_model=Token)
def signup(user_in: UserCreate, session: Session = Depends(get_session)):
    """Реєстрація нового користувача"""
    # Перевіряємо, чи існує користувач з таким email
    statement = select(User).where(User.email == user_in.email)
    existing_user = session.exec(statement).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Створюємо нового користувача
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_password
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Створюємо токен
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@app.post("/auth/login", response_model=Token)
def login(user_credentials: UserLogin, session: Session = Depends(get_session)):
    """Вхід користувача"""
    user = authenticate_user(user_credentials.email, user_credentials.password, session)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Створюємо токен
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_active_user)):
    """Отримати інформацію про поточного користувача"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }


# ==================== FILE UPLOAD ====================

@app.post("/upload/")
async def upload_file(
    files: list[UploadFile] = File(...),
    student_slug: str = Form(...),
    lesson_date: str = Form(...),
    current_user: User = Depends(get_current_active_user)
):
    """Handle multiple file uploads with structured storage"""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    enforce_upload_constraints(files, max_files=5, max_size_mb=20)

    try:
        parsed_date = datetime.strptime(lesson_date, "%Y-%m-%d").date()
        lesson_date = parsed_date.strftime("%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid lesson_date format. Use YYYY-MM-DD")

    uploaded_urls = []
    
    # Визначаємо які типи файлів ми отримали
    file_index = 0
    for file in files:
        if file and file.filename:
            validate_extension(file.filename)
            file_extension = os.path.splitext(file.filename)[1]
            
            # Визначаємо назву файлу
            if len(files) == 1:
                file_type = "ДЗ"  # Якщо один файл - це завжди домашнє завдання
            elif file_index == 0:
                file_type = "Матеріал"  # Перший файл - матеріал
            else:
                file_type = "ДЗ"  # Другий файл - домашнє завдання
            
            structured_filename = f"{file_type}_{lesson_date}{file_extension}"
            
            try:
                relative_path = save_file(UPLOAD_DIR, student_slug, lesson_date, structured_filename, file)
                uploaded_urls.append(relative_path)
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
            
            file_index += 1
    
    return {"files": uploaded_urls}

@app.get("/")
def read_root():
    return {"message": "Tutor CRM API is running!"}

# --- STUDENTS ---
@app.get("/students/", response_model=List[Student])
def read_students(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Повертаємо тільки студентів поточного користувача
    statement = select(Student).where(Student.user_id == current_user.id)
    students = session.exec(statement).all()
    return students

@app.post("/students/", response_model=Student)
def create_student(
    student_in: StudentCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Створюємо студента з прив'язкою до поточного користувача
    student_data = student_in.dict()
    student_data['slug'] = generate_slug(student_data['full_name'])
    student_data['user_id'] = current_user.id  # Додаємо ID користувача
    student = Student(**student_data)
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@app.patch("/students/{student_id}", response_model=Student)
def update_student(
    student_id: uuid.UUID, 
    student_in: StudentUpdate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Перевіряємо що студент належить поточному користувачу
    if student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    student_data = student_in.dict(exclude_unset=True)
    for key, value in student_data.items():
        setattr(student, key, value)
        
    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@app.get("/students/{slug}", response_model=Student)
def read_student_by_slug(
    slug: str, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # Перевіряємо що студент належить поточному користувачу
    statement = select(Student).where(
        Student.slug == slug,
        Student.user_id == current_user.id
    )
    student = session.exec(statement).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

# --- LESSONS ---
@app.get("/lessons/", response_model=List[Lesson])
def get_lessons(
    start: datetime, 
    end: datetime,
    student_id: str | None = None,
    status: str | None = None,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    statement = select(Lesson).where(
        Lesson.start_time >= start,
        Lesson.start_time <= end,
        Lesson.user_id == current_user.id  # Фільтруємо по user_id
    )
    
    if student_id:
        statement = statement.where(Lesson.student_id == student_id)
    
    if status:
        # Підтримка множинних статусів, розділених комою
        statuses = [s.strip() for s in status.split(',')]
        statement = statement.where(Lesson.status.in_(statuses))
    
    # Сортування від найновіших до найстаріших
    statement = statement.order_by(Lesson.start_time.desc()).offset(skip).limit(limit)
    
    results = session.exec(statement).all()
    return results

# Використовує LessonCreate та підставляє ціну
@app.post("/lessons/", response_model=Lesson)
def create_lesson(
    lesson_in: LessonCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Знаходимо студента
    student = session.get(Student, lesson_in.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Перевіряємо що студент належить поточному користувачу
    if student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # 2. Перевіряємо ціну
    lesson_data = lesson_in.dict()
    
    # Якщо ціна не передана, беремо default_price студента
    if lesson_data.get("price") is None:
        lesson_data["price"] = student.default_price
    
    # Додаємо user_id
    lesson_data["user_id"] = current_user.id
        
    # 3. Створюємо запис
    lesson = Lesson(**lesson_data)
        
    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson

@app.patch("/lessons/{lesson_id}", response_model=Lesson)
def update_lesson(
    lesson_id: uuid.UUID, 
    lesson_in: LessonUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Перевіряємо що урок належить поточному користувачу
    if lesson.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Отримуємо старий статус
    old_status = lesson.status
    old_price = lesson.price
    
    # Оновлюємо дані уроку
    lesson_data = lesson_in.dict(exclude_unset=True)
    for key, value in lesson_data.items():
        setattr(lesson, key, value)

    new_status = lesson.status

    apply_status_change(lesson, old_status, new_status, old_price, session)

    session.add(lesson)
    session.commit()
    session.refresh(lesson)
    return lesson


@app.patch("/lessons/series/{lesson_id}")
def update_lesson_series(
    lesson_id: uuid.UUID, 
    lesson_in: LessonUpdate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Оновити всі заняття серії, починаючи з поточного"""
    # Отримуємо поточний урок
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if not lesson.series_id:
        raise HTTPException(status_code=400, detail="Lesson is not part of a series")
    
    # Отримуємо всі заняття серії, які починаються з поточного або пізніше
    statement = select(Lesson).where(
        Lesson.series_id == lesson.series_id,
        Lesson.start_time >= lesson.start_time,
        Lesson.status == 'planned'  # Оновлюємо тільки заплановані
    )
    lessons = session.exec(statement).all()
    
    # Обчислюємо різницю часу для зміщення
    lesson_data = lesson_in.dict(exclude_unset=True)
    
    # Якщо змінюється час початку або кінця, обчислюємо зміщення
    time_shift_start = None
    time_shift_end = None
    
    if 'start_time' in lesson_data and lesson_data['start_time']:
        original_start = lesson.start_time
        new_start = lesson_data['start_time']
        time_shift_start = new_start - original_start
    
    if 'end_time' in lesson_data and lesson_data['end_time']:
        original_end = lesson.end_time
        new_end = lesson_data['end_time']
        time_shift_end = new_end - original_end
    
    updated_count = 0
    for l in lessons:
        # Оновлюємо час з урахуванням зміщення
        if time_shift_start:
            l.start_time = l.start_time + time_shift_start
        if time_shift_end:
            l.end_time = l.end_time + time_shift_end
        
        # Оновлюємо інші поля (тема)
        if 'topic' in lesson_data:
            l.topic = lesson_data['topic']
        
        session.add(l)
        updated_count += 1
    
    session.commit()
    return {"message": f"Updated {updated_count} lessons in series"}


# --- ПЛАТЕЖИ ---
@app.post("/payments/", response_model=Payment)
def create_payment(
    payment_in: PaymentCreate, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Створити платіж і оновити баланс студента"""
    # Перевіряємо, чи існує студент
    student = session.get(Student, payment_in.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Перевіряємо що студент належить поточному користувачу
    if student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Створюємо платіж
    payment_data = payment_in.dict()
    payment_data['user_id'] = current_user.id  # Додаємо user_id
    payment = Payment(**payment_data)
    session.add(payment)
    
    # Оновлюємо баланс студента
    student.balance += payment_in.amount
    
    # Створюємо транзакцію
    transaction = Transaction(
        student_id=payment_in.student_id,
        user_id=current_user.id,  # Додаємо user_id
        amount=payment_in.amount,
        comment=payment_in.comment or "Поповнення балансу"
    )
    session.add(transaction)
    
    session.add(student)
    session.commit()
    session.refresh(payment)
    return payment

@app.get("/payments/student/{student_id}", response_model=List[Payment])
def get_student_payments(
    student_id: uuid.UUID, 
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Отримати платежи студента з пагінацією"""
    statement = select(Payment).where(
        Payment.student_id == student_id,
        Payment.user_id == current_user.id  # Фільтруємо по user_id
    ).order_by(Payment.date.desc()).offset(skip).limit(limit)
    payments = session.exec(statement).all()
    return payments