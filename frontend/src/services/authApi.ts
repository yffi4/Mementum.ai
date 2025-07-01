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
  start: DateTimeObj;
  end: DateTimeObj;
  location: string;
  html_link: string;
  created: string;
  updated: string;
}

export interface DateTimeObj {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface CreateEventData {
  summary: string;
  description?: string;
  start: DateTimeObj;
  end: DateTimeObj;
  location?: string;
  attendees?: string[];
}

class AuthApiService {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  private getAuthHeaders() {
    // Токен теперь в cookie, не нужны заголовки Authorization
    return {};
  }

  // Автоматическое обновление токена
  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      return response.ok;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  // Обертка для fetch с автоматическим обновлением токена
  private async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    // Если получили 401, попробуем обновить токен
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Повторяем запрос с новым токеном
        return fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });
      }
    }

    return response;
  }

  // Google OAuth
  async getGoogleAuthUrl(): Promise<string> {
    window.location.href = `${API_BASE}/auth/google`;
    return `${API_BASE}/auth/google`;
  }

  async getAuthStatus(): Promise<AuthStatus> {
    const response = await this.fetchWithAuth(`${API_BASE}/auth/status`);

    if (!response.ok) {
      throw new Error("Failed to get auth status");
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await this.fetchWithAuth(`${API_BASE}/auth/logout`, {
      method: "POST",
    });
  }

  async disconnectGoogle(): Promise<void> {
    const response = await this.fetchWithAuth(
      `${API_BASE}/auth/google/disconnect`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to disconnect Google account");
    }
  }

  // Calendar API (now under /notes)
  async getCalendars() {
    const response = await this.fetchWithAuth(
      `${API_BASE}/notes/calendar/calendars`
    );

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
    const response = await this.fetchWithAuth(url);

    if (!response.ok) {
      throw new Error("Failed to fetch calendar events");
    }

    return response.json();
  }

  async createCalendarEvent(
    eventData: CreateEventData,
    calendarId: string = "primary"
  ): Promise<CalendarEvent> {
    // Backend expects nested start/end objects
    const payload: any = {
      summary: eventData.summary,
      description: eventData.description,
      start: eventData.start,
      end: eventData.end,
      location: eventData.location,
    };

    if (eventData.attendees && eventData.attendees.length > 0) {
      payload.attendees = eventData.attendees.map((email) => ({ email }));
    }

    const response = await this.fetchWithAuth(
      `${API_BASE}/notes/calendar/events?calendar_id=${calendarId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create calendar event");
    }

    return response.json();
  }

  async getUserInfo() {
    const response = await this.fetchWithAuth(
      `${API_BASE}/notes/calendar/user-info`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  }

  // Note calendar events
  async getNoteCalendarEvents(
    noteId: number
  ): Promise<{ note_id: number; events: NoteCalendarEvent[] }> {
    const response = await this.fetchWithAuth(
      `${API_BASE}/notes/${noteId}/calendar-events`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch note calendar events");
    }

    return response.json();
  }

  async analyzeNoteForCalendar(
    noteId: number
  ): Promise<{ message: string; events_count: number }> {
    const response = await this.fetchWithAuth(
      `${API_BASE}/notes/${noteId}/analyze-calendar`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to analyze note for calendar");
    }

    return response.json();
  }
}

export const authApi = new AuthApiService();
