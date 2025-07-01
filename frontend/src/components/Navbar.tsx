"use client"

import type React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiEdit3, FiPlus, FiCalendar, FiLogOut, FiMenu, FiX } from "react-icons/fi"
import { useState } from "react"

interface NavbarProps {
  user?: {
    username?: string
    email?: string
    google_picture?: string
  }
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: "/notes", label: "Notes", icon: <FiEdit3 size={18} /> },
    { path: "/notes/create", label: "Create", icon: <FiPlus size={18} /> },
    { path: "/calendar", label: "Calendar", icon: <FiCalendar size={18} /> },
  ]

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    navigate("/")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background: "linear-gradient(135deg, rgba(11, 12, 42, 0.95) 0%, rgba(24, 27, 58, 0.95) 100%)",
          borderBottomColor: "rgba(111, 234, 255, 0.2)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(111, 234, 255, 0.1)",
        }}
      >
        {/* Subtle background effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(161, 138, 255, 0.1) 50%, transparent 100%)",
            animation: "shimmer 4s infinite ease-in-out",
          }}
        />

        {/* Full-width container for perfect centering */}
        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center h-16 relative">
            {/* Left Section - Logo */}
            <div className="flex-1 flex justify-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
                <Link
                  to="/"
                  className="text-xl sm:text-2xl font-bold relative z-10"
                  style={{
                    background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 8px rgba(161, 138, 255, 0.3))",
                  }}
                >
                  Mementum.ai
                </Link>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#a18aff]/20 to-[#6feaff]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
              </motion.div>
            </div>

            {/* Center Section - Navigation (Perfect Center) */}
            {user && (
              <div className="flex-1 flex justify-center hidden lg:flex">
                <div className="flex items-center space-x-2">
                  {navItems.map((item, index) => {
                    const isActive =
                      location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/")

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
                          className={`relative group flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-500 overflow-hidden ${
                            isActive ? "text-white shadow-2xl" : "text-[#b8f2ff]/80 hover:text-white"
                          }`}
                          style={{
                            background: isActive
                              ? "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)"
                              : "rgba(255, 255, 255, 0.05)",
                            backdropFilter: "blur(10px)",
                            border: isActive
                              ? "1px solid rgba(255, 255, 255, 0.2)"
                              : "1px solid rgba(111, 234, 255, 0.1)",
                            boxShadow: isActive
                              ? "0 8px 32px rgba(161, 138, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
                              : "0 4px 16px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          {/* Animated background on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#a18aff]/20 to-[#6feaff]/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />

                          {/* Ripple effect */}
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                          </div>

                          {/* Icon with rotation animation */}
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="relative z-10"
                          >
                            {item.icon}
                          </motion.div>

                          {/* Text with slide effect */}
                          <span className="relative z-10 whitespace-nowrap">{item.label}</span>

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
                    )
                  })}
                </div>
              </div>
            )}

            {/* Right Section - User Actions */}
            <div className="flex-1 flex justify-end">
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* Enhanced User Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="relative group cursor-pointer"
                    >
                      <div className="relative">
                        {/* Animated ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#a18aff] to-[#6feaff] p-0.5 animate-spin-slow">
                          <div className="w-full h-full rounded-full bg-[#0b0c2a]" />
                        </div>

                        {/* Avatar */}
                        <div className="relative z-10">
                          {user.google_picture ? (
                            <img
                              src={user.google_picture || "/placeholder.svg"}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover transition-all duration-300"
                              style={{
                                boxShadow: "0 0 20px rgba(111, 234, 255, 0.4)",
                              }}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300"
                              style={{
                                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                                boxShadow: "0 0 20px rgba(111, 234, 255, 0.4)",
                              }}
                            >
                              {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>

                        {/* Pulse effect */}
                        <div className="absolute inset-0 rounded-full bg-[#6feaff]/30 animate-ping opacity-20" />

                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#a18aff]/40 to-[#6feaff]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
                      </div>

                      {/* Enhanced Tooltip */}
                      <div
                        className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50"
                        style={{ transitionDelay: "0.2s" }}
                      >
                        <div
                          className="bg-gray-900/95 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap backdrop-blur-sm relative"
                          style={{
                            border: "1px solid rgba(111, 234, 255, 0.3)",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(111, 234, 255, 0.1) inset",
                          }}
                        >
                          {user.username || user.email}
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900/95 border-l border-t border-[#6feaff]/30 rotate-45" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced Logout Button */}
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="relative group px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#fca5a5",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 16px rgba(239, 68, 68, 0.1)",
                      }}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Ripple effect */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-red-400/10 to-transparent animate-pulse" />
                      </div>

                      <div className="relative z-10 flex items-center gap-2">
                        <motion.div whileHover={{ rotate: 180, scale: 1.1 }} transition={{ duration: 0.3 }}>
                          <FiLogOut size={14} />
                        </motion.div>
                        <span className="hidden md:inline">Logout</span>
                      </div>
                    </motion.button>

                    {/* Enhanced Mobile Menu Button */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleMobileMenu}
                      className="lg:hidden relative group p-3 rounded-xl transition-all duration-300 overflow-hidden"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(111, 234, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#a18aff]/20 to-[#6feaff]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <motion.div
                        animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 text-[#b8f2ff] group-hover:text-white transition-colors duration-300"
                      >
                        {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                      </motion.div>
                    </motion.button>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    {/* Enhanced Sign In Button */}
                    <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/login"
                        className="relative group px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 overflow-hidden"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(111, 234, 255, 0.2)",
                          color: "#b8f2ff",
                          backdropFilter: "blur(10px)",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#6feaff]/10 to-[#a18aff]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                        </div>

                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                          Sign In
                        </span>
                      </Link>
                    </motion.div>

                    {/* Enhanced Get Started Button */}
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/register"
                        className="relative group px-6 py-2.5 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300"
                        style={{
                          background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                          boxShadow: "0 8px 32px rgba(161, 138, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
                        }}
                      >
                        {/* Animated overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#6feaff] to-[#a18aff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine" />
                        </div>

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
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(161, 138, 255, 0.1) 0%, transparent 50%)",
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
              background: "linear-gradient(135deg, rgba(11, 12, 42, 0.98) 0%, rgba(24, 27, 58, 0.98) 100%)",
              borderBottom: "1px solid rgba(111, 234, 255, 0.2)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(111, 234, 255, 0.1) inset",
            }}
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== "/")

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
                      className={`relative group flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-300 font-semibold overflow-hidden ${
                        isActive ? "text-white shadow-lg" : "text-[#b8f2ff]/90 hover:text-white"
                      }`}
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)"
                          : "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        border: isActive ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(111, 234, 255, 0.1)",
                        boxShadow: isActive ? "0 8px 32px rgba(161, 138, 255, 0.4)" : "0 4px 16px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#a18aff]/20 to-[#6feaff]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
                )
              })}

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
                        background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                      }}
                    >
                      {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-[#b8f2ff]/90 font-medium">{user.username || user.email}</span>
                </motion.div>

                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  onClick={() => {
                    handleLogout()
                    toggleMobileMenu()
                  }}
                  className="relative group flex items-center space-x-3 px-4 py-4 rounded-xl font-semibold w-full transition-all duration-300 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }} className="relative z-10">
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
  )
}

export default Navbar
