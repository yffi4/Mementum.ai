AGENT_PROMPTS = {
    "request_analysis": """
    Analyze the user request and determine the type of action. 
    IMPORTANT: Respond in the same language as the user request.
    
    Request: {request}
    
    Return JSON with fields:
    - type: action type (create_note, create_plan, save_link, reminder, search, general)
    - title: title for note/plan
    - category: category (learning, project, idea, task, link, reminder)
    - description: description
    - url: URL if exists
    - plan_type: plan type (learning, project, research)
    - complexity: complexity (simple, medium, complex)
    - search_term: search query
    - format: note format (structured, list, diagram)
    - language: detected language code (en, ru, es, fr, de, etc.)
    
    Examples:
    - "сделай мне систем дизайн проекта" -> create_plan (ru)
    - "create a system design project" -> create_plan (en)
    - "save this link" -> save_link (en)
    - "напомни мне завтра" -> reminder (ru)
    - "find all about Python" -> search (en)
    """,
    
    "note_generation": """
    Create a structured note based on the user request. 
    IMPORTANT: Write the note in the same language as the original request.
    
    Request: {request}
    Category: {category}
    Format: {format}
    Detected Language: {language}
    
    Create an informative, well-structured note with:
    - Brief description
    - Main points
    - Practical examples
    - Resource links (if appropriate)
    - Conclusions and recommendations
    
    Use markdown formatting. Write everything in the language of the original request.
    """,
    
    "plan_generation": """
    Create a detailed {plan_type} plan with {complexity} complexity.
    IMPORTANT: Write the plan in the same language as the original request.
    
    Request: {request}
    Language: {language}
    
    The plan should include:
    - Goals and objectives
    - Implementation stages
    - Time frames
    - Required resources
    - Success criteria
    - Possible obstacles and solutions
    
    Make the plan practical and achievable. Write in the language of the original request.
    """,
    
    "step_extraction": """
    Extract steps from the plan and create a structured list.
    IMPORTANT: Keep the same language as the original plan.
    
    Plan:
    {plan_content}
    
    Return JSON array of objects:
    [
        {{
            "title": "Step title",
            "content": "Detailed step description with tasks and resources"
        }}
    ]
    
    Each step should be specific and measurable. Use the same language as the input.
    """,
    
    "time_extraction": """
    Extract time information from the request.
    IMPORTANT: Keep the same language as the original request.
    
    Request: {request}
    
    Return JSON:
    {{
        "start": "2024-01-01T10:00:00",
        "end": "2024-01-01T11:00:00",
        "duration": "1 hour",
        "recurring": false
    }}
    
    If time is not specified, use reasonable defaults.
    """,
    
    "assistant": """
    You are an intelligent assistant for knowledge and task management.
    Your task is to help users organize information, create plans, find connections between ideas, and optimize workflow.
    
    IMPORTANT: Always respond in the same language as the user's question.
    
    Answer concisely but informatively. Suggest practical solutions.
    """,
    
    "summary_creation": """
    Create a summary note based on organized notes.
    IMPORTANT: Write the summary in the same language as the original request.
    
    Request: {request}
    Organized notes: {organized_notes}
    Language: {language}
    
    Create a structured summary with:
    - Main conclusions
    - Key themes
    - Connections between notes
    - Recommendations for further actions
    
    Write in the language of the original request.
    """,
    
    "categorization": """
    Determine the note category from the list. 
    IMPORTANT: Analyze the content and return the category name in the same language as the content.
    
    Categories:
    - learning (courses, lectures, technology studies)
    - project (plans, tasks, stages)
    - idea (concepts, innovations, thoughts)
    - link (web resources, articles, documents)
    - reminder (events, deadlines, meetings)
    - research (analysis, studies, experiments)
    - general (miscellaneous, notes, records)
    
    Note content:
    {content}
    
    Return only the category name. If content is in Russian, return Russian category names:
    - обучение, проект, идея, ссылка, напоминание, исследование, общая
    If content is in English, return English category names.
    """,
    
    "importance_assessment": """
    Assess the importance of the note on a scale from 1 to 10.
    IMPORTANT: The assessment should be universal regardless of language.
    
    Criteria:
    - 1-3: low importance (general notes, temporary information)
    - 4-6: medium importance (useful information, links)
    - 7-8: high importance (key ideas, project plans)
    - 9-10: critical importance (critical decisions, important deadlines)
    
    Note content:
    {content}
    
    Return only a number from 1 to 10.
    """,
    
    "summary_generation": """
    Create a brief summary of the note (maximum 2-3 sentences).
    IMPORTANT: Write the summary in the same language as the original note.
    
    Note content:
    {content}
    
    The summary should reflect the main essence and key points.
    Return only the summary without additional text.
    """,
    
    "tags_generation": """
    Generate 3-5 relevant tags for the note.
    IMPORTANT: Generate tags in the same language as the note content.
    
    Note content:
    {content}
    
    Return tags as a JSON array: ["tag1", "tag2", "tag3"]
    Tags should be relevant and useful for searching and organizing.
    """,
    
    "connection_finding": """
    Find connections between the new note and existing notes.
    IMPORTANT: Maintain language consistency in relation descriptions.
    
    New note:
    {new_content}
    
    Existing notes:
    {existing_notes}
    
    Return JSON array of objects:
    [
        {{
            "note_id": 123,
            "relation": "RELATED|SIMILAR|CONTRAST|PREREQUISITE|FOLLOW_UP"
        }}
    ]
    
    Connection types:
    - RELATED: related topics
    - SIMILAR: similar concepts
    - CONTRAST: opposite ideas
    - PREREQUISITE: prerequisite knowledge
    - FOLLOW_UP: continuation or development
    """,
    
    "note_organization": """
        Организуй следующие заметки в логические группы. Заметки на разных языках группируй отдельно.
        Каждая группа должна иметь описательное название и содержать связанные заметки.
        
        Заметки: {notes}
        
        Верни JSON массив групп в формате:
        [
          {
            "group_name": "Название группы",
            "description": "Описание группы",
            "note_ids": [список ID заметок],
            "priority": "high|medium|low"
          }
        ]
        """,
        
    "title_generation": """
        Внимательно проанализируй язык следующего текста и создай для него краткий, информативный заголовок СТРОГО на том же языке.

        ВАЖНО:
        - Если текст на русском языке - заголовок ТОЛЬКО на русском
        - Если текст на английском языке - заголовок ТОЛЬКО на английском  
        - Если текст на другом языке - заголовок на том же языке

        Правила для заголовка:
        1. Должен быть коротким (3-8 слов)
        2. Отражать основную тему или суть текста
        3. Быть информативным и понятным
        4. ОБЯЗАТЕЛЬНО на том же языке, что и исходный текст
        5. Не должен быть слишком общим или абстрактным
        6. Должен помочь быстро понять содержание заметки

        Текст: {content}

        Верни ТОЛЬКО заголовок на языке исходного текста, без дополнительного текста или объяснений.
        """
    
  } 

TITLE_GENERATION_PROMPT = """
Проанализируй следующий текст и создай для него краткий, информативный заголовок на том же языке, что и текст.

Правила для заголовка:
1. Должен быть коротким (3-8 слов)
2. Отражать основную тему или суть текста
3. Быть информативным и понятным
4. Написан на том же языке, что и исходный текст
5. Не должен быть слишком общим или абстрактным
6. Должен помочь быстро понять содержание заметки

Текст: {content}

Верни только заголовок, без дополнительного текста или объяснений.
""" 