# from PIL import Image, ImageDraw, ImageFont
# import textwrap
#
#
# def add_text_to_image(image_path: str, text: str, output_path: str):
#     image = Image.open(image_path).convert("RGBA")
#     draw = ImageDraw.Draw(image)
#
#     # Настройка шрифта
#     font_path = "fonts/CodeNext-Trial-Regular.ttf"
#     font_size = 24
#     font = ImageFont.truetype(font_path, font_size)
#
#     text_color = (108, 130, 141)  # #6C828D
#
#     box_x = image.width - ((image.width // 2) + 36)
#     box_y = image.height - (image.height // 2.1)
#
#     wrapped = textwrap.wrap(text, width=34)
#
#     for i, line in enumerate(wrapped):
#         y = box_y + i * (font_size + 6)
#         draw.text((box_x, y), line, font=font, fill=text_color)
#
#     image.convert("RGB").save(output_path, "PNG")


from PIL import Image, ImageDraw, ImageFont
import textwrap
from io import BytesIO


def add_text_to_image_bytes(image_path: str, text: str) -> bytes:
    """
    Открывает изображение, добавляет текст и возвращает результат в виде байтов PNG.

    :param image_path: Путь к исходному изображению.
    :param text: Текст для добавления на изображение.
    :return: PNG-изображение в байтах.
    """
    # Загружаем и конвертируем изображение
    image = Image.open(image_path).convert("RGBA")
    draw = ImageDraw.Draw(image)

    # Настройка шрифта
    font_path = "fonts/CodeNext-Trial-Regular.ttf"
    font_size = 24
    font = ImageFont.truetype(font_path, font_size)
    text_color = (108, 130, 141)  # #6C828D

    # Позиция блока текста
    box_x = image.width - ((image.width // 2) + 36) + 8
    box_y = image.height - (image.height // 2.1) - 85

    # Разбиваем текст на строки
    wrapped = textwrap.wrap(text, width=34)
    for i, line in enumerate(wrapped):
        y = box_y + i * (font_size + 6)
        draw.text((box_x, y), line, font=font, fill=text_color, stroke_width=0.1)

    # Сохраняем в байтовый буфер и возвращаем
    buffer = BytesIO()
    image.convert("RGB").save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()
