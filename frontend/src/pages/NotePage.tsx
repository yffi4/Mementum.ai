"use client";

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "../styles/NotePage.css";
import NeonBackground from "../components/NeonBackground";
import {
  FiEdit3,
  FiTrash2,
  FiSave,
  FiTag,
  FiStar,
  FiBookOpen,
  FiClock,
  FiUser,
} from "react-icons/fi";

// Типы
interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  importance?: number;
  tags: string[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
  connections?: number;
  aiProcessed?: boolean;
  aiSummary?: string;
}

interface UpdateNoteData {
  title?: string;
  content: string;
}

// API функции
const fetchNote = async (id: string): Promise<Note> => {
  const response = await axios.get(`http://localhost:8000/notes/${id}/`, {
    withCredentials: true,
  });
  return response.data;
};

const updateNote = async (id: string, data: UpdateNoteData): Promise<Note> => {
  const response = await axios.put(`http://localhost:8000/notes/${id}/`, data, {
    withCredentials: true,
  });
  return response.data;
};

const deleteNote = async (id: string): Promise<void> => {
  await axios.delete(`http://localhost:8000/notes/${id}/`, {
    withCredentials: true,
  });
};

// Компонент загрузки
function LoadingState() {
  return (
    <div className="note-loading">
      <div className="loading-spinner">
        <svg className="spinner" fill="none" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            className="opacity-25"
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            className="opacity-75"
          />
        </svg>
      </div>
      <p className="loading-text">Loading note...</p>
    </div>
  );
}

// Вспомогательные функции
const getCategoryColor = (category: string) => {
  const colors = {
    Обучение: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    Проект: "text-green-400 bg-green-500/20 border-green-500/30",
    Идея: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    Работа: "text-orange-400 bg-orange-500/20 border-orange-500/30",
    Исследование: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
    Финансы: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    Здоровье: "text-red-400 bg-red-500/20 border-red-500/30",
    Путешествия: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
    Покупки: "text-pink-400 bg-pink-500/20 border-pink-500/30",
    Личное: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
    Техника: "text-slate-400 bg-slate-500/20 border-slate-500/30",
    Ссылки: "text-teal-400 bg-teal-500/20 border-teal-500/30",
    Общее: "text-gray-400 bg-gray-500/20 border-gray-500/30",
  };
  return (
    colors[category as keyof typeof colors] ||
    "text-gray-400 bg-gray-500/20 border-gray-500/30"
  );
};

const getImportanceLevel = (importance: number) => {
  if (importance >= 8)
    return { text: "Критическая", color: "text-red-400", bg: "bg-red-500/20" };
  if (importance >= 6)
    return {
      text: "Высокая",
      color: "text-orange-400",
      bg: "bg-orange-500/20",
    };
  if (importance >= 4)
    return {
      text: "Средняя",
      color: "text-yellow-400",
      bg: "bg-yellow-500/20",
    };
  return { text: "Низкая", color: "text-green-400", bg: "bg-green-500/20" };
};

const formatContent = (content: string) => {
  // Разбиваем контент на параграфы и структурируем
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  return paragraphs.map((paragraph, index) => {
    const trimmed = paragraph.trim();

    // Заголовки (начинаются с #)
    if (trimmed.startsWith("#")) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, "");
      return {
        type: "heading",
        level: Math.min(level, 3),
        content: text,
        key: `h-${index}`,
      };
    }

    // Списки
    if (trimmed.match(/^[-*•]\s/)) {
      const items = trimmed
        .split("\n")
        .map((line) => line.replace(/^[-*•]\s*/, "").trim())
        .filter(Boolean);
      return {
        type: "list",
        items,
        key: `list-${index}`,
      };
    }

    // Нумерованные списки
    if (trimmed.match(/^\d+\.\s/)) {
      const items = trimmed
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);
      return {
        type: "numbered-list",
        items,
        key: `num-list-${index}`,
      };
    }

    // Цитаты
    if (trimmed.startsWith(">")) {
      const text = trimmed.replace(/^>\s*/, "");
      return {
        type: "quote",
        content: text,
        key: `quote-${index}`,
      };
    }

    // Обычный параграф
    return {
      type: "paragraph",
      content: trimmed,
      key: `p-${index}`,
    };
  });
};

