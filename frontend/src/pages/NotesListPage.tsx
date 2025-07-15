"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/NoteListPage.css";
import NeonBackground from "../components/NeonBackground";
import Navbar from "../components/Navbar";

import { FiTag } from "react-icons/fi";
import { getApiUrls } from "../config/api";
import { useAuth } from "../contexts/AuthContext";

// Типы для заметок
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
}

// API функции

const fetchGroupedNotes = async (): Promise<Record<string, Note[]>> => {
  const apiUrls = getApiUrls();
  const resp = await axios.get(apiUrls.notesCategoriesGrouped, {
    withCredentials: true,
  });
  return resp.data.groups;
};

// Компонент карточки заметки
function NoteCard({ note }: { note: Note }) {
  const getCategoryColor = (category: string) => {
    const colors = {
      Learning: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      Project: "text-green-400 bg-green-500/20 border-green-500/30",
      Idea: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      Work: "text-orange-400 bg-orange-500/20 border-orange-500/30",
      Research: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
      Finance: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
      Health: "text-red-400 bg-red-500/20 border-red-500/30",
      Travel: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
      Shopping: "text-pink-400 bg-pink-500/20 border-pink-500/30",
      Personal: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
      Tech: "text-slate-400 bg-slate-500/20 border-slate-500/30",
      Links: "text-teal-400 bg-teal-500/20 border-teal-500/30",
      General: "text-gray-400 bg-gray-500/20 border-gray-500/30",
    };
    return (
      colors[category as keyof typeof colors] ||
      "text-gray-400 bg-gray-500/20 border-gray-500/30"
    );
  };

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return { text: "Критическая", color: "text-red-400", icon: "🔥" };
    if (importance >= 6)
      return { text: "Высокая", color: "text-orange-400", icon: "⚡" };
    if (importance >= 4)
      return { text: "Средняя", color: "text-yellow-400", icon: "📝" };
    return { text: "Низкая", color: "text-green-400", icon: "📋" };
  };

  const parseTags = (tags: any) => {
    try {
      if (typeof tags === "string") {
        return JSON.parse(tags);
      } else if (Array.isArray(tags)) {
        return tags;
      }
    } catch (e) {
      return [];
    }
    return [];
  };

  return (
    <Link
      to={`/notes/${note.id}`}
      className="note-card"
      style={{ textDecoration: "none" }}
    >
      <div className="note-card-content">
        <div className="note-card-header">
          <div className="flex items-start justify-between mb-3">
            <h3 className="note-card-title flex-1 mr-2">{note.title}</h3>
            {note.importance && (
              <div className="importance-indicator">
                <span
                  className={`importance-badge ${
                    getImportanceLevel(note.importance).color
                  }`}
                >
                  <span className="mr-1">
                    {getImportanceLevel(note.importance).icon}
                  </span>
                  {note.importance}/10
                </span>
              </div>
            )}
          </div>

          <div className="card-metadata">
            {note.category && (
              <span
                className={`category-badge ${getCategoryColor(note.category)}`}
              >
                <FiTag className="inline mr-1" size={10} />
                {note.category}
              </span>
            )}
            <span className="note-card-date">
              {(note.updatedAt || note.createdAt) &&
                new Date(note.updatedAt || note.createdAt).toLocaleDateString(
                  "ru-RU"
                )}
            </span>
          </div>
        </div>

        {/* Краткое резюме или превью контента */}
        <div className="note-card-preview">
          {note.summary ? (
            <div>
              <div className="preview-label">Резюме:</div>
              <p>
                {note.summary.length > 100
                  ? `${note.summary.substring(0, 100)}...`
                  : note.summary}
              </p>
            </div>
          ) : (
            <div>
              <div className="preview-label">Содержание:</div>
              <p>
                {note.content.length > 120
                  ? `${note.content.substring(0, 120)}...`
                  : note.content}
              </p>
            </div>
          )}
        </div>

        <div className="note-card-footer">
          <div className="note-card-tags">
            {(() => {
              const tags = parseTags(note.tags);
              return (
                tags.length > 0 && (
                  <>
                    {tags.slice(0, 3).map((tag: string, index: number) => (
                      <span key={index} className="note-tag">
                        #{tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="note-tag-more">+{tags.length - 3}</span>
                    )}
                  </>
                )
              );
            })()}
          </div>

          <div className="card-stats">
            {note.connections && (
              <div className="note-connections" title="Связи">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="6"
                    cy="6"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="6"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" />
                </svg>
                {note.connections}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Компонент загрузки
function LoadingState() {
  return (
    <div className="notes-loading">
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
      <p className="loading-text">Loading your notes...</p>
    </div>
  );
}

export default function NotesListPage() {
  const { user } = useAuth();

  const { data: grouped, isLoading } = useQuery({
    queryKey: ["notes-grouped"],
    queryFn: fetchGroupedNotes,
  });

  if (isLoading) {
    return (
      <div className="page-bg relative overflow-hidden">
        <NeonBackground />
        <Navbar user={user || undefined} />
        <div className="notes-top w-full flex justify-center items-center min-h-screen">
          <LoadingState />
        </div>
      </div>
    );
  }

  // Проверяем есть ли заметки
  const hasNotes =
    grouped &&
    Object.keys(grouped).length > 0 &&
    Object.values(grouped).some((notes) => notes.length > 0);

  if (!hasNotes) {
    return (
      <div className="page-bg relative overflow-hidden">
        <NeonBackground />
        <Navbar user={user || undefined} />
      </div>
    );
  }

  return (
    <div className="page-bg relative overflow-hidden">
      <NeonBackground />
      <Navbar user={user || undefined} />

      <div className="notes-top max-w-6xl mx-auto px-4 space-y-12 pt-20">
        {Object.entries(grouped || {}).map(([category, notes]) => (
          <section key={category} className="category-section">
            <div className="category-header">
              <h2 className="category-title">
                {category}
                <span className="category-count">{notes.length}</span>
              </h2>
            </div>
            <div className="category-notes-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
