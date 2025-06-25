import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "../styles/AuthPages.css";
import NeonBackground from "../components/NeonBackground";
import { FiMail, FiLock } from "react-icons/fi";

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

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

  return (
    <div className="auth-bg relative overflow-hidden">
      <NeonBackground />
      <div className="auth-card relative z-10 animate-fadeInUp">
        <h2 className="auth-title">Sign in</h2>
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
