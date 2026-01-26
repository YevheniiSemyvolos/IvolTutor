import os
import shutil
from typing import Iterable

from fastapi import HTTPException, UploadFile

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".jpg", ".jpeg", ".png"}


def ensure_directory(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def validate_extension(filename: str) -> None:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")


def enforce_upload_constraints(files: Iterable[UploadFile], max_files: int = 5, max_size_mb: int = 20) -> None:
    files_list = list(files)
    if len(files_list) > max_files:
        raise HTTPException(status_code=400, detail=f"Too many files. Max allowed is {max_files}")

    max_bytes = max_size_mb * 1024 * 1024
    for file in files_list:
        if not file or not file.filename:
            continue
        try:
            file.file.seek(0, os.SEEK_END)
            size = file.file.tell()
            file.file.seek(0)
        except Exception:
            raise HTTPException(status_code=400, detail="Unable to read file size")

        if size > max_bytes:
            raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds {max_size_mb} MB limit")


def save_file(upload_base_dir: str, student_slug: str, lesson_date: str, filename: str, upload_file: UploadFile) -> str:
    """Save a single uploaded file and return normalized relative URL path."""
    destination_dir = os.path.join(upload_base_dir, student_slug, lesson_date)
    ensure_directory(destination_dir)

    file_path = os.path.join(destination_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    relative_path = os.path.relpath(file_path, upload_base_dir).replace("\\", "/")
    return f"/uploads/{relative_path}"
