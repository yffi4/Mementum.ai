"use client";

import type React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiEdit3,
  FiPlus,
  FiCalendar,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState } from "react";

interface NavbarProps {
  user?: {
    username?: string;
    email?: string;
    google_picture?: string;
  };
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/notes", label: "Notes", icon: <FiEdit3 size={18} /> },
    { path: "/notes/create", label: "Create", icon: <FiPlus size={18} /> },
    { path: "/calendar", label: "Calendar", icon: <FiCalendar size={18} /> },
    { path: "/profile", label: "Profile", icon: <FiUser size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background:
            "linear-gradient(135deg, rgba(11, 12, 42, 0.95) 0%, rgba(24, 27, 58, 0.95) 100%)",
          borderBottomColor: "rgba(111, 234, 255, 0.2)",
          boxShadow:
            "0 4px 20px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(111, 234, 255, 0.1)",
        }}
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

        {/* Compact main container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16">
            {/* Compact Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link
                to="/"
                className="text-xl sm:text-2xl font-bold relative z-10"
                style={{
                  background:
                    "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 8px rgba(161, 138, 255, 0.3))",
                }}
              >
                Mementum.ai
              </Link>
            </motion.div>

            {/* Compact Desktop Navigation */}
            {user && (
              <div className="hidden lg:flex items-center space-x-2">
                {navItems.map((item) => (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                        location.pathname === item.path
                          ? "text-white shadow-lg"
                          : location.pathname.startsWith(item.path) &&
                            item.path !== "/"
                          ? "text-[#a18aff] bg-[#a18aff]/10 border border-[#a18aff]/20"
                          : "text-[#b8f2ff]/90 hover:text-white hover:bg-white/10"
                      }`}
                      style={
                        location.pathname === item.path
                          ? {
                              background:
                                "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                              boxShadow: "0 4px 15px rgba(161, 138, 255, 0.4)",
                            }
                          : {}
                      }
                    >
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.icon}
                      </motion.div>
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Compact Right Section */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Compact Profile Section */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative group"
                    >
                      <Link to="/profile">
                        {user.google_picture ? (
                          <img
                            src={user.google_picture || "/placeholder.svg"}
                            alt="Profile"
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#6feaff]/50 hover:ring-[#a18aff]/70 transition-all duration-300"
                            style={{
                              boxShadow: "0 0 15px rgba(111, 234, 255, 0.3)",
                            }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-[#6feaff]/50 hover:ring-[#a18aff]/70 transition-all duration-300"
                            style={{
                              background:
                                "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                              boxShadow: "0 0 15px rgba(111, 234, 255, 0.3)",
                            }}
                          >
                            {user.username?.[0]?.toUpperCase() ||
                              user.email?.[0]?.toUpperCase() ||
                              "U"}
                          </div>
                        )}
                        {/* Subtle pulse effect */}
                        <div className="absolute inset-0 rounded-full bg-[#6feaff]/20 animate-ping opacity-50" />
                      </Link>

                      {/* Compact Tooltip */}
                      <div
                        className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm pointer-events-none z-50"
                        style={{
                          border: "1px solid rgba(111, 234, 255, 0.3)",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                        }}
                      >
                        {user.username || user.email}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/95 border-l border-t border-[#6feaff]/30 rotate-45" />
                      </div>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition-all duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.15) 100%)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#fca5a5",
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiLogOut size={14} />
                      </motion.div>
                      <span className="hidden md:inline">Logout</span>
                    </motion.button>
                  </div>

                  {/* Compact Mobile Menu Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 rounded-lg text-[#b8f2ff] hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
                    <motion.div
                      animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
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
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-lg text-[#b8f2ff] hover:text-white transition-all duration-300 font-medium border border-transparent hover:border-[#6feaff]/20 hover:bg-[#6feaff]/10"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="px-5 py-2 rounded-lg font-bold text-sm text-white relative overflow-hidden group"
                      style={{
                        background:
                          "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                        boxShadow: "0 4px 15px rgba(161, 138, 255, 0.3)",
                      }}
                    >
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6feaff] to-[#a18aff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Compact Mobile Menu */}
      {user && isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            onClick={toggleMobileMenu}
          />

          {/* Mobile Menu */}
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
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                      location.pathname === item.path
                        ? "text-white shadow-lg"
                        : location.pathname.startsWith(item.path) &&
                          item.path !== "/"
                        ? "bg-[#a18aff]/10 text-[#a18aff] border border-[#a18aff]/20"
                        : "text-[#b8f2ff]/90 hover:text-white hover:bg-white/10"
                    }`}
                    style={
                      location.pathname === item.path
                        ? {
                            background:
                              "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                          }
                        : {}
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Profile & Logout */}
              <div className="pt-4 border-t border-[#6feaff]/20 space-y-2">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Link
                    to="/profile"
                    onClick={toggleMobileMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-[#b8f2ff]/90 hover:text-white hover:bg-white/10 transition-all duration-300 font-medium"
                  >
                    {user.google_picture ? (
                      <img
                        src={user.google_picture || "/placeholder.svg"}
                        alt="Profile"
                        className="w-6 h-6 rounded-full border border-[#6feaff]/50 object-cover"
                      />
                    ) : (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
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
                    <span>{user.username || user.email}</span>
                  </Link>
                </motion.div>

                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium w-full transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.15) 100%)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#fca5a5",
                  }}
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
