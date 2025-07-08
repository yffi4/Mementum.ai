import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiEdit3,
  FiZap,
  FiTag,
  FiLayers,
  FiTarget,
  FiGlobe,
  FiArrowRight,
  FiPlay,
  FiStar,
  FiTrendingUp,
  FiCheckCircle,
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
    gradient: "from-purple-400 to-pink-400",
    glow: "shadow-purple-500/50",
  },
  {
    icon: FiLayers,
    title: "Smart Categories",
    description:
      "Automatic note categorization: Learning, Projects, Ideas, Work and more",
    gradient: "from-blue-400 to-cyan-400",
    glow: "shadow-blue-500/50",
  },
  {
    icon: FiTarget,
    title: "Importance System",
    description:
      "Rate note importance from 1 to 10 for effective prioritization",
    gradient: "from-orange-400 to-red-400",
    glow: "shadow-orange-500/50",
  },
  {
    icon: FiGlobe,
    title: "Connections & Context",
    description:
      "System finds connections between notes and creates contextual knowledge network",
    gradient: "from-green-400 to-emerald-400",
    glow: "shadow-green-500/50",
  },
];

const steps = [
  {
    number: "01",
    title: "Write Your Thoughts",
    description:
      "Just start typing - no need to worry about structure or format",
    icon: FiEdit3,
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    number: "02",
    title: "AI Analyzes",
    description: "Our AI processes your content and extracts key insights",
    icon: FiZap,
    gradient: "from-purple-400 to-pink-500",
  },
  {
    number: "03",
    title: "Smart Organization",
    description:
      "Notes are automatically categorized and tagged for easy retrieval",
    icon: FiLayers,
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    number: "04",
    title: "Build Knowledge",
    description:
      "Watch your ideas connect and grow into a powerful knowledge base",
    icon: FiTrendingUp,
    gradient: "from-green-400 to-teal-500",
  },
];

