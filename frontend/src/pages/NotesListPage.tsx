"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/NoteListPage.css";
import NeonBackground from "../components/NeonBackground";
import { FiPlus } from "react-icons/fi";

// Типы для заметок
interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  connections?: number;
}

// API функция для получения заметок
const fetchNotes = async (): Promise<Note[]> => {
  const response = await axios.get("http://localhost:8000/notes/", {
    withCredentials: true,
  });

  return response.data;
};

// Компонент карточки заметки
function NoteCard({ note }: { note: Note }) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="note-card"
      style={{ textDecoration: "none" }}
    >
      <div className="note-card-content">
        <div className="note-card-header">
          <h3 className="note-card-title">{note.title}</h3>
          <span className="note-card-date">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
        </div>
        <p className="note-card-preview">
          {note.content.length > 120
            ? `${note.content.substring(0, 120)}...`
            : note.content}
        </p>
        <div className="note-card-footer">
          <div className="note-card-tags">
            {Array.isArray(note.tags) &&
              note.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="note-tag">
                  #{tag}
                </span>
              ))}
            {Array.isArray(note.tags) && note.tags.length > 3 && (
              <span className="note-tag-more">+{note.tags.length - 3}</span>
            )}
          </div>
          {note.connections && (
            <div className="note-connections">
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

// Компонент ошибки
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="notes-error">
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
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{error.message}</p>
      <button onClick={onRetry} className="auth-btn">
        Try Again
      </button>
    </div>
  );
}

export default function NotesListPage() {
  const {
    data: notes,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });

  return (
    <div className="page-bg relative overflow-hidden">
      <NeonBackground />
      <div className="notes-container relative z-10 animate-fadeInUp">
        <div className="notes-header">
          <h2 className="notes-title">Your Notes</h2>
          <Link
            to="/notes/create"
            className="notes-create-btn shimmer-gradient flex items-center gap-2"
          >
            <FiPlus size={18} /> New Note
          </Link>
        </div>
        <div className="notes-list">
          {isLoading && <LoadingState />}
          {error && (
            <ErrorState error={error as Error} onRetry={() => refetch()} />
          )}
          {notes && notes.length === 0 && (
            <div className="note-card-placeholder">
              No notes yet. Create your first AI-powered note!
            </div>
          )}
          {notes && notes.length > 0 && (
            <>
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
