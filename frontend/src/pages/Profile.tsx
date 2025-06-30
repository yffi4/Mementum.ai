import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

interface User {
  id: number;
  username: string;
  email: string;
  google_name?: string;
  google_picture?: string;
  google_connected: boolean;
  created_at: string;
}

interface UserStats {
  total_notes: number;
  categories: Array<{ name: string; count: number }>;
  recent_activity: Array<{ action: string; date: string; note_title?: string }>;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Получаем данные пользователя
      const authResponse = await fetch("http://localhost:8000/auth/status", {
        credentials: "include",
      });

      if (!authResponse.ok) {
        throw new Error("Не авторизован");
      }

      const authData = await authResponse.json();
      setUser(authData.user);
      // Получаем статистику заметок
      const notesResponse = await fetch("http://localhost:8000/notes/count", {
        credentials: "include",
      });

      const categoriesResponse = await fetch(
        "http://localhost:8000/notes/categories",
        {
          credentials: "include",
        }
      );

      if (notesResponse.ok && categoriesResponse.ok) {
        const notesData = await notesResponse.json();
        const categoriesData = await categoriesResponse.json();

        setStats({
          total_notes: notesData.count,
          categories: categoriesData.categories,
          recent_activity: [
            {
              action: "Создание заметки",
              date: "2024-06-26",
              note_title: "Новая заметка",
            },
            { action: "Обновление профиля", date: "2024-06-25" },
          ],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  const handleGoogleDisconnect = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/auth/google/disconnect",
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        await fetchUserData(); // Обновить данные
      }
    } catch (err) {
      console.error("Ошибка отключения Google:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <motion.div
          className="text-neon-green text-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Загрузка профиля...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar user={user} />

      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue mb-4">
              Профиль
            </h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* User Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-neon-green/20 p-8 glow-green-sm"
            >
              <h2 className="text-2xl font-bold text-neon-green mb-6">
                Информация
              </h2>

              <div className="flex items-center space-x-4 mb-6">
                {user?.google_picture ? (
                  <img
                    src={user.google_picture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-2 border-neon-green/50 glow-green-sm object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-green to-neon-blue flex items-center justify-center text-gray-900 text-2xl font-bold glow-green-sm">
                    {user?.username?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "👤"}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {user?.google_name || user?.username || "Пользователь"}
                  </h3>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Имя пользователя:</span>
                  <span className="text-white">{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Дата регистрации:</span>
                  <span className="text-white">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("ru-RU")
                      : "Не указано"}
                  </span>
                </div>
              </div>

              {/* Google Integration */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-lg font-semibold text-neon-green mb-4">
                  Интеграции
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔗</span>
                    <div>
                      <p className="text-white font-medium">Google Account</p>
                      <p className="text-sm text-gray-400">
                        {user?.google_connected ? "Подключен" : "Не подключен"}
                      </p>
                    </div>
                  </div>
                  {user?.google_connected ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGoogleDisconnect}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all duration-300"
                    >
                      Отключить
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGoogleConnect}
                      className="px-4 py-2 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30 transition-all duration-300 glow-green-sm"
                    >
                      Подключить
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Statistics Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-neon-blue/20 p-8 glow-blue-sm"
            >
              <h2 className="text-2xl font-bold text-neon-blue mb-6">
                Статистика
              </h2>

              <div className="space-y-6">
                <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                  <div className="text-3xl font-bold text-neon-green">
                    {stats?.total_notes || 0}
                  </div>
                  <div className="text-gray-400">Всего заметок</div>
                </div>

                {stats?.categories && stats.categories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Категории заметок
                    </h3>
                    <div className="space-y-2">
                      {stats.categories.slice(0, 5).map((category, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-700/30 rounded"
                        >
                          <span className="text-gray-300">{category.name}</span>
                          <span className="text-neon-green font-semibold">
                            {category.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Последняя активность
                  </h3>
                  <div className="space-y-2">
                    {stats?.recent_activity?.map((activity, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-700/30 rounded"
                      >
                        <div>
                          <div className="text-gray-300">{activity.action}</div>
                          {activity.note_title && (
                            <div className="text-sm text-gray-500">
                              {activity.note_title}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">
                          {activity.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
