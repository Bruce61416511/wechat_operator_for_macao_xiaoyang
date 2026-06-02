import re
from fastapi import HTTPException


PHONE_PATTERN = re.compile(r"^\+\d{7,15}$")
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
ID_NUMBER_PATTERN = re.compile(r"^\d{15,18}$")
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
XSS_PATTERN = re.compile(r"<script|javascript:|on\w+=|&#", re.IGNORECASE)


def validate_phone(phone: str) -> str:
    if not PHONE_PATTERN.match(phone):
        raise HTTPException(status_code=400, detail="手機號格式不正確")
    return phone



def validate_id_number(id_number: str) -> str:
    if not ID_NUMBER_PATTERN.match(id_number):
        raise HTTPException(status_code=400, detail="證件號碼格式不正確")
    return id_number


def sanitize_xss(text: str) -> str:
    if XSS_PATTERN.search(text):
        raise HTTPException(status_code=400, detail="輸入包含非法內容")
    return text


def validate_upload_size(size: int) -> int:
    if size > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"文件大小超過 {MAX_UPLOAD_SIZE // 1024 // 1024}MB 限制")
    return size


def sanitize_input(data: dict) -> dict:
    cleaned = {}
    for k, v in data.items():
        if isinstance(v, str):
            v = sanitize_xss(v)
        cleaned[k] = v
    return cleaned
