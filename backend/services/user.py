from __future__ import annotations

from sqlalchemy.orm import Session

from models.db_models import User
from models.schemas import UserCreate


def get_or_create_user(db: Session, data: UserCreate) -> User:
    user = db.query(User).filter(User.cognito_user_id == data.cognito_user_id).first()
    if user:
        return user

    user = User(
        cognito_user_id=data.cognito_user_id,
        email=data.email,
        display_name=data.display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_cognito_id(db: Session, cognito_user_id: str) -> User | None:
    return db.query(User).filter(User.cognito_user_id == cognito_user_id).first()
