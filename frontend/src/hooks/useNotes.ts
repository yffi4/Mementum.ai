import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

// Типы
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  connections?: number;
  aiProcessed?: boolean;
  aiSummary?: string;
}

export interface CreateNoteData {
  title?: string;
  content: string;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  id: string;
}

// API функции
const notesApi = {
  getAll: async (): Promise<Note[]> => {
    const response = await apiClient.get("http://localhost:8000/notes/");
    if (!response.ok) {
      throw new Error("Failed to fetch notes");
    }
    return response.json();
  },

  getById: async (id: string): Promise<Note> => {
    const response = await apiClient.get(`http://localhost:8000/notes/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch note");
    }
    return response.json();
  },

  createWithAI: async (data: CreateNoteData): Promise<Note> => {
    // Преобразуем данные в формат AgentRequest
    const agentRequest = {
      message: data.title ? `${data.title}\n\n${data.content}` : data.content,
      enable_background_tasks: false,
    };

    const response = await apiClient.post(
      "http://localhost:8000/ai-agent/process",
      agentRequest
    );
    if (!response.ok) {
      throw new Error("Failed to create note with AI");
    }

    const result = await response.json();

    // Возвращаем данные в формате Note
    return {
      id: result.note_id?.toString() || "",
      title: data.title || "Новая заметка",
      content: data.content,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiProcessed: true,
    };
  },

  update: async (data: UpdateNoteData): Promise<Note> => {
    const response = await apiClient.put(
      `http://localhost:8000/notes/${data.id}/`,
      data
    );
    if (!response.ok) {
      throw new Error("Failed to update note");
    }
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiClient.delete(
      `http://localhost:8000/notes/${id}/`
    );
    if (!response.ok) {
      throw new Error("Failed to delete note");
    }
  },
};

// Хуки
export const useNotes = () => {
  return useQuery({
    queryKey: ["notes"],
    queryFn: notesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  });
};

export const useNote = (id: string) => {
  return useQuery({
    queryKey: ["notes", id],
    queryFn: () => notesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateNoteWithAI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.createWithAI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.update,
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.setQueryData(["notes", updatedNote.id], updatedNote);
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
