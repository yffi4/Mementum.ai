import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../services/authApi";
import type { ReactNode } from "react";
import type { AuthStatus } from "../services/authApi";

interface AuthContextType {
  user: AuthStatus["user"] | null;
  loading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthStatus["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = async () => {
    try {
      const authStatus = await authApi.getAuthStatus();
      setUser(authStatus.user);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Принудительно очищаем состояние даже при ошибке
      setUser(null);
      navigate("/");
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        const authStatus = await authApi.getAuthStatus();

        if (authStatus && authStatus.user) {
          // Пользователь авторизован
          setUser(authStatus.user);

          // Если находимся на главной странице, странице входа или регистрации - перенаправляем на /notes
          if (
            location.pathname === "/" ||
            location.pathname === "/login" ||
            location.pathname === "/register"
          ) {
            navigate("/notes", { replace: true });
          }
        } else {
          // Пользователь не авторизован
          setUser(null);

          // Если находимся на защищенной странице - перенаправляем на главную
          const protectedRoutes = ["/notes", "/calendar", "/profile"];
          const isProtectedRoute = protectedRoutes.some((route) =>
            location.pathname.startsWith(route)
          );

          if (isProtectedRoute) {
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
