import { Link } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { getApiUrls } from "../config/api";
import "../styles/AuthPages.css";
import NeonBackground from "../components/NeonBackground";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const apiUrls = getApiUrls();

  const mutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const res = await axios.post(apiUrls.register, data, {
        withCredentials: true,
      });
      return res.data;
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || "Registration failed");
      setSuccess("");
    },
    onSuccess: () => {
      setError("");
      setSuccess("Registration successful! You can now sign in.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    mutation.mutate(form);
  };

  return (
    <div className="auth-bg relative overflow-hidden">
      <NeonBackground />
      <div className="auth-card relative z-10 animate-fadeInUp">
        <h2 className="auth-title">Sign up</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="relative w-full">
            <input
              className="auth-input pr-10 focus:shadow-[0_0_8px_2px_#6feaff55]"
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
            <span className="auth-input-icon text-cyan-300">
              <FiUser size={18} />
            </span>
          </div>
          <div className="relative w-full">
            <input
              className="auth-input pr-10 focus:shadow-[0_0_8px_2px_#6feaff55]"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <span className="auth-input-icon text-cyan-300">
              <FiMail size={18} />
            </span>
          </div>
          <div className="relative w-full">
            <input
              className="auth-input pr-10 focus:shadow-[0_0_8px_2px_#a18aff55]"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
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
                Create account
              </>
            )}
          </button>
        </form>
        {error && (
          <div className="auth-link" style={{ color: "#ff6b81" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="auth-link" style={{ color: "#4ade80" }}>
            {success}
          </div>
        )}
        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
