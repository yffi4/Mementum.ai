"use client"

import type React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { FiEdit3, FiPlus, FiCalendar, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi"
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
    { path: "/profile", label: "Profile", icon: <FiUser size={18} /> },
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
        className="fixed top-0 left-0 right-0 z-50 bg-[#0b0c2a]/95 backdrop-blur-xl border-b border-cyan-300/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          boxShadow: "0 0 0 1px rgba(111, 234, 255, 0.1), 0 8px 32px rgba(11, 12, 42, 0.8)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-[#a18aff] to-[#6feaff] bg-clip-text text-transparent"
                style={{ letterSpacing: "-0.02em" }}
              >
                Mementum.ai
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <motion.div key={item.path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                        location.pathname === item.path
                          ? "bg-[#a18aff]/20 text-[#a18aff] border border-[#a18aff]/40"
                          : location.pathname.startsWith(item.path) && item.path !== "/"
                            ? "bg-[#a18aff]/10 text-[#a18aff]/80 border border-[#a18aff]/20"
                            : "text-[#b8f2ff]/80 hover:text-[#6feaff] hover:bg-[#6feaff]/10 border border-transparent hover:border-[#6feaff]/30"
                      }`}
                      style={
                        location.pathname === item.path
                          ? { boxShadow: "0 0 0 2px rgba(161, 138, 255, 0.2), 0 0 16px rgba(161, 138, 255, 0.3)" }
                          : {}
                      }
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Profile Section */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative group">
                      <Link to="/profile">
                        {user.google_picture ? (
                          <img
                            src={user.google_picture || "/placeholder.svg"}
                            alt="Profile"
                            className="w-9 h-9 rounded-full border-2 border-[#6feaff]/50 object-cover"
                            style={{ boxShadow: "0 0 12px rgba(111, 234, 255, 0.4)" }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#a18aff] to-[#6feaff] flex items-center justify-center text-[#181b3a] font-bold text-sm"
                            style={{ boxShadow: "0 0 12px rgba(111, 234, 255, 0.4)" }}
                          >
                            {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                      </Link>

                      {/* Tooltip */}
                      <div
                        className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-[#181b3a] text-[#b8f2ff] text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-[#6feaff]/20 pointer-events-none"
                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)" }}
                      >
                        {user.username || user.email}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#181b3a] border-l border-t border-[#6feaff]/20 rotate-45"></div>
                      </div>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      className="px-3 py-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:text-red-300 transition-all duration-300 font-medium flex items-center gap-2 text-sm"
                    >
                      <FiLogOut size={14} />
                      <span className="hidden md:inline">Logout</span>
                    </motion.button>
                  </div>

                  {/* Mobile Menu Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMobileMenu}
                    className="lg:hidden p-2 rounded-lg text-[#b8f2ff] hover:text-[#6feaff] hover:bg-[#6feaff]/10 transition-all duration-300"
                  >
                    {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                  </motion.button>
                </>
              ) : (
                <div className="flex items-center space-x-6">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-lg text-[#b8f2ff] hover:text-[#6feaff] transition-colors duration-300 font-medium border border-transparent hover:border-[#6feaff]/20 hover:bg-[#6feaff]/5"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#a18aff] to-[#6feaff] text-[#181b3a] hover:from-[#6feaff] hover:to-[#a18aff] transition-all duration-300 font-bold text-sm"
                      style={{ boxShadow: "0 2px 16px rgba(161, 138, 255, 0.3)" }}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      {user && isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleMobileMenu} />

          {/* Mobile Menu */}
          <motion.div
            className="absolute top-16 left-0 right-0 bg-[#0b0c2a]/98 backdrop-blur-xl border-b border-cyan-300/20 shadow-2xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ boxShadow: "0 8px 32px rgba(11, 12, 42, 0.9)" }}
          >
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      location.pathname === item.path
                        ? "bg-[#a18aff]/20 text-[#a18aff] border border-[#a18aff]/40"
                        : location.pathname.startsWith(item.path) && item.path !== "/"
                          ? "bg-[#a18aff]/10 text-[#a18aff]/80 border border-[#a18aff]/20"
                          : "text-[#b8f2ff]/80 hover:text-[#6feaff] hover:bg-[#6feaff]/10 border border-transparent"
                    }`}
                    style={location.pathname === item.path ? { boxShadow: "0 0 0 2px rgba(161, 138, 255, 0.2)" } : {}}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Profile & Logout */}
              <div className="pt-4 border-t border-cyan-300/20 space-y-3">
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <Link
                    to="/profile"
                    onClick={toggleMobileMenu}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-[#b8f2ff]/80 hover:text-[#6feaff] hover:bg-[#6feaff]/10 transition-all duration-300"
                  >
                    {user.google_picture ? (
                      <img
                        src={user.google_picture || "/placeholder.svg"}
                        alt="Profile"
                        className="w-6 h-6 rounded-full border border-[#6feaff]/50 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#a18aff] to-[#6feaff] flex items-center justify-center text-[#181b3a] font-bold text-xs">
                        {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="font-medium">{user.username || user.email}</span>
                  </Link>
                </motion.div>

                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    handleLogout()
                    toggleMobileMenu()
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:text-red-300 transition-all duration-300 font-medium w-full"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default Navbar
