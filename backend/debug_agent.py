#!/usr/bin/env python3
"""
Отладочный скрипт для проверки работы AI агента
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

async def test_imports():
    """Тестирование импортов"""
    print("=== Тестирование импортов ===")
    
    try:
        print("1. Импорт основных модулей...")
        from ai_agent.agent import AIAgent
        from ai_agent.note_analyzer import NoteAnalyzer
        from ai_agent.web_scraper import WebScraper
        from ai_agent.calendar_manager import CalendarManager
        from ai_agent.prompts import AGENT_PROMPTS
        print("✅ Все модули импортированы успешно")
        
        print("2. Проверка OpenAI API ключа...")
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            print(f"✅ OpenAI API ключ найден: {openai_key[:10]}...")
        else:
            print("❌ OpenAI API ключ не найден")
            return False
        
        print("3. Проверка базы данных...")
        from database import get_async_db
        from models import User
        print("✅ Модули базы данных импортированы")
        
        return True
        
    except ImportError as e:
        print(f"❌ Ошибка импорта: {e}")
        return False
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")
        return False

async def test_agent_creation():
    """Тестирование создания агента"""
    print("\n=== Тестирование создания агента ===")
    
    try:
        from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
        from sqlalchemy.orm import sessionmaker
        
        # Настройки базы данных
        DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/notes_db")
        engine = create_async_engine(DATABASE_URL)
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with AsyncSessionLocal() as db:
            # Создаем тестового пользователя
            from models import User
            from sqlalchemy import select
            
            result = await db.execute(select(User).filter(User.email == "test@example.com"))
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ Тестовый пользователь не найден. Создайте пользователя через API")
                return False
            
            print(f"✅ Пользователь найден: {user.email}")
            
            # Создаем агента
            from ai_agent.agent import AIAgent
            agent = AIAgent(db, user)
            print("✅ AI агент создан успешно")
            
            return True
            
    except Exception as e:
        print(f"❌ Ошибка создания агента: {e}")
        return False

async def test_request_processing():
    """Тестирование обработки запроса"""
    print("\n=== Тестирование обработки запроса ===")
    
    try:
        from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
        from sqlalchemy.orm import sessionmaker
        
        DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/notes_db")
        engine = create_async_engine(DATABASE_URL)
        AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with AsyncSessionLocal() as db:
            from models import User
            from sqlalchemy import select
            from ai_agent.agent import AIAgent
            
            result = await db.execute(select(User).filter(User.email == "test@example.com"))
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ Пользователь не найден")
                return False
            
            agent = AIAgent(db, user)
            
            # Тестируем анализ запроса
            print("Тестируем анализ запроса...")
            analysis = await agent._analyze_request("Создай заметку о Python")
            print(f"✅ Анализ запроса: {analysis}")
            
            # Тестируем создание заметки
            print("Тестируем создание заметки...")
            result = await agent.process_user_request("Создай заметку о важности изучения Python")
            print(f"✅ Результат обработки: {result}")
            
            return True
            
    except Exception as e:
        print(f"❌ Ошибка обработки запроса: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_router():
    """Тестирование роутера"""
    print("\n=== Тестирование роутера ===")
    
    try:
        from ai_agent.router import router
        print("✅ Роутер импортирован успешно")
        
        # Проверяем эндпоинты
        routes = [route for route in router.routes]
        print(f"✅ Найдено {len(routes)} эндпоинтов:")
        for route in routes:
            print(f"  - {route.methods} {route.path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка роутера: {e}")
        return False

async def main():
    """Основная функция тестирования"""
    print("🔍 Отладка AI агента...")
    
    # Проверяем переменные окружения
    print("\n=== Проверка переменных окружения ===")
    required_vars = ["DATABASE_URL", "SECRET_KEY", "OPENAI_API_KEY"]
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value[:20]}..." if len(value) > 20 else f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: не установлен")
    
    # Тестируем импорты
    if not await test_imports():
        print("❌ Тест импортов не прошел")
        return
    
    # Тестируем создание агента
    if not await test_agent_creation():
        print("❌ Тест создания агента не прошел")
        return
    
    # Тестируем роутер
    if not await test_router():
        print("❌ Тест роутера не прошел")
        return
    
    # Тестируем обработку запроса
    if not await test_request_processing():
        print("❌ Тест обработки запроса не прошел")
        return
    
    print("\n🎉 Все тесты прошли успешно!")

if __name__ == "__main__":
    asyncio.run(main()) 