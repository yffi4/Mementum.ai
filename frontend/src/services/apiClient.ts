const API_BASE = "http://localhost:8000";

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

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
  async fetchWithAuth(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
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
            ...options.headers,
          },
        });
      } else {
        // Если refresh не удался, перенаправляем на страницу входа
        window.location.href = "/login";
        throw new Error("Authentication failed");
      }
    }

    return response;
  }

  // Удобные методы для HTTP запросов
  async get(url: string): Promise<Response> {
    return this.fetchWithAuth(url);
  }

  async post(url: string, data?: any): Promise<Response> {
    return this.fetchWithAuth(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any): Promise<Response> {
    return this.fetchWithAuth(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string): Promise<Response> {
    return this.fetchWithAuth(url, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
