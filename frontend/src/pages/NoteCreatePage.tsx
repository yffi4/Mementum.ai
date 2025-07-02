"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrls } from "../config/api";
import "../styles/NoteCreatePage.css";
import NeonBackground from "../components/NeonBackground";
import Navbar from "../components/Navbar";
import { FiEdit3 } from "react-icons/fi";
import NoteRenderer from "../components/NoteRenderer";

// Типы
interface CreateNoteData {
  title?: string;
  content: string;
}

interface CreateNoteResponse {
  note_id?: number; // ID, как возвращается AgentResponse
  id?: string; // резервная совместимость
  title?: string;
  content?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  aiProcessed?: boolean;
  aiSummary?: string;
  connections?: number;
}

// API функция для создания заметки с AI обработкой
const createNoteWithAI = async (
  data: CreateNoteData
): Promise<CreateNoteResponse> => {
  const apiUrls = getApiUrls();
  const message = `${data.title ? data.title + "\n\n" : ""}${data.content}`;

  const response = await axios.post(
    apiUrls.aiAgentProcess,
    {
      message: message,
      enable_background_tasks: true,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export default function NoteCreatePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Получаем пользователя
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const apiUrls = getApiUrls();
        const response = await axios.get(apiUrls.authStatus, {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Ошибка получения пользователя:", error);
      }
    };
    fetchUser();
  }, []);

  const createNoteMutation = useMutation({
    mutationFn: createNoteWithAI,
    onSuccess: (newNote) => {
      // Обновляем кеш группированных заметок
      queryClient.invalidateQueries({ queryKey: ["notes-grouped"] });

      const createdId = (newNote as any).note_id ?? (newNote as any).id;

      if (createdId) {
        navigate(`/notes/${createdId}`);
      } else {
        // Если ID не получен, возвращаем пользователя к списку заметок
        navigate("/notes");
      }
    },
    onError: (error) => {
      console.error("Error creating note:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    createNoteMutation.mutate({
      title: title.trim() || undefined,
      content: content.trim(),
    });
  };

  const isLoading = createNoteMutation.isPending;
  const error = createNoteMutation.error;

  return (
    <div className="page-bg relative overflow-hidden">
      <NeonBackground />
      <Navbar user={user || undefined} />
      <div className="note-create-card relative z-10 animate-fadeInUp pt-32">
        <div className="note-create-header">
          <h2 className="note-create-title">
            {isLoading ? "AI is processing..." : "Create Note"}
          </h2>
          {isLoading && (
            <div className="ai-processing-indicator">
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
              <span>Structuring your thoughts...</span>
            </div>
          )}
        </div>

        <form className="note-create-form" onSubmit={handleSubmit}>
          <input
            className="note-input focus:shadow-[0_0_8px_2px_#a18aff55]"
            type="text"
            placeholder="Title (optional - AI will suggest one)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />

          <div className="textarea-container">
            <textarea
              className="note-input note-textarea focus:shadow-[0_0_8px_2px_#6feaff55]"
              placeholder="Start writing your thoughts... AI will help structure and organize them."
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              required
            />
            <div className="textarea-footer">
              <span className="char-count">{content.length} characters</span>
              {content.length > 50 && (
                <button
                  type="button"
                  className="preview-btn"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  disabled={isLoading}
                >
                  {isPreviewMode ? "Edit" : "Preview"}
                </button>
              )}
            </div>
          </div>

          {isPreviewMode && content && (
            <div className="note-preview-card">
              <h4 className="preview-title">Preview</h4>
              <div className="preview-content">
                <NoteRenderer content={content} />
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
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
              <span>
                {error instanceof Error
                  ? error.message
                  : "Failed to create note. Please try again."}
              </span>
            </div>
          )}

          <div className="form-actions flex gap-2">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/notes")}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="note-create-btn shimmer-gradient flex items-center gap-2"
              type="submit"
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? (
                <>
                  <svg className="btn-spinner" fill="none" viewBox="0 0 24 24">
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
                  Creating...
                </>
              ) : (
                <>
                  <FiEdit3 size={18} /> Create with AI
                </>
              )}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="ai-processing-steps">
            <div className="processing-step active">
              <div className="step-indicator"></div>
              <span>Analyzing content...</span>
            </div>
            <div className="processing-step active">
              <div className="step-indicator"></div>
              <span>Generating structure...</span>
            </div>
            <div className="processing-step">
              <div className="step-indicator"></div>
              <span>Creating connections...</span>
            </div>
            <div className="processing-step">
              <div className="step-indicator"></div>
              <span>Finalizing note...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
