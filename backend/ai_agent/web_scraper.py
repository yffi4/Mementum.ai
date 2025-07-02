import aiohttp
import asyncio
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
import re
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime, timedelta


class WebScraper:
    """
    Веб-скрапер для парсинга страниц и поиска связанных ссылок
    """
    
    def __init__(self):
        self.session = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.search_apis = {
            'google': 'https://www.googleapis.com/customsearch/v1',
            'bing': 'https://api.bing.microsoft.com/v7.0/search',
            'duckduckgo': 'https://api.duckduckgo.com/'
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers=self.headers)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_url(self, url: str) -> str:
        """
        Парсинг содержимого веб-страницы
        """
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
        
        try:
            async with self.session.get(url, timeout=30) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._extract_text(html)
                else:
                    return f"Ошибка при загрузке страницы: {response.status}"
        except Exception as e:
            return f"Ошибка при парсинге {url}: {str(e)}"
    
    def _extract_text(self, html: str) -> str:
        """
        Извлечение текста из HTML
        """
        soup = BeautifulSoup(html, 'html.parser')
        
        # Удаляем скрипты и стили
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Извлекаем заголовок
        title = soup.find('title')
        title_text = title.get_text() if title else ""
        
        # Извлекаем основной контент
        content = ""
        
        # Ищем основной контент в различных тегах
        main_selectors = [
            'main', 'article', '.content', '.post-content', 
            '.entry-content', '#content', '.main-content'
        ]
        
        for selector in main_selectors:
            element = soup.select_one(selector)
            if element:
                content = element.get_text(separator='\n', strip=True)
                break
        
        # Если не нашли основной контент, берем body
        if not content:
            body = soup.find('body')
            if body:
                content = body.get_text(separator='\n', strip=True)
        
        # Очищаем текст
        content = self._clean_text(content)
        
        return f"Заголовок: {title_text}\n\n{content}"
    
    def _clean_text(self, text: str) -> str:
        """
        Очистка текста от лишних символов
        """
        # Удаляем множественные пробелы и переносы строк
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        
        # Удаляем специальные символы
        text = re.sub(r'[^\w\s\.\,\!\?\:\;\-\(\)\[\]\{\}]', '', text)
        
        return text.strip()
    
    async def search_related_content(self, content: str, max_results: int = 5) -> List[Dict[str, str]]:
        """
        Поиск связанного контента в интернете
        """
        # Извлекаем ключевые слова из контента
        keywords = await self._extract_keywords(content)
        
        # Ищем в разных поисковых системах
        results = []
        
        # Google Custom Search (если есть API ключ)
        if os.getenv("GOOGLE_SEARCH_API_KEY") and os.getenv("GOOGLE_SEARCH_ENGINE_ID"):
            google_results = await self._search_google(keywords, max_results)
            results.extend(google_results)
        
        # Bing Search (если есть API ключ)
        if os.getenv("BING_SEARCH_API_KEY"):
            bing_results = await self._search_bing(keywords, max_results)
            results.extend(bing_results)
        
        # DuckDuckGo (бесплатный)
        duck_results = await self._search_duckduckgo(keywords, max_results)
        results.extend(duck_results)
        
        # Удаляем дубликаты и ограничиваем количество
        unique_results = self._remove_duplicates(results)
        return unique_results[:max_results]
    
    async def _extract_keywords(self, content: str) -> List[str]:
        """
        Извлечение ключевых слов из контента
        """
        # Простая реализация - можно улучшить с помощью NLP
        words = re.findall(r'\b\w+\b', content.lower())
        
        # Фильтруем стоп-слова
        stop_words = {
            'и', 'в', 'во', 'не', 'что', 'он', 'на', 'я', 'с', 'со', 'как', 'а', 'то', 'все', 'она',
            'так', 'его', 'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'только', 'ее',
            'мне', 'было', 'вот', 'от', 'меня', 'еще', 'нет', 'о', 'из', 'ему', 'теперь', 'когда',
            'даже', 'ну', 'вдруг', 'ли', 'если', 'уже', 'или', 'ни', 'быть', 'был', 'него', 'до',
            'вас', 'нибудь', 'опять', 'уж', 'вам', 'ведь', 'там', 'потом', 'себя', 'ничего', 'ей',
            'может', 'они', 'тут', 'где', 'есть', 'надо', 'ней', 'для', 'мы', 'тебя', 'их', 'чем',
            'была', 'сам', 'чтоб', 'без', 'будто', 'чего', 'раз', 'тоже', 'себе', 'под', 'будет',
            'ж', 'тогда', 'кто', 'этот', 'того', 'потому', 'этого', 'какой', 'совсем', 'ним', 'здесь',
            'этом', 'один', 'почти', 'мой', 'тем', 'чтобы', 'нее', 'сейчас', 'были', 'куда', 'зачем',
            'всех', 'никогда', 'можно', 'при', 'наконец', 'два', 'об', 'другой', 'хоть', 'после',
            'над', 'больше', 'тот', 'через', 'эти', 'нас', 'про', 'всего', 'них', 'какая', 'много',
            'разве', 'три', 'эту', 'моя', 'впрочем', 'хорошо', 'свою', 'этой', 'перед', 'иногда',
            'лучше', 'чуть', 'том', 'нельзя', 'такой', 'им', 'более', 'всегда', 'притом', 'будет',
            'очень', 'насчет', 'всю', 'между'
        }
        
        # Считаем частоту слов
        word_freq = {}
        for word in words:
            if word not in stop_words and len(word) > 2:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Возвращаем топ-10 самых частых слов
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:10]]
    
    async def _search_google(self, keywords: List[str], max_results: int) -> List[Dict[str, str]]:
        """
        Поиск через Google Custom Search API
        """
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
        
        query = ' '.join(keywords[:5])  # Берем первые 5 ключевых слов
        
        params = {
            'key': os.getenv("GOOGLE_SEARCH_API_KEY"),
            'cx': os.getenv("GOOGLE_SEARCH_ENGINE_ID"),
            'q': query,
            'num': min(max_results, 10)
        }
        
        try:
            async with self.session.get(self.search_apis['google'], params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = []
                    
                    if 'items' in data:
                        for item in data['items']:
                            results.append({
                                'title': item.get('title', ''),
                                'url': item.get('link', ''),
                                'description': item.get('snippet', ''),
                                'source': 'google'
                            })
                    
                    return results
        except Exception as e:
            print(f"Ошибка Google поиска: {e}")
        
        return []
    
    async def _search_bing(self, keywords: List[str], max_results: int) -> List[Dict[str, str]]:
        """
        Поиск через Bing Search API
        """
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
        
        query = ' '.join(keywords[:5])
        
        headers = {
            'Ocp-Apim-Subscription-Key': os.getenv("BING_SEARCH_API_KEY")
        }
        
        params = {
            'q': query,
            'count': min(max_results, 10),
            'mkt': 'ru-RU'
        }
        
        try:
            async with self.session.get(self.search_apis['bing'], headers=headers, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = []
                    
                    if 'webPages' in data and 'value' in data['webPages']:
                        for item in data['webPages']['value']:
                            results.append({
                                'title': item.get('name', ''),
                                'url': item.get('url', ''),
                                'description': item.get('snippet', ''),
                                'source': 'bing'
                            })
                    
                    return results
        except Exception as e:
            print(f"Ошибка Bing поиска: {e}")
        
        return []
    
    async def _search_duckduckgo(self, keywords: List[str], max_results: int) -> List[Dict[str, str]]:
        """
        Поиск через DuckDuckGo (бесплатный API)
        """
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
        
        query = ' '.join(keywords[:5])
        
        params = {
            'q': query,
            'format': 'json',
            'no_html': '1',
            'skip_disambig': '1'
        }
        
        try:
            async with self.session.get(self.search_apis['duckduckgo'], params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = []
                    
                    # DuckDuckGo возвращает результаты в разных полях
                    if 'AbstractURL' in data and data['AbstractURL']:
                        results.append({
                            'title': data.get('Abstract', ''),
                            'url': data['AbstractURL'],
                            'description': data.get('AbstractText', ''),
                            'source': 'duckduckgo'
                        })
                    
                    if 'RelatedTopics' in data:
                        for topic in data['RelatedTopics'][:max_results-1]:
                            if isinstance(topic, dict) and 'FirstURL' in topic:
                                results.append({
                                    'title': topic.get('Text', ''),
                                    'url': topic['FirstURL'],
                                    'description': topic.get('Text', ''),
                                    'source': 'duckduckgo'
                                })
                    
                    return results
        except Exception as e:
            print(f"Ошибка DuckDuckGo поиска: {e}")
        
        return []
    
    def _remove_duplicates(self, results: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Удаление дубликатов результатов
        """
        seen_urls = set()
        unique_results = []
        
        for result in results:
            url = result.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(result)
        
        return unique_results
    
    async def get_page_metadata(self, url: str) -> Dict[str, str]:
        """
        Получение метаданных страницы (Open Graph, Twitter Cards)
        """
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
        
        try:
            async with self.session.get(url, timeout=30) as response:
                if response.status == 200:
                    html = await response.text()
                    return self._extract_metadata(html, url)
        except Exception as e:
            print(f"Ошибка получения метаданных {url}: {e}")
        
        return {}
    
    def _extract_metadata(self, html: str, url: str) -> Dict[str, str]:
        """
        Извлечение метаданных из HTML
        """
        soup = BeautifulSoup(html, 'html.parser')
        metadata = {
            'url': url,
            'title': '',
            'description': '',
            'image': '',
            'author': '',
            'published_date': ''
        }
        
        # Заголовок
        title_tag = soup.find('title')
        if title_tag:
            metadata['title'] = title_tag.get_text().strip()
        
        # Open Graph метаданные
        og_title = soup.find('meta', property='og:title')
        if og_title:
            metadata['title'] = og_title.get('content', metadata['title'])
        
        og_description = soup.find('meta', property='og:description')
        if og_description:
            metadata['description'] = og_description.get('content', '')
        
        og_image = soup.find('meta', property='og:image')
        if og_image:
            metadata['image'] = og_image.get('content', '')
        
        # Twitter Card метаданные
        twitter_title = soup.find('meta', attrs={'name': 'twitter:title'})
        if twitter_title and not metadata['title']:
            metadata['title'] = twitter_title.get('content', '')
        
        twitter_description = soup.find('meta', attrs={'name': 'twitter:description'})
        if twitter_description and not metadata['description']:
            metadata['description'] = twitter_description.get('content', '')
        
        # Обычные мета-теги
        meta_description = soup.find('meta', attrs={'name': 'description'})
        if meta_description and not metadata['description']:
            metadata['description'] = meta_description.get('content', '')
        
        # Автор
        author_meta = soup.find('meta', attrs={'name': 'author'})
        if author_meta:
            metadata['author'] = author_meta.get('content', '')
        
        # Дата публикации
        published_meta = soup.find('meta', property='article:published_time')
        if published_meta:
            metadata['published_date'] = published_meta.get('content', '')
        
        return metadata
    
    async def validate_url(self, url: str) -> bool:
        """
        Проверка валидности URL
        """
        try:
            parsed = urlparse(url)
            return bool(parsed.scheme and parsed.netloc)
        except:
            return False
    
    async def get_favicon(self, url: str) -> Optional[str]:
        """
        Получение favicon сайта
        """
        if not self.session:
            self.session = aiohttp.ClientSession(headers=self.headers)
        
        try:
            parsed = urlparse(url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            
            # Попробуем стандартные пути к favicon
            favicon_paths = [
                '/favicon.ico',
                '/favicon.png',
                '/apple-touch-icon.png',
                '/icon.png'
            ]
            
            for path in favicon_paths:
                favicon_url = urljoin(base_url, path)
                try:
                    async with self.session.head(favicon_url, timeout=10) as response:
                        if response.status == 200:
                            return favicon_url
                except:
                    continue
            
            return None
        except Exception as e:
            print(f"Ошибка получения favicon {url}: {e}")
            return None 