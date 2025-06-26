import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "../styles/AuthPages.css";
import NeonBackground from "../components/NeonBackground";
import { FiMail, FiLock } from "react-icons/fi";
import { authApi } from "../services/authApi";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Проверить результат Google OAuth
  useEffect(() => {
    const authSuccess = searchParams.get("auth");
    const authError = searchParams.get("error");

    if (authSuccess === "success") {
      // Успешная авторизация через Google (токен уже в cookie)
      // Очищаем URL параметры и перенаправляем
      window.history.replaceState({}, document.title, "/login");
      setTimeout(() => {
        navigate("/notes");
      }, 500); // Небольшая задержка для лучшего UX
    } else if (authError) {
      setError(`Google authorization failed: ${authError}`);
      // Очищаем URL параметры
      window.history.replaceState({}, document.title, "/login");
    }
  }, [searchParams, navigate]);

  const mutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const params = new URLSearchParams();
      params.append("username", data.username);
      params.append("password", data.password);

      const res = await axios.post("http://localhost:8000/auth/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      });
      return res.data;
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.detail ??
        (Array.isArray(err?.response?.data)
          ? err.response.data[0]?.msg
          : "Login failed");
      setError(message);
    },
    onSuccess: () => {
      setError("");
      navigate("/notes/");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate(form);
  };

  const handleGoogleLogin = async () => {
    try {
      await authApi.getGoogleAuthUrl();
    } catch (error) {
      setError("Failed to initiate Google login");
    }
  };

  return (
    <div className="auth-bg relative overflow-hidden">
      <NeonBackground />
      <div className="auth-card relative z-10 animate-fadeInUp">
        <h2 className="auth-title">Sign in</h2>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mb-6 bg-gradient-to-r from-white to-gray-100 text-gray-800 border border-gray-300 
                     rounded-xl py-3 px-6 flex items-center justify-center gap-3 hover:shadow-lg 
                     transition-all duration-300 hover:from-gray-50 hover:to-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-900 text-gray-400">
              Or continue with email
            </span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="relative w-full">
            <input
              className="auth-input pr-10 focus:shadow-[0_0_8px_2px_#6feaff55]"
              name="username"
              type="text"
              placeholder="Email"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
            <span className="auth-input-icon text-cyan-300">
              <FiMail size={18} />
            </span>
          </div>
          <div className="relative w-full">
            <input
              className="auth-input pr-10 focus:shadow-[0_0_8px_2px_#a18aff55]"
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
            <span className="auth-input-icon text-purple-300">
              <FiLock size={18} />
            </span>
          </div>
          <button
            className="auth-btn shimmer-gradient flex items-center justify-center gap-2"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
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
            ) : (
              <>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 2a10 10 0 100 20 10 10 0 000-20z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12h8M12 8v8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Sign in
              </>
            )}
          </button>
        </form>
        {error && (
          <div className="auth-link" style={{ color: "#ff6b81" }}>
            {error}
          </div>
        )}
        <div className="auth-link">
          No account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
