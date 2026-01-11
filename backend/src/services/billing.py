import uuid
from sqlmodel import Session

from ..models import Lesson, Student, Transaction


def get_deduction_amount(status: str, price: float) -> float:
    if status == "completed":
        return price
    if status == "no_show":
        return price * 0.5
    return 0


def apply_status_change(
    lesson: Lesson,
    old_status: str,
    new_status: str,
    old_price: float,
    session: Session,
) -> None:
    """Adjust student balance and create a transaction if status changed."""
    if old_status == new_status:
        return

    student = session.get(Student, lesson.student_id)
    if not student:
        return

    old_deduction = get_deduction_amount(old_status, old_price)
    new_deduction = get_deduction_amount(new_status, lesson.price)
    balance_change = old_deduction - new_deduction
    student.balance += balance_change

    if balance_change != 0:
        if new_status == "completed":
            comment = f"Проведено заняття на тему: {lesson.topic or 'без назви'}"
        elif new_status == "no_show":
            comment = "Учень не прийшов (50% від ціни заняття)"
        elif new_status == "cancelled":
            comment = "Скасування заняття (повернення коштів)"
        else:
            comment = "Корекція балансу через зміну статусу"

        transaction = Transaction(
            student_id=lesson.student_id,
            amount=-balance_change,
            comment=comment,
        )
        session.add(transaction)

    session.add(student)
