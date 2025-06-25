from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Note схемы
class NoteBase(BaseModel):
    title: Optional[str] = None
    content: str

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    content: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# NoteConnection схемы
class NoteConnectionBase(BaseModel):
    note_b_id: int
    relation: str = 'RELATED'

class NoteConnectionCreate(NoteConnectionBase):
    pass

class NoteConnectionUpdate(BaseModel):
    relation: Optional[str] = None

class NoteConnectionResponse(NoteConnectionBase):
    id: int
    note_a_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# RelatedLink схемы
class RelatedLinkBase(BaseModel):
    url: str
    title: str
    score: int = 0

class RelatedLinkCreate(RelatedLinkBase):
    note_id: int

class RelatedLinkUpdate(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None
    score: Optional[int] = None

class RelatedLinkResponse(RelatedLinkBase):
    id: int
    user_id: int
    note_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Схемы с вложенными объектами
class NoteWithConnections(NoteResponse):
    connections_as_a: List[NoteConnectionResponse] = []
    connections_as_b: List[NoteConnectionResponse] = []

class NoteWithLinks(NoteResponse):
    links: List[RelatedLinkResponse] = []

