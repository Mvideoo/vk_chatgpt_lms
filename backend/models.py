from pydantic import BaseModel
from typing import List


class AnswerItem(BaseModel):
    question: str
    answer: str


class ChatRequest(BaseModel):
    user_id: str
    username: str
    answers: List[AnswerItem]


