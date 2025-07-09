"use client";

import type React from "react";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrls } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/NoteCreatePage.css";
import NeonBackground from "../components/NeonBackground";
import Navbar from "../components/Navbar";
import { FiEdit3, FiZap, FiCheck } from "react-icons/fi";
import NoteRenderer from "../components/NoteRenderer";

// Типы
interface CreateNoteData {
  content: string;
}

interface CreateNoteResponse {
  note_id: string;
  id: string;
  title: string;
  message: string;
}

// API функция для создания заметки с AI обработкой
const createNoteWithAI = async (
  data: CreateNoteData
): Promise<CreateNoteResponse> => {
  const apiUrls = getApiUrls();

  const response = await axios.post(
    apiUrls.aiAgentProcess,
    {
      message: data.content,
      enable_background_tasks: true,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export default function NoteCreatePage() {
  const [content, setContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { user } = useAuth();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
          <div className="create-title-section">
            <h2 className="note-create-title">
              {isLoading ? "AI is processing..." : "Create Note"}
            </h2>
            <p className="note-create-subtitle">
              {isLoading
                ? "Generating title and analyzing content..."
                : "Write your thoughts and AI will create a perfect title and organize your content"}
            </p>
          </div>
          {isLoading && (
            <div className="ai-processing-indicator">
              <div className="processing-icon">
                <FiZap className="zap-icon" />
              </div>
              <div className="processing-text">
                <span>AI is structuring your thoughts...</span>
                <div className="processing-steps">
                  <div className="step active">
                    <FiCheck size={12} />
                    <span>Content analyzed</span>
                  </div>
                  <div className="step active">
                    <FiZap size={12} />
                    <span>Generating title</span>
                  </div>
                  <div className="step">
                    <FiEdit3 size={12} />
                    <span>Organizing content</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form className="note-create-form" onSubmit={handleSubmit}>
          <div className="textarea-container">
            <textarea
              className="note-input note-textarea focus:shadow-[0_0_8px_2px_#6feaff55]"
              placeholder="Start writing your thoughts... AI will automatically generate a perfect title and organize your content beautifully."
              rows={12}
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
              type="submit"
              className="create-btn shimmer-gradient"
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? (
                <>
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FiZap size={18} />
                  <span>Create with AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
