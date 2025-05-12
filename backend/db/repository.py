from sqlalchemy import insert, update
from models import Users
from db.session import session_maker

class UserRepository:
    async def create_or_update_user(
        self,
        user_id: int,
        name: str,
        screen_name: str,
    ):
        async with session_maker() as session:
            # Проверяем существование пользователя
            existing_user = await session.get(Users, user_id)
            
            if existing_user:
                # Обновляем существующего пользователя
                stmt = (
                    update(Users)
                    .where(Users.user_id == user_id)
                    .values(
                        name=name,
                        screen_name=screen_name,
                    )
                )
            else:
                # Создаем нового пользователя
                stmt = insert(Users).values(
                    user_id=user_id,
                    name=name,
                    screen_name=screen_name,
                )
            
            await session.execute(stmt)
            await session.commit()

user_repository = UserRepository()
