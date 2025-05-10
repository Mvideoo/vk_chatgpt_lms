from datetime import time
from sqlalchemy import Column, BigInteger, String, Boolean, Integer, ForeignKey, Time

from db.base import BaseModel, CleanModel


class Users(BaseModel, CleanModel):
    """
    Таблица юзеров
    """
    __tablename__ = 'users'

    user_id = Column(BigInteger, primary_key=True, unique=True, nullable=False)
    # username = Column(String, nullable=True, unique=False)
    ai_threat_id = Column(String, nullable=True, unique=True)
    end_questions_id = Column(Boolean, nullable=True, unique=False, default=False)
    name = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    screen_name = Column(String, nullable=True)
    # language = Column(String, nullable=True, unique=False, default="ru")
    # ai_attempts = Column(BigInteger, nullable=True, default=3)

    @property
    def stats(self) -> str:
        """
        :return:
        """
        return ""

    def __str__(self) -> str:
        return f"<{self.__tablename__}:{self.user_id}>"

    def __repr__(self):
        return self.__str__()
