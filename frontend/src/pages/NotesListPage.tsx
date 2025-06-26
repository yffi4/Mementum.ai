"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import "../styles/NoteListPage.css";
import NeonBackground from "../components/NeonBackground";
import Navbar from "../components/Navbar";
import { FiPlus, FiTag, FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";

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

interface Category {
  name: string;
  count: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  google_picture?: string;
}

// API функции
const fetchNotes = async (): Promise<Note[]> => {
  const response = await axios.get("http://localhost:8000/notes/", {
    withCredentials: true,
  });
  return response.data;
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await axios.get("http://localhost:8000/notes/categories", {
    withCredentials: true,
  });
  return response.data.categories;
};

const fetchNotesByCategory = async (category: string): Promise<Note[]> => {
  const response = await axios.get(
    `http://localhost:8000/notes/by-category/${category}`,
    {
      withCredentials: true,
    }
  );
  return response.data.notes;
};

const analyzeAllNotes = async () => {
  const response = await axios.post(
    "http://localhost:8000/notes/analyze-all",
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

// Компонент карточки заметки
function NoteCard({ note }: { note: Note }) {
  const getCategoryColor = (category: string) => {
    const colors = {
      Работа: "text-blue-400 bg-blue-500/20",
      Личное: "text-green-400 bg-green-500/20",
      Идеи: "text-purple-400 bg-purple-500/20",
      Учеба: "text-yellow-400 bg-yellow-500/20",
      Проекты: "text-red-400 bg-red-500/20",
    };
    return (
      colors[category as keyof typeof colors] || "text-gray-400 bg-gray-500/20"
    );
  };

  const getImportanceStars = (importance: number) => {
    return "★".repeat(importance) + "☆".repeat(5 - importance);
  };

  return (
    <Link
      to={`/notes/${note.id}`}
      className="note-card"
      style={{ textDecoration: "none" }}
    >
      <div className="note-card-content">
        <div className="note-card-header">
          <div className="flex items-center justify-between">
            <h3 className="note-card-title">{note.title}</h3>
            {note.importance && (
              <span className="text-yellow-400 text-sm">
                {getImportanceStars(note.importance)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            {note.category && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                  note.category
                )}`}
              >
                <FiTag className="inline mr-1" size={10} />
                {note.category}
              </span>
            )}
            <span className="note-card-date">
              {new Date(note.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <p className="note-card-preview">
          {note.summary ||
            (note.content.length > 120
              ? `${note.content.substring(0, 120)}...`
              : note.content)}
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Получаем пользователя
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/status", {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Ошибка получения пользователя:", error);
      }
    };
    fetchUser();
  }, []);

  const {
    data: notes,
    isLoading: notesLoading,
    error,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["notes", selectedCategory],
    queryFn: selectedCategory
      ? () => fetchNotesByCategory(selectedCategory)
      : fetchNotes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const handleAnalyzeNotes = async () => {
    setIsAnalyzing(true);
    try {
      await analyzeAllNotes();
      await refetchNotes();
      await refetchCategories();
    } catch (error) {
      console.error("Ошибка анализа заметок:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="page-bg relative overflow-hidden">
      <NeonBackground />
      <Navbar user={user} />

      <div className="notes-container relative z-10 animate-fadeInUp pt-20">
        <div className="notes-header">
          <h2 className="notes-title">
            {selectedCategory ? `Категория: ${selectedCategory}` : "Your Notes"}
          </h2>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyzeNotes}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-2"
            >
              <FiFilter size={16} />
              {isAnalyzing ? "Анализируем..." : "Анализ AI"}
            </motion.button>
            <Link
              to="/notes/create"
              className="notes-create-btn shimmer-gradient flex items-center gap-2"
            >
              <FiPlus size={18} /> New Note
            </Link>
          </div>
        </div>

        {/* Categories Filter */}
        {categories && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  selectedCategory === null
                    ? "bg-neon-green/20 text-neon-green border border-neon-green/30"
                    : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
                }`}
              >
                Все заметки
              </motion.button>
              {categories.map((category) => (
                <motion.button
                  key={category.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.name
                      ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/30"
                      : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
                  }`}
                >
                  <FiTag size={12} />
                  {category.name}
                  <span className="bg-gray-600 text-gray-200 px-2 py-0.5 rounded-full text-xs">
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="notes-list">
          {notesLoading && <LoadingState />}
          {error && (
            <ErrorState error={error as Error} onRetry={() => refetchNotes()} />
          )}
          {notes && notes.length === 0 && (
            <div className="note-card-placeholder">
              {selectedCategory
                ? `Нет заметок в категории "${selectedCategory}"`
                : "No notes yet. Create your first AI-powered note!"}
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
