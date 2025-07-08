import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiEdit3,
  FiZap,
  FiTag,
  FiLayers,
  FiTarget,
  FiGlobe,
} from "react-icons/fi";

interface DemoNote {
  id: string;
  title: string;
  content: string;
  category: string;
  importance: number;
  tags: string[];
  summary: string;
  demoType: "ai" | "categories" | "importance" | "connections";
}

const demoNotes: DemoNote[] = [
  {
    id: "demo-1",
    title: "Изучение React Hooks",
    content:
      "useState, useEffect, useCallback - основные хуки для работы с состоянием и побочными эффектами...",
    category: "Обучение",
    importance: 8,
    tags: ["react", "javascript", "frontend"],
    summary: "Заметка о ключевых React хуках и их применении в разработке",
    demoType: "ai",
  },
  {
    id: "demo-2",
    title: "Идея для стартапа",
    content:
      "AI-ассистент для планирования путешествий с учетом погоды и местных событий...",
    category: "Идея",
    importance: 9,
    tags: ["стартап", "ai", "путешествия"],
    summary: "Концепция умного помощника для туристов",
    demoType: "importance",
  },
  {
    id: "demo-3",
    title: "Финансовый план на 2024",
    content:
      "Цели: накопить 500к, инвестировать в ETF, снизить расходы на 20%...",
    category: "Финансы",
    importance: 7,
    tags: ["финансы", "планирование", "2024"],
    summary: "Личные финансовые цели и стратегия их достижения",
    demoType: "categories",
  },
];

const features = [
  {
    icon: FiZap,
    title: "AI Обработка",
    description:
      "Искусственный интеллект автоматически структурирует ваши мысли, создает резюме и предлагает теги",
    color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
  },
  {
    icon: FiLayers,
    title: "Умные Категории",
    description:
      "Автоматическая категоризация заметок: Обучение, Проекты, Идеи, Работа и другие",
    color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  },
  {
    icon: FiTarget,
    title: "Система Важности",
    description:
      "Оценивайте важность заметок от 1 до 10 для эффективной приоритизации",
    color: "text-orange-400 bg-orange-500/20 border-orange-500/30",
  },
  {
    icon: FiGlobe,
    title: "Связи и Контекст",
    description:
      "Система находит связи между заметками и создает контекстную сеть знаний",
    color: "text-green-400 bg-green-500/20 border-green-500/30",
  },
];

export default function NotesOnboarding() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      Обучение: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      Проект: "text-green-400 bg-green-500/20 border-green-500/30",
      Идея: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      Работа: "text-orange-400 bg-orange-500/20 border-orange-500/30",
      Финансы: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    };
    return (
      colors[category as keyof typeof colors] ||
      "text-gray-400 bg-gray-500/20 border-gray-500/30"
    );
  };

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return { text: "Критическая", color: "text-red-400", icon: "🔥" };
    if (importance >= 6)
      return { text: "Высокая", color: "text-orange-400", icon: "⚡" };
    if (importance >= 4)
      return { text: "Средняя", color: "text-yellow-400", icon: "📝" };
    return { text: "Низкая", color: "text-green-400", icon: "📋" };
  };

  return (
    <div className="onboarding max-w-6xl mx-auto px-4 py-16">
      {/* Главный заголовок */}
      <div className="text-center mb-16 animate-fadeInUp">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-6">
            <FiEdit3 size={32} className="text-purple-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
          Ваша первая заметка — начало большого пути
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Превратите хаос мыслей в структурированную систему знаний с помощью AI
        </p>

        <Link
          to="/notes/create"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <FiEdit3 className="mr-2" size={20} />
          Создать первую заметку
        </Link>
      </div>

      {/* Возможности системы */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Что делает ваши заметки особенными?
          </h2>
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showAllFeatures ? "Скрыть подробности" : "Узнать больше"}
          </button>
        </div>

        <div
          className={`grid gap-6 transition-all duration-500 ${
            showAllFeatures ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2"
          }`}
        >
          {features.slice(0, showAllFeatures ? 4 : 2).map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${feature.color} animate-fadeInUp`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon size={24} className="mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm opacity-80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Демо заметки */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Попробуйте интерактивные примеры
          </h2>
          <p className="text-gray-400">
            Наведите курсор на карточки, чтобы увидеть возможности
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demoNotes.map((note, index) => (
            <div
              key={note.id}
              className={`group relative p-6 rounded-xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-gray-800/50 cursor-pointer animate-fadeInUp`}
              style={{ animationDelay: `${index * 0.15}s` }}
              onMouseEnter={() => setActiveDemo(note.id)}
              onMouseLeave={() => setActiveDemo(null)}
            >
              {/* Заголовок и важность */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors flex-1 mr-2">
                  {note.title}
                </h3>
                <div className="importance-indicator">
                  <span
                    className={`importance-badge ${
                      getImportanceLevel(note.importance).color
                    }`}
                  >
                    <span className="mr-1">
                      {getImportanceLevel(note.importance).icon}
                    </span>
                    {note.importance}/10
                  </span>
                </div>
              </div>

              {/* Категория и дата */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`category-badge ${getCategoryColor(
                    note.category
                  )}`}
                >
                  <FiTag className="inline mr-1" size={10} />
                  {note.category}
                </span>
                <span className="text-xs text-gray-500">Только что</span>
              </div>

              {/* Превью контента */}
              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Резюме от AI:</div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {note.summary}
                </p>
              </div>

              {/* Теги */}
              <div className="flex flex-wrap gap-2 mb-4">
                {note.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Индикатор фичи */}
              {activeDemo === note.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30 animate-pulse">
                  <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                    {note.demoType === "ai" && "🤖 AI"}
                    {note.demoType === "categories" && "📁 Категории"}
                    {note.demoType === "importance" && "⭐ Важность"}
                    {note.demoType === "connections" && "🔗 Связи"}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-2xl p-12 border border-purple-500/20">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Готовы начать свое путешествие знаний?
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Создайте свою первую заметку и посмотрите, как AI превратит ваши мысли
          в структурированную систему знаний
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/notes/create"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FiEdit3 className="mr-2" size={20} />
            Создать заметку
          </Link>

          <div className="text-sm text-gray-400">
            или просто начните печатать свои мысли
          </div>
        </div>
      </div>
    </div>
  );
}
