// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL,

  // API Endpoints
  endpoints: {
    auth: {
      register: "/auth/register",
      login: "/auth/token",
      status: "/auth/status",
      google: "/auth/google",
      googleCallback: "/auth/google/callback",
      googleDisconnect: "/auth/google/disconnect",
    },
    notes: {
      base: "/notes/",
      count: "/notes/count",
      categories: "/notes/categories",
      categoriesGrouped: "/notes/categories/grouped",
      analyzeAll: "/notes/analyze-all",
    },
    aiAgent: {
      process: "/ai-agent/process",
    },
    calendar: {
      base: "/calendar/",
    },
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to build URLs for specific endpoints
export const getApiUrls = () => ({
  // Auth URLs
  register: buildApiUrl(API_CONFIG.endpoints.auth.register),
  login: buildApiUrl(API_CONFIG.endpoints.auth.login),
  authStatus: buildApiUrl(API_CONFIG.endpoints.auth.status),
  googleAuth: buildApiUrl(API_CONFIG.endpoints.auth.google),
  googleDisconnect: buildApiUrl(API_CONFIG.endpoints.auth.googleDisconnect),

  // Notes URLs
  notes: buildApiUrl(API_CONFIG.endpoints.notes.base),
  notesCount: buildApiUrl(API_CONFIG.endpoints.notes.count),
  notesCategories: buildApiUrl(API_CONFIG.endpoints.notes.categories),
  notesCategoriesGrouped: buildApiUrl(
    API_CONFIG.endpoints.notes.categoriesGrouped
  ),
  notesAnalyzeAll: buildApiUrl(API_CONFIG.endpoints.notes.analyzeAll),

  // AI Agent URLs
  aiAgentProcess: buildApiUrl(API_CONFIG.endpoints.aiAgent.process),

  // Calendar URLs
  calendar: buildApiUrl(API_CONFIG.endpoints.calendar.base),
});