// Компонент ошибки
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="note-error">
      <div className="error-icon">
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="error-title">Note not found</h3>
      <p className="error-message">{error.message}</p>
      <div className="error-actions">
        <button onClick={onRetry} className="auth-btn">
          Try Again
        </button>
        <Link to="/notes" className="cancel-btn">
          Back to Notes
        </Link>
      </div>
    </div>
  );
}

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Запрос заметки
  const {
    data: note,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notes", id],
    queryFn: () => fetchNote(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Мутация обновления
  const updateMutation = useMutation({
    mutationFn: (data: UpdateNoteData) => updateNote(id!, data),
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.setQueryData(["notes", id], updatedNote);
      setIsEditing(false);
    },
  });

  // Мутация удаления
  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate("/notes");
    },
  });

  // Начать редактирование
  const startEditing = () => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
      setIsEditing(true);
    }
  };

  // Отменить редактирование
  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditContent("");
  };

  // Сохранить изменения
  const saveChanges = () => {
    if (!editContent.trim()) return;

    updateMutation.mutate({
      title: editTitle.trim() || undefined,
      content: editContent.trim(),
    });
  };

  // Удалить заметку
  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (!id) {
    return (
      <div className="page-bg relative overflow-hidden">
        <NeonBackground />
        <div className="note-error relative z-10">
          <h3 className="error-title">Invalid note ID</h3>
          <Link to="/notes" className="auth-btn">
            Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-bg relative overflow-hidden">
        <NeonBackground />
        <LoadingState />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="page-bg relative overflow-hidden">
        <NeonBackground />
        <ErrorState error={error as Error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="page-bg relative overflow-hidden">
      <NeonBackground />
      <div className="note-view-container relative z-10 animate-fadeInUp">
        {/* Заголовок страницы */}
        <div className="note-header">
          <div className="note-header-left">
            <Link to="/notes" className="back-btn">
              ← Back
            </Link>
          </div>
          <div className="note-header-right flex gap-2">
            {!isEditing && (
              <button
                className="edit-btn flex items-center gap-1"
                onClick={startEditing}
              >
                <FiEdit3 size={16} /> Edit
              </button>
            )}
            {!isEditing && (
              <button
                className="delete-btn flex items-center gap-1"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <FiTrash2 size={16} /> Delete
              </button>
            )}
            {isEditing && (
              <button
                className="save-btn shimmer-gradient flex items-center gap-1"
                onClick={saveChanges}
                disabled={updateMutation.isPending}
              >
                <FiSave size={16} /> Save
              </button>
            )}
            {isEditing && (
              <button
                className="cancel-btn"
                onClick={cancelEditing}
                disabled={updateMutation.isPending}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="note-content-card">
          {isEditing ? (
            <form className="note-edit-form">
              <input
                className="note-input note-title-input focus:shadow-[0_0_8px_2px_#a18aff55]"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                disabled={updateMutation.isPending}
              />
              <textarea
                className="note-input note-content-textarea focus:shadow-[0_0_8px_2px_#6feaff55]"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Content"
                disabled={updateMutation.isPending}
                rows={10}
              />
            </form>
          ) : (
            <>
              <div className="note-view-header">
                <div className="note-view-title">{note.title}</div>
                <div className="note-meta">
                  <span className="note-date">
                    Created: {new Date(note.createdAt).toLocaleString()}
                  </span>
                  <span className="note-date">
                    Updated: {new Date(note.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Метаданные заметки */}
              <div className="note-metadata-grid">
                {note.category && (
                  <div className="metadata-item">
                    <div className="metadata-label">
                      <FiTag className="inline mr-1" size={14} />
                      Категория
                    </div>
                    <span
                      className={`metadata-badge ${getCategoryColor(
                        note.category
                      )}`}
                    >
                      {note.category}
                    </span>
                  </div>
                )}

                {note.importance && (
                  <div className="metadata-item">
                    <div className="metadata-label">
                      <FiStar className="inline mr-1" size={14} />
                      Важность
                    </div>
                    <div className="importance-display">
                      <span
                        className={`metadata-badge ${
                          getImportanceLevel(note.importance).color
                        } ${getImportanceLevel(note.importance).bg}`}
                      >
                        {getImportanceLevel(note.importance).text}
                      </span>
                      <div className="importance-stars">
                        {Array.from({ length: 10 }, (_, i) => (
                          <FiStar
                            key={i}
                            size={12}
                            className={
                              i < note.importance
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }
                          />
                        ))}
                        <span className="text-sm text-gray-400 ml-2">
                          {note.importance}/10
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {(() => {
                  let tags = [];
                  try {
                    if (typeof note.tags === "string") {
                      tags = JSON.parse(note.tags);
                    } else if (Array.isArray(note.tags)) {
                      tags = note.tags;
                    }
                  } catch (e) {
                    tags = [];
                  }

                  return (
                    Array.isArray(tags) &&
                    tags.length > 0 && (
                      <div className="metadata-item">
                        <div className="metadata-label">
                          <FiTag className="inline mr-1" size={14} />
                          Теги
                        </div>
                        <div className="tags-container">
                          {tags.map((tag, index) => (
                            <span key={index} className="tag-pill">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>

              {/* Краткое резюме */}
              {note.summary && note.summary !== note.content && (
                <div className="note-summary-section">
                  <div className="summary-header">
                    <FiBookOpen className="inline mr-2" size={16} />
                    <span className="font-semibold">Краткое резюме</span>
                  </div>
                  <div className="summary-content">{note.summary}</div>
                </div>
              )}

              {/* Основной контент */}
              <div className="note-content-section">
                <div className="content-header">
                  <FiEdit3 className="inline mr-2" size={16} />
                  <span className="font-semibold">Содержание</span>
                </div>
                <div className="note-view-content">
                  {formatContent(note.content).map((block) => {
                    switch (block.type) {
                      case "heading":
                        const HeadingTag = `h${
                          block.level + 2
                        }` as keyof JSX.IntrinsicElements;
                        return (
                          <HeadingTag
                            key={block.key}
                            className={`content-heading level-${block.level}`}
                          >
                            {block.content}
                          </HeadingTag>
                        );

                      case "list":
                        return (
                          <ul key={block.key} className="content-list">
                            {block.items.map((item, idx) => (
                              <li key={idx} className="content-list-item">
                                {item}
                              </li>
                            ))}
                          </ul>
                        );

                      case "numbered-list":
                        return (
                          <ol key={block.key} className="content-numbered-list">
                            {block.items.map((item, idx) => (
                              <li key={idx} className="content-list-item">
                                {item}
                              </li>
                            ))}
                          </ol>
                        );

                      case "quote":
                        return (
                          <blockquote key={block.key} className="content-quote">
                            {block.content}
                          </blockquote>
                        );

                      default:
                        return (
                          <p key={block.key} className="content-paragraph">
                            {block.content}
                          </p>
                        );
                    }
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Модальное окно подтверждения удаления */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-title">Delete Note</div>
              <div className="modal-message">
                Are you sure you want to delete this note?
              </div>
              <div className="modal-actions flex gap-2">
                <button
                  className="delete-confirm-btn flex items-center gap-1"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <FiTrash2 size={16} /> Delete
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
