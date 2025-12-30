from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
import uuid

# --- 1. УЧНІ (STUDENTS) ---

# Базова схема (спільні поля для читання/створення)
class StudentBase(SQLModel):
    full_name: str
    parent_name: Optional[str] = None
    telegram_contact: Optional[str] = None
    # default_price: Тариф за заняття за замовчуванням
    default_price: float = Field(default=0.0)
    comment: Optional[str] = None

# Модель таблиці в БД
class Student(StudentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # balance: Поточний стан рахунку (плюс = переплата, мінус = борг)
    balance: float = Field(default=0.0)
    
    # Зв'язки
    lessons: List["Lesson"] = Relationship(back_populates="student")
    transactions: List["Transaction"] = Relationship(back_populates="student")

# Схема для створення (клієнт надсилає це)
class StudentCreate(StudentBase):
    pass

# Схема для оновлення (всі поля опціональні)
class StudentUpdate(SQLModel):
    full_name: Optional[str] = None
    parent_name: Optional[str] = None
    telegram_contact: Optional[str] = None
    default_price: Optional[float] = None
    comment: Optional[str] = None
    # Баланс зазвичай змінюється через транзакції, але можна додати сюди, якщо потрібно ручне редагування


# --- 2. УРОКИ (LESSONS) ---
class Lesson(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    student_id: uuid.UUID = Field(foreign_key="student.id")
    
    start_time: datetime
    end_time: datetime 
    
    topic: Optional[str] = None
    status: str = Field(default="planned")  # planned, completed, cancelled
    price: float  # Ціна конкретного уроку (фіксується в момент створення)
    
    student: Optional[Student] = Relationship(back_populates="lessons")
    homeworks: List["Homework"] = Relationship(back_populates="lesson")


# --- 3. ОПЛАТИ / ТРАНЗАКЦІЇ (TRANSACTIONS) ---
class Transaction(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    student_id: uuid.UUID = Field(foreign_key="student.id")
    
    amount: float # Сума поповнення (або списання, якщо < 0)
    date: datetime = Field(default_factory=datetime.utcnow)
    comment: Optional[str] = None
    
    student: Optional[Student] = Relationship(back_populates="transactions")


# --- 4. ДОМАШНІ ЗАВДАННЯ (HOMEWORKS) ---
class Homework(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    lesson_id: uuid.UUID = Field(foreign_key="lesson.id")
    
    description: str
    file_path: Optional[str] = None
    
    lesson: Optional[Lesson] = Relationship(back_populates="homeworks")