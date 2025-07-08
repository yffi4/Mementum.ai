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
    title: "Learning React Hooks",
    content:
      "useState, useEffect, useCallback - essential hooks for state management and side effects...",
    category: "Learning",
    importance: 8,
    tags: ["react", "javascript", "frontend"],
    summary: "Note about key React hooks and their application in development",
    demoType: "ai",
  },
  {
    id: "demo-2",
    title: "Startup Idea",
    content:
      "AI-powered travel planning assistant considering weather and local events...",
    category: "Ideas",
    importance: 9,
    tags: ["startup", "ai", "travel"],
    summary: "Concept for a smart travel assistant for tourists",
    demoType: "importance",
  },
  {
    id: "demo-3",
    title: "Financial Plan 2024",
    content: "Goals: save 500k, invest in ETFs, reduce expenses by 20%...",
    category: "Finance",
    importance: 7,
    tags: ["finance", "planning", "2024"],
    summary: "Personal financial goals and strategy for achievement",
    demoType: "categories",
  },
];

const features = [
  {
    icon: FiZap,
    title: "AI Processing",
    description:
      "Artificial intelligence automatically structures your thoughts, creates summaries and suggests tags",
    color: "text-purple-400 bg-purple-500/20 border-purple-500/30",
  },
  {
    icon: FiLayers,
    title: "Smart Categories",
    description:
      "Automatic note categorization: Learning, Projects, Ideas, Work and more",
    color: "text-blue-400 bg-blue-500/20 border-blue-500/30",
  },
  {
    icon: FiTarget,
    title: "Importance System",
    description:
      "Rate note importance from 1 to 10 for effective prioritization",
    color: "text-orange-400 bg-orange-500/20 border-orange-500/30",
  },
  {
    icon: FiGlobe,
    title: "Connections & Context",
    description:
      "System finds connections between notes and creates contextual knowledge network",
    color: "text-green-400 bg-green-500/20 border-green-500/30",
  },
];

export default function NotesOnboarding() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      Learning: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      Projects: "text-green-400 bg-green-500/20 border-green-500/30",
      Ideas: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      Work: "text-orange-400 bg-orange-500/20 border-orange-500/30",
      Finance: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    };
    return (
      colors[category as keyof typeof colors] ||
      "text-gray-400 bg-gray-500/20 border-gray-500/30"
    );
  };

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return { text: "Critical", color: "text-red-400", icon: "🔥" };
    if (importance >= 6)
      return { text: "High", color: "text-orange-400", icon: "⚡" };
    if (importance >= 4)
      return { text: "Medium", color: "text-yellow-400", icon: "📝" };
    return { text: "Low", color: "text-green-400", icon: "📋" };
  };

  return (
    <div className="onboarding max-w-6xl mx-auto px-4 py-16">
      {/* Main Header */}
      <div className="text-center mb-16 animate-fadeInUp">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 mb-6">
            <FiEdit3 size={32} className="text-purple-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
          Your first note — the beginning of a great journey
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Transform chaotic thoughts into a structured knowledge system with AI
        </p>

        <Link
          to="/notes/create"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <FiEdit3 className="mr-2" size={20} />
          Create your first note
        </Link>
      </div>

      {/* System Features */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            What makes your notes special?
          </h2>
          <button
            onClick={() => setShowAllFeatures(!showAllFeatures)}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showAllFeatures ? "Show less" : "Learn more"}
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

      {/* Demo Notes */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Try interactive examples
          </h2>
          <p className="text-gray-400">
            Hover over cards to see different features
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demoNotes.map((note, index) => (
            <div
              key={note.id}
              className={`group relative p-6 rounded-xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:bg-gray-800/50 cursor-pointer animate-fadeInUp min-h-[280px] flex flex-col`}
              style={{ animationDelay: `${index * 0.15}s` }}
              onMouseEnter={() => setActiveDemo(note.id)}
              onMouseLeave={() => setActiveDemo(null)}
            >
              {/* Title and Importance */}
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

              {/* Category and Date */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`category-badge ${getCategoryColor(
                    note.category
                  )}`}
                >
                  <FiTag className="inline mr-1" size={10} />
                  {note.category}
                </span>
                <span className="text-xs text-gray-500">Just now</span>
              </div>

              {/* Content Preview */}
              <div className="mb-4 flex-1">
                <div className="text-xs text-gray-400 mb-1">AI Summary:</div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {note.summary}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {note.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Feature Indicator */}
              {activeDemo === note.id && (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30 animate-pulse pointer-events-none">
                  <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                    {note.demoType === "ai" && "🤖 AI"}
                    {note.demoType === "categories" && "📁 Categories"}
                    {note.demoType === "importance" && "⭐ Importance"}
                    {note.demoType === "connections" && "🔗 Connections"}
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
          Ready to start your knowledge journey?
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Create your first note and see how AI transforms your thoughts into a
          structured knowledge system
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/notes/create"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FiEdit3 className="mr-2" size={20} />
            Create note
          </Link>

          <div className="text-sm text-gray-400">
            or just start typing your thoughts
          </div>
        </div>
      </div>
    </div>
  );
}
