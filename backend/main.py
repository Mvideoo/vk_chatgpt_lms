import json
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from db.repository import repost_repository
from utils.gpt_generate_description import generate_description
from models import ChatRequest
from utils.text_to_image import add_text_to_image_bytes

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,  # если куки/авторизация не нужна
)


@app.post("/edit_stat")
async def edit_stat():
    try:
        await repost_repository.add_reposts()
    except Exception as e:
        return


@app.post("/chat/send")
async def chat_send(data: ChatRequest):
    import re

    ID_DESCRIPTION_REGEX = r"^\s*(\d+)\s*—\s*(.+)$"

    response = await generate_description(data=data)

    try:
        # Разбиваем username на имя и фамилию
        first_name, last_name = data.username.split(" ", 1)
        await user_repository.create_or_update_user(
            user_id=data.user_id,
            name=f"{first_name} {last_name}",
            screen_name=data.username
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка сохранения пользователя: {str(e)}"
        )


    match = re.match(ID_DESCRIPTION_REGEX, response)
    if not match:
        raise HTTPException(status_code=400, detail="Неверный формат ответа от generate_description")

    image_id = int(match.group(1))
    description = match.group(2)

    original_image_path = f"images/{image_id}.png"
    image_bytes = add_text_to_image_bytes(
        image_path=original_image_path,
        text=description
    )

    return Response(content=image_bytes, media_type="image/png")
