from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone, timedelta
import uuid
import re

def generate_slug(full_name: str) -> str:
    """Generate URL-safe slug from full name"""
    slug = full_name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)  # Remove non-alphanumeric
    slug = re.sub(r'[-\s]+', '-', slug)   # Replace spaces/hyphens with single hyphen
    return slug

# --- 1. УЧНІ (STUDENTS) ---
class StudentBase(SQLModel):
    full_name: str
    parent_name: Optional[str] = None
    telegram_contact: Optional[str] = None
    grade: Optional[int] = None
    default_price: float = Field(default=0.0)
    comment: Optional[str] = None

class Student(StudentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    slug: str = Field(index=True, unique=True)  # URL-safe name for linking
    balance: float = Field(default=0.0)
    lessons: List["Lesson"] = Relationship(back_populates="student")
    transactions: List["Transaction"] = Relationship(back_populates="student")
    payments: List["Payment"] = Relationship(back_populates="student")

class StudentCreate(StudentBase):
    pass

class StudentUpdate(SQLModel):
    full_name: Optional[str] = None
    parent_name: Optional[str] = None
    telegram_contact: Optional[str] = None
    grade: Optional[int] = None
    default_price: Optional[float] = None
    comment: Optional[str] = None


# --- 2. УРОКИ (LESSONS) ---

# Базова схема (спільні поля)
class LessonBase(SQLModel):
    student_id: uuid.UUID = Field(foreign_key="student.id")
    start_time: datetime
    end_time: datetime 
    topic: Optional[str] = None
    status: str = Field(default="planned")
    material_url: Optional[str] = None
    homework_url: Optional[str] = None
    series_id: Optional[uuid.UUID] = None  # ID серії для щотижневих занять

# Схема для створення (ціна опціональна, бо береться з профілю)
class LessonCreate(LessonBase):
    price: Optional[float] = None

# Схема для оновлення
class LessonUpdate(SQLModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    topic: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = None

# Модель БД (ціна обов'язкова)
class Lesson(LessonBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    price: float 
    
    student: Optional[Student] = Relationship(back_populates="lessons")
    homeworks: List["Homework"] = Relationship(back_populates="lesson")


# --- 3. ОПЛАТИ / ТРАНЗАКЦІЇ ---
class Transaction(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    student_id: uuid.UUID = Field(foreign_key="student.id")
    amount: float
    date: datetime = Field(default_factory=datetime.utcnow)
    comment: Optional[str] = None
    student: Optional[Student] = Relationship(back_populates="transactions")


# --- 3.1 ПЛАТЕЖІ ---
class PaymentBase(SQLModel):
    amount: float
    comment: Optional[str] = None
    payment_time: Optional[str] = None  # HH:MM формат часу платежу

class Payment(PaymentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    student_id: uuid.UUID = Field(foreign_key="student.id")
    date: datetime = Field(default_factory=lambda: datetime.now(timezone(timedelta(hours=2))))
    student: Optional[Student] = Relationship(back_populates="payments")

class PaymentCreate(PaymentBase):
    student_id: uuid.UUID


# --- 4. ДОМАШНІ ЗАВДАННЯ ---
class Homework(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    lesson_id: uuid.UUID = Field(foreign_key="lesson.id")
    description: str
    file_path: Optional[str] = None
    lesson: Optional[Lesson] = Relationship(back_populates="homeworks")