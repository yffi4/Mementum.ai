import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CodeDemoComponent from "../components/CodeDemoComponent";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import NeonBackground from "../components/NeonBackground";
import axios from "axios";

const CodeDemoPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8000/auth/status", {
          withCredentials: true,
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="page-bg relative overflow-hidden">
      <NeonBackground />
      <Navbar user={user} />
      <div className="pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 p-4"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neon-green">
                🎨 Демонстрация форматирования кода
              </h1>
              <p className="text-gray-400 mt-1">
                Красивая подсветка синтаксиса для любых языков программирования
              </p>
            </div>
            <Link
              to="/notes"
              className="bg-neon-blue hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
            >
              ← Назад к заметкам
            </Link>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6"
        >
          <CodeDemoComponent />
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 max-w-4xl mx-auto"
        >
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-neon-green mb-4">
              ✨ Как использовать:
            </h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-neon-blue font-mono">```</span>
                <span>
                  Для блока кода начните с трех обратных кавычек и укажите язык
                  программирования
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-neon-green font-mono">`</span>
                <span>
                  Для инлайн кода используйте одинарные обратные кавычки
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400">💡</span>
                <span>
                  Поддерживаются все популярные языки: Python, JavaScript,
                  TypeScript, Java, C++, Go, Rust, PHP, Ruby и многие другие!
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CodeDemoPage;
