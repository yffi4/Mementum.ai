import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

// Типы
export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  connections?: number
  aiProcessed?: boolean
  aiSummary?: string
}

export interface CreateNoteData {
  title?: string
  content: string
}

export interface UpdateNoteData extends Partial<CreateNoteData> {
  id: string
}

// API функции
const notesApi = {
  getAll: async (): Promise<Note[]> => {
    const response = await axios.get("http://localhost:8000/notes/", {
      withCredentials: true,
    })
    return response.data
  },

  getById: async (id: string): Promise<Note> => {
    const response = await axios.get(`http://localhost:8000/notes/${id}/`, {
      withCredentials: true,
    })
    return response.data
  },

  createWithAI: async (data: CreateNoteData): Promise<Note> => {
    const response = await axios.post("http://localhost:8000/ai-agent/process", data, {
      withCredentials: true,
    })
    return response.data
  },

  update: async (data: UpdateNoteData): Promise<Note> => {
    const response = await axios.put(`http://localhost:8000/notes/${data.id}/`, data, {
      withCredentials: true,
    })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`http://localhost:8000/notes/${id}/`, {
      withCredentials: true,
    })
  },
}

// Хуки
export const useNotes = () => {
  return useQuery({
    queryKey: ["notes"],
    queryFn: notesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 минут
    gcTime: 10 * 60 * 1000, // 10 минут
  })
}

export const useNote = (id: string) => {
  return useQuery({
    queryKey: ["notes", id],
    queryFn: () => notesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCreateNoteWithAI = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notesApi.createWithAI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}

export const useUpdateNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notesApi.update,
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.setQueryData(["notes", updatedNote.id], updatedNote)
    },
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })
}
