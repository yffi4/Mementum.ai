#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работы AI агента
"""

import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from models import User, Note
from ai_agent.agent import AIAgent

# Загружаем переменные окружения
load_dotenv()

# Настройки базы данных
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/notes_db")
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def test_agent():
    """Тестирование основных функций AI агента"""
    
    async with AsyncSessionLocal() as db:
        # Создаем тестового пользователя (или получаем существующего)
        user = await get_or_create_test_user(db)
        
        print(f"Тестируем AI агента для пользователя: {user.email}")
        
        # Создаем AI агента
        agent = AIAgent(db, user)
        
        # Тест 1: Создание заметки
        print("\n=== Тест 1: Создание заметки ===")
        result = await agent.process_user_request("Создай заметку о важности изучения Python")
        print(f"Результат: {result}")
        
        # Тест 2: Создание плана обучения
        print("\n=== Тест 2: Создание плана обучения ===")
        result = await agent.process_user_request("Сделай мне план изучения FastAPI")
        print(f"Результат: {result}")
        
        # Тест 3: Анализ заметки
        print("\n=== Тест 3: Анализ заметки ===")
        notes = await notes_crud.get_user_notes(db, user.id, 0, 1)
        if notes:
            note = notes[0]
            category = await agent.note_analyzer.categorize_note(note.content)
            importance = await agent.note_analyzer.assess_importance(note.content)
            print(f"Категория: {category}")
            print(f"Важность: {importance}")
        
        # Тест 4: Поиск связанных ссылок
        print("\n=== Тест 4: Поиск связанных ссылок ===")
        if notes:
            links = await agent.web_scraper.search_related_content(notes[0].content, 3)
            print(f"Найдено связанных ссылок: {len(links)}")
            for link in links:
                print(f"- {link['title']}: {link['url']}")
        
        print("\n=== Тестирование завершено ===")


async def get_or_create_test_user(db: AsyncSession) -> User:
    """Получение или создание тестового пользователя"""
    
    # Ищем существующего пользователя
    from sqlalchemy import select
    result = await db.execute(select(User).filter(User.email == "test@example.com"))
    user = result.scalar_one_or_none()
    
    if not user:
        # Создаем нового пользователя
        from jwt_auth.auth import get_password_hash
        user = User(
            email="test@example.com",
            username="testuser",
            hashed_password=get_password_hash("testpassword123"),
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print("Создан тестовый пользователь")
    else:
        print("Используем существующего пользователя")
    
    return user


async def test_web_scraper():
    """Тестирование веб-скрапера"""
    
    print("\n=== Тест веб-скрапера ===")
    
    from ai_agent.web_scraper import WebScraper
    
    async with WebScraper() as scraper:
        # Тест парсинга страницы
        url = "https://httpbin.org/html"
        content = await scraper.scrape_url(url)
        print(f"Парсинг {url}: {len(content)} символов")
        
        # Тест поиска связанных ссылок
        links = await scraper.search_related_content("Python programming language", 3)
        print(f"Поиск связанных ссылок: найдено {len(links)}")
        for link in links:
            print(f"- {link['title']}: {link['url']}")


async def test_note_analyzer():
    """Тестирование анализатора заметок"""
    
    print("\n=== Тест анализатора заметок ===")
    
    import openai
    from ai_agent.note_analyzer import NoteAnalyzer
    
    # Проверяем наличие API ключа
    if not os.getenv("OPENAI_API_KEY"):
        print("OPENAI_API_KEY не установлен, пропускаем тест анализатора")
        return
    
    openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    analyzer = NoteAnalyzer(openai_client)
    
    test_content = """
    Python - это высокоуровневый язык программирования общего назначения.
    Он известен своей простотой и читаемостью кода. Python широко используется
    в веб-разработке, data science, машинном обучении и автоматизации.
    """
    
    category = await analyzer.categorize_note(test_content)
    importance = await analyzer.assess_importance(test_content)
    keywords = await analyzer.extract_keywords(test_content)
    
    print(f"Категория: {category}")
    print(f"Важность: {importance}")
    print(f"Ключевые слова: {keywords}")


if __name__ == "__main__":
    print("Запуск тестов AI агента...")
    
    # Проверяем переменные окружения
    required_vars = ["DATABASE_URL", "SECRET_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"Отсутствуют обязательные переменные окружения: {missing_vars}")
        print("Создайте файл .env на основе env.example")
        exit(1)
    
    # Запускаем тесты
    asyncio.run(test_agent())
    asyncio.run(test_web_scraper())
    asyncio.run(test_note_analyzer())
    
    print("\nВсе тесты завершены!") 