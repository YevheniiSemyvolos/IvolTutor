from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid

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
    balance: float = Field(default=0.0)
    lessons: List["Lesson"] = Relationship(back_populates="student")
    transactions: List["Transaction"] = Relationship(back_populates="student")

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


# --- 4. ДОМАШНІ ЗАВДАННЯ ---
class Homework(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    lesson_id: uuid.UUID = Field(foreign_key="lesson.id")
    description: str
    file_path: Optional[str] = None
    lesson: Optional[Lesson] = Relationship(back_populates="homeworks")