export default function NotesOnboarding() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      Learning: "text-blue-300 bg-blue-500/20 border-blue-400/50",
      Projects: "text-green-300 bg-green-500/20 border-green-400/50",
      Ideas: "text-purple-300 bg-purple-500/20 border-purple-400/50",
      Work: "text-orange-300 bg-orange-500/20 border-orange-400/50",
      Finance: "text-yellow-300 bg-yellow-500/20 border-yellow-400/50",
    };
    return (
      colors[category as keyof typeof colors] ||
      "text-gray-300 bg-gray-500/20 border-gray-400/50"
    );
  };

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return {
        text: "Critical",
        color: "text-red-300 bg-red-500/20 border-red-400/50",
        icon: "🔥",
      };
    if (importance >= 6)
      return {
        text: "High",
        color: "text-orange-300 bg-orange-500/20 border-orange-400/50",
        icon: "⚡",
      };
    if (importance >= 4)
      return {
        text: "Medium",
        color: "text-yellow-300 bg-yellow-500/20 border-yellow-400/50",
        icon: "📝",
      };
    return {
      text: "Low",
      color: "text-green-300 bg-green-500/20 border-green-400/50",
      icon: "📋",
    };
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start">
      <div className="max-w-7xl w-full px-8 py-16 space-y-32">
        {/* Hero Section */}
        <div className="text-center space-y-8 animate-fadeInUp">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 shadow-2xl shadow-purple-500/50">
              <FiEdit3 size={48} className="text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight">
              Your first note
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              the beginning of a great journey
            </h2>
          </div>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform chaotic thoughts into a structured knowledge system with
            AI-powered organization
          </p>

          <div className="pt-8">
            <Link
              to="/notes/create"
              className="group relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
              <FiPlay className="relative mr-4" size={24} />
              <span className="relative">Start Your Journey</span>
              <FiArrowRight
                className="relative ml-4 transition-transform group-hover:translate-x-1"
                size={20}
              />
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/50 rounded-full">
              <span className="text-purple-300 font-semibold text-sm uppercase tracking-wider">
                How It Works
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white">
              From Chaos to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Clarity
              </span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-cyan-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 transition-all duration-500 hover:border-purple-400/50 hover:bg-gray-800/50 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-4 right-4 text-6xl font-black text-gray-800 opacity-20 group-hover:opacity-30 transition-opacity">
                  {step.number}
                </div>

                <div className="relative space-y-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon size={28} className="text-white" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-400/30 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-400/50 rounded-full">
              <span className="text-blue-300 font-semibold text-sm uppercase tracking-wider">
                Powerful Features
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white">
              What Makes Your Notes{" "}
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Special
              </span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-green-400 mx-auto rounded-full"></div>

            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="group inline-flex items-center px-8 py-3 bg-gray-900/50 border border-gray-600/50 text-cyan-300 font-semibold rounded-xl hover:border-cyan-400/50 hover:bg-gray-800/50 transition-all duration-300"
            >
              {showAllFeatures ? "Show Less" : "Show All Features"}
              <FiArrowRight
                className={`ml-3 transition-transform ${
                  showAllFeatures ? "rotate-90" : "group-hover:translate-x-1"
                }`}
                size={16}
              />
            </button>
          </div>

          <div
            className={`grid gap-8 transition-all duration-700 ${
              showAllFeatures
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
            }`}
          >
            {features
              .slice(0, showAllFeatures ? 4 : 2)
              .map((feature, index) => (
                <div
                  key={index}
                  className={`group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 transition-all duration-500 hover:border-purple-400/50 hover:bg-gray-800/50 hover:scale-105 animate-fadeInUp ${feature.glow} hover:shadow-2xl`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-6">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon size={28} className="text-white" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-500/20 border border-green-400/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <FiCheckCircle size={12} className="text-green-400" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Live Examples */}
        <div className="space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/50 rounded-full">
              <span className="text-indigo-300 font-semibold text-sm uppercase tracking-wider">
                See It In Action
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white">
              Live{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Examples
              </span>
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hover over these example notes to see how our AI transforms your
              content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoNotes.map((note, index) => (
              <div
                key={note.id}
                className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 transition-all duration-500 hover:border-cyan-400/50 hover:bg-gray-800/50 hover:scale-105 cursor-pointer animate-fadeInUp min-h-[400px] flex flex-col shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setActiveDemo(note.id)}
                onMouseLeave={() => setActiveDemo(null)}
              >
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex-1 mr-4 leading-tight">
                      {note.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                        getImportanceLevel(note.importance).color
                      }`}
                    >
                      <span className="mr-1">
                        {getImportanceLevel(note.importance).icon}
                      </span>
                      {note.importance}/10
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(
                        note.category
                      )}`}
                    >
                      <FiTag className="mr-1" size={10} />
                      {note.category}
                    </span>
                    <span className="text-xs text-gray-500">Just now</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <FiStar className="text-yellow-400" size={14} />
                      <span className="text-sm font-semibold text-gray-300">
                        AI Summary:
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      {note.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {note.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-2 py-1 bg-gray-800/50 border border-gray-600/50 text-gray-400 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {activeDemo === note.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-400/50 animate-pulse">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                      {note.demoType === "ai" && "🤖 AI Magic"}
                      {note.demoType === "categories" && "📁 Auto-Categorized"}
                      {note.demoType === "importance" && "⭐ Prioritized"}
                      {note.demoType === "connections" && "🔗 Connected"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-16 shadow-2xl shadow-purple-500/20">
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 shadow-2xl shadow-purple-500/50">
                <FiPlay size={32} className="text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Ready to Transform Your Thoughts?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who've revolutionized their note-taking
                with AI
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-4">
              <Link
                to="/notes/create"
                className="group relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                <FiEdit3 className="relative mr-4" size={24} />
                <span className="relative">Create Your First Note</span>
                <FiArrowRight
                  className="relative ml-4 transition-transform group-hover:translate-x-1"
                  size={20}
                />
              </Link>

              <div className="text-gray-400 text-center space-y-1">
                <div className="text-sm font-semibold">
                  Free to start • No credit card required
                </div>
                <div className="text-xs">
                  Your ideas deserve better organization
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
