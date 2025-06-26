const API_BASE = "http://localhost:8000";

export interface AuthStatus {
  user: {
    id: number;
    email: string;
    username: string;
    google_connected: boolean;
    google_name?: string;
    google_picture?: string;
  };
  google_token_expires?: string;
}

export interface NoteCalendarEvent {
  id: number;
  google_event_id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
  location?: string;
  is_all_day: boolean;
  created_by_ai: boolean;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  html_link: string;
  created: string;
  updated: string;
}

export interface CreateEventData {
  summary: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string[];
}

class AuthApiService {
  private getAuthHeaders() {
    // Токен теперь в cookie, не нужны заголовки Authorization
    return {};
  }

  // Google OAuth
  async getGoogleAuthUrl(): Promise<string> {
    window.location.href = `${API_BASE}/auth/google`;
    return `${API_BASE}/auth/google`;
  }

  async getAuthStatus(): Promise<AuthStatus> {
    const response = await fetch(`${API_BASE}/auth/status`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get auth status");
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });
  }

  async disconnectGoogle(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/google/disconnect`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to disconnect Google account");
    }
  }

  // Calendar API (now under /notes)
  async getCalendars() {
    const response = await fetch(`${API_BASE}/notes/calendar/calendars`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch calendars");
    }

    return response.json();
  }

  async getCalendarEvents(
    params: {
      calendar_id?: string;
      time_min?: string;
      time_max?: string;
      max_results?: number;
    } = {}
  ): Promise<CalendarEvent[]> {
    const searchParams = new URLSearchParams();

    if (params.calendar_id)
      searchParams.append("calendar_id", params.calendar_id);
    if (params.time_min) searchParams.append("time_min", params.time_min);
    if (params.time_max) searchParams.append("time_max", params.time_max);
    if (params.max_results)
      searchParams.append("max_results", params.max_results.toString());

    const url = `${API_BASE}/notes/calendar/events?${searchParams.toString()}`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch calendar events");
    }

    return response.json();
  }

  async createCalendarEvent(
    eventData: CreateEventData,
    calendarId: string = "primary"
  ): Promise<CalendarEvent> {
    const response = await fetch(
      `${API_BASE}/notes/calendar/events?calendar_id=${calendarId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create calendar event");
    }

    return response.json();
  }

  async getUserInfo() {
    const response = await fetch(`${API_BASE}/notes/calendar/user-info`, {
      headers: this.getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  }

  // Note calendar events
  async getNoteCalendarEvents(
    noteId: number
  ): Promise<{ note_id: number; events: NoteCalendarEvent[] }> {
    const response = await fetch(
      `${API_BASE}/notes/${noteId}/calendar-events`,
      {
        headers: this.getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch note calendar events");
    }

    return response.json();
  }

  async analyzeNoteForCalendar(
    noteId: number
  ): Promise<{ message: string; events_count: number }> {
    const response = await fetch(
      `${API_BASE}/notes/${noteId}/analyze-calendar`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to analyze note for calendar");
    }

    return response.json();
  }
}

export const authApi = new AuthApiService();
