import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export interface CalendarEventAttendee {
  email: string;
  displayName?: string;
  responseStatus?: string;
}

export interface CalendarEventDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  location?: string;
  attendees?: CalendarEventAttendee[];
  colorId?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  htmlLink?: string;
  status?: string;
}

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  accessRole?: string;
}

export interface GoogleCalendarUser {
  email: string;
  name: string;
  picture?: string;
  is_connected: boolean;
}

export interface CreateEventRequest {
  calendar_id?: string;
  summary: string;
  description?: string;
  start: CalendarEventDateTime;
  end: CalendarEventDateTime;
  location?: string;
  attendees?: CalendarEventAttendee[];
  colorId?: string;
}

class CalendarApiService {
  private apiClient = axios.create({
    baseURL: `${API_BASE_URL}/calendar`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Получить URL для авторизации Google
  async getAuthUrl(): Promise<string> {
    try {
      const response = await this.apiClient.get("/auth-url");
      return response.data.auth_url;
    } catch (error) {
      throw new Error("Failed to get auth URL");
    }
  }

  // Получить статус подключения
  async getConnectionStatus(): Promise<{
    is_connected: boolean;
    user_info?: GoogleCalendarUser;
  }> {
    try {
      const response = await this.apiClient.get("/status");
      return response.data;
    } catch (error) {
      return { is_connected: false };
    }
  }

  // Получить информацию о пользователе Google
  async getUserInfo(): Promise<GoogleCalendarUser> {
    try {
      const response = await this.apiClient.get("/user-info");
      return response.data;
    } catch (error) {
      throw new Error("Failed to get user info");
    }
  }

  // Получить список календарей
  async getCalendars(): Promise<Calendar[]> {
    try {
      const response = await this.apiClient.get("/calendars");
      return response.data.calendars;
    } catch (error) {
      throw new Error("Failed to get calendars");
    }
  }

  // Получить события календаря
  async getEvents(
    calendarId: string = "primary",
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 250
  ): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams({
        calendar_id: calendarId,
        max_results: maxResults.toString(),
      });

      if (timeMin) params.append("time_min", timeMin);
      if (timeMax) params.append("time_max", timeMax);

      const response = await this.apiClient.get(`/events?${params}`);
      return response.data.events;
    } catch (error) {
      throw new Error("Failed to get events");
    }
  }

  // Создать событие
  async createEvent(eventData: CreateEventRequest): Promise<CalendarEvent> {
    try {
      const response = await this.apiClient.post("/events", eventData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create event");
    }
  }

  // Отключиться от Google Calendar
  async disconnect(): Promise<void> {
    try {
      await this.apiClient.delete("/disconnect");
    } catch (error) {
      throw new Error("Failed to disconnect");
    }
  }

  // Утилиты для форматирования
  formatEventDateTime(dateTime: string, timeZone?: string): string {
    const date = new Date(dateTime);
    return date.toLocaleString("ru-RU", {
      timeZone: timeZone || "Europe/Moscow",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  isAllDayEvent(event: CalendarEvent): boolean {
    return !!event.start.date && !event.start.dateTime;
  }

  getEventDuration(event: CalendarEvent): number {
    const start = new Date(event.start.dateTime || event.start.date || "");
    const end = new Date(event.end.dateTime || event.end.date || "");
    return end.getTime() - start.getTime();
  }
}

export const calendarApiService = new CalendarApiService();
