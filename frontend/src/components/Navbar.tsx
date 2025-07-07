"use client";

import type React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiEdit3,
  FiPlus,
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiX,
  FiZap,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { getApiUrls } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Navbar.css";

interface NavbarProps {
  user?: {
    username?: string;
    email?: string;
    google_picture?: string;
  };
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { logout } = useAuth();

  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { path: "/notes", label: "Notes", icon: <FiEdit3 size={18} /> },
    { path: "/notes/create", label: "Create", icon: <FiPlus size={18} /> },
    { path: "/calendar", label: "Calendar", icon: <FiCalendar size={18} /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleAnalyzeNotes = async () => {
    if (isAnalyzing) return;
    try {
      setIsAnalyzing(true);
      const apiUrls = getApiUrls();
      await axios.post(apiUrls.notesAnalyzeAll, {}, { withCredentials: true });
      // После анализа перезагружаем страницу, чтобы подтянуть обновленные данные
      window.location.reload();
    } catch (err) {
      console.error("Ошибка анализа заметок", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <motion.nav
        className="navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Subtle background effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(161, 138, 255, 0.1) 50%, transparent 100%)",
            animation: "shimmer 4s infinite ease-in-out",
          }}
        />

        {/* Full-width container for perfect centering */}
        <div className="navbar-container">
          <div className="navbar-inner h-16">
            {/* Left Section - Logo */}
            <div className="logo-wrapper flex justify-start">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <Link to="/" className="nav-logo">
                  Mementum.ai
                </Link>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#a18aff]/20 to-[#6feaff]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              </motion.div>
            </div>

            {/* Center Section - Navigation (Perfect Center) */}
            {user && (
              <div className="nav-items hidden lg:flex">
                {navItems.map((item, index) => {
                  const isActive =
                    location.pathname === item.path ||
                    (location.pathname.startsWith(item.path) &&
                      item.path !== "/");

                  return (
                    <motion.div
                      key={item.path}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <Link
                        to={item.path}
                        className={`nav-btn ${isActive ? "active" : ""}`}
                      >
                        {/* Icon with rotation animation */}
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="relative z-10"
                        >
                          {item.icon}
                        </motion.div>

                        {/* Text with slide effect */}
                        <span className="relative z-10 whitespace-nowrap">
                          {item.label}
                        </span>

                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-1/2 w-1/2 h-0.5 bg-white/60 rounded-full"
                            initial={{ width: 0, x: "-50%" }}
                            animate={{ width: "50%", x: "-50%" }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Analyze Button */}
                <motion.div
                  whileHover={{
                    scale: isAnalyzing ? 1 : 1.05,
                    y: isAnalyzing ? 0 : -2,
                  }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.5 }}
                >
                  <button
                    onClick={handleAnalyzeNotes}
                    disabled={isAnalyzing}
                    className={`nav-btn analyze-btn ${
                      isAnalyzing ? "disabled" : ""
                    }`}
                  >
                    {isAnalyzing ? (
                      <svg
                        className="animate-spin relative z-10"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="relative z-10"
                      >
                        <FiZap size={18} />
                      </motion.div>
                    )}
                    <span className="relative z-10 whitespace-nowrap">
                      {isAnalyzing ? "Analyzing..." : "Analyze"}
                    </span>
                  </button>
                </motion.div>
              </div>
            )}

            {/* Right Section - User Actions */}
            <div className="right-section flex items-center justify-end">
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* Avatar profile block */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative cursor-pointer hidden lg:block"
                      onClick={() => setProfileOpen((p) => !p)}
                      ref={profileRef}
                    >
                      {user.google_picture ? (
                        <img
                          src={user.google_picture}
                          alt="Profile"
                          className="nav-avatar"
                        />
                      ) : (
                        <div
                          className="nav-avatar flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            background:
                              "linear-gradient(135deg,#a18aff 0%,#6feaff 100%)",
                          }}
                        >
                          {user.username?.[0]?.toUpperCase() ||
                            user.email?.[0]?.toUpperCase() ||
                            "U"}
                        </div>
                      )}

                      {profileOpen && (
                        <div className="profile-menu">
                          <button
                            className="profile-menu-item"
                            onClick={handleLogout}
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </motion.div>

                    {/* Mobile Menu Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMobileMenu}
                      className="lg:hidden nav-btn mobile-btn"
                    >
                      <motion.div
                        animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 text-[#b8f2ff] group-hover:text-white transition-colors duration-300"
                      >
                        {isMobileMenuOpen ? (
                          <FiX size={20} />
                        ) : (
                          <FiMenu size={20} />
                        )}
                      </motion.div>
                    </motion.button>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    {/* Enhanced Sign In Button */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/login" className="nav-btn">
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                          Sign In
                        </span>
                      </Link>
                    </motion.div>

                    {/* Enhanced Get Started Button */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link to="/register" className="nav-btn">
                        <span className="relative z-10">Get Started</span>
                      </Link>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Mobile Menu */}
      {user && isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Enhanced Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(161, 138, 255, 0.1) 0%, transparent 50%)",
            }}
            onClick={toggleMobileMenu}
          />

          {/* Enhanced Mobile Menu */}
          <motion.div
            className="absolute top-16 left-0 right-0 backdrop-blur-xl shadow-2xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background:
                "linear-gradient(135deg, rgba(11, 12, 42, 0.98) 0%, rgba(24, 27, 58, 0.98) 100%)",
              borderBottom: "1px solid rgba(111, 234, 255, 0.2)",
              boxShadow:
                "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(111, 234, 255, 0.1) inset",
            }}
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path ||
                  (location.pathname.startsWith(item.path) &&
                    item.path !== "/");

                return (
                  <motion.div
                    key={item.path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={item.path}
                      onClick={toggleMobileMenu}
                      className={`nav-btn ${isActive ? "active" : ""}`}
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                      >
                        {item.icon}
                      </motion.div>
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Analyze button in mobile menu */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
              >
                <button
                  onClick={() => {
                    handleAnalyzeNotes();
                    toggleMobileMenu();
                  }}
                  disabled={isAnalyzing}
                  className={`nav-btn analyze-btn ${
                    isAnalyzing ? "disabled" : ""
                  }`}
                >
                  {isAnalyzing ? (
                    <svg
                      className="animate-spin relative z-10"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="relative z-10"
                    >
                      <FiZap size={18} />
                    </motion.div>
                  )}
                  <span className="relative z-10">
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </span>
                </button>
              </motion.div>

              {/* Enhanced Mobile User Section */}
              <div className="pt-4 border-t border-[#6feaff]/20 space-y-3">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="flex items-center space-x-3 px-4 py-4 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(111, 234, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {user.google_picture ? (
                    <img
                      src={user.google_picture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-[#6feaff]/50 object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-[#6feaff]/50"
                      style={{
                        background:
                          "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                      }}
                    >
                      {user.username?.[0]?.toUpperCase() ||
                        user.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                  <span className="text-[#b8f2ff]/90 font-medium">
                    {user.username || user.email}
                  </span>
                </motion.div>

                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="nav-btn logout-btn"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                    <FiLogOut size={18} />
                  </motion.div>
                  <span className="relative z-10">Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Enhanced CSS animations */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-shine {
          animation: shine 2s infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;
