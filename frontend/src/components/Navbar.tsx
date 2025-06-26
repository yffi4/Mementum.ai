import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

  const navItems = [
    { path: "/notes", label: "Заметки", icon: "📝" },
    { path: "/notes/create", label: "Создать", icon: "➕" },
  ];

  const handleLogout = () => {
    // Удаляем токен и перенаправляем на главную
    localStorage.removeItem("access_token");
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/");
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-neon-green/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent"
            >
              Memetum.ai
            </Link>
          </motion.div>

          {/* Navigation Items */}
          {user && (
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      location.pathname === item.path
                        ? "bg-neon-green/20 text-neon-green border border-neon-green/30 glow-green"
                        : "text-gray-300 hover:text-neon-green hover:bg-neon-green/10"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Profile Picture/Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative group"
                >
                  <Link to="/profile">
                    {user.google_picture ? (
                      <img
                        src={user.google_picture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-neon-green/50 glow-green-sm object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-green to-neon-blue flex items-center justify-center text-gray-900 font-bold glow-green-sm">
                        {user.username?.[0]?.toUpperCase() ||
                          user.email?.[0]?.toUpperCase() ||
                          "👤"}
                      </div>
                    )}
                  </Link>

                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {user.username || user.email}
                  </div>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 font-medium"
                >
                  Выйти
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-neon-green transition-colors duration-300 font-medium"
                  >
                    Войти
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all duration-300 font-medium glow-green-sm"
                  >
                    Регистрация
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="md:hidden flex items-center justify-center space-x-6 pb-4">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? "text-neon-green glow-green"
                      : "text-gray-400 hover:text-neon-green"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
