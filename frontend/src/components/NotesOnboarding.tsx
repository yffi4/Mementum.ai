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
    color: "from-purple-600 to-purple-400",
    borderColor: "border-purple-400/50",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: FiLayers,
    title: "Smart Categories",
    description:
      "Automatic note categorization: Learning, Projects, Ideas, Work and more",
    color: "from-blue-600 to-blue-400",
    borderColor: "border-blue-400/50",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: FiTarget,
    title: "Importance System",
    description:
      "Rate note importance from 1 to 10 for effective prioritization",
    color: "from-orange-600 to-orange-400",
    borderColor: "border-orange-400/50",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: FiGlobe,
    title: "Connections & Context",
    description:
      "System finds connections between notes and creates contextual knowledge network",
    color: "from-green-600 to-green-400",
    borderColor: "border-green-400/50",
    bgColor: "bg-green-500/10",
  },
];

const steps = [
  {
    number: 1,
    title: "Write Your Thoughts",
    description:
      "Just start typing - no need to worry about structure or format",
    icon: FiEdit3,
    color: "text-cyan-400",
  },
  {
    number: 2,
    title: "AI Analyzes",
    description: "Our AI processes your content and extracts key insights",
    icon: FiZap,
    color: "text-purple-400",
  },
  {
    number: 3,
    title: "Smart Organization",
    description:
      "Notes are automatically categorized and tagged for easy retrieval",
    icon: FiLayers,
    color: "text-blue-400",
  },
  {
    number: 4,
    title: "Build Knowledge",
    description:
      "Watch your ideas connect and grow into a powerful knowledge base",
    icon: FiTrendingUp,
    color: "text-green-400",
  },
];

export default function NotesOnboarding() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      Learning: "text-blue-300 bg-blue-600/20 border-blue-400/60",
      Projects: "text-green-300 bg-green-600/20 border-green-400/60",
      Ideas: "text-purple-300 bg-purple-600/20 border-purple-400/60",
      Work: "text-orange-300 bg-orange-600/20 border-orange-400/60",
      Finance: "text-yellow-300 bg-yellow-600/20 border-yellow-400/60",
    };
    return (
      colors[category as keyof typeof colors] ||
      "text-gray-300 bg-gray-600/20 border-gray-400/60"
    );
  };

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return { text: "Critical", color: "text-red-300", icon: "🔥" };
    if (importance >= 6)
      return { text: "High", color: "text-orange-300", icon: "⚡" };
    if (importance >= 4)
      return { text: "Medium", color: "text-yellow-300", icon: "📝" };
    return { text: "Low", color: "text-green-300", icon: "📋" };
  };

  return (
    <div className="onboarding w-full flex justify-center">
      <div className="max-w-6xl w-full px-4 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fadeInUp">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-2 border-purple-400/50 mb-6 shadow-lg shadow-purple-500/20">
              <FiEdit3 size={36} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your first note —<br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              the beginning of a great journey
            </span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform chaotic thoughts into a structured knowledge system with
            AI-powered organization and insights
          </p>

          <Link
            to="/notes/create"
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40"
          >
            <FiPlay className="mr-3" size={24} />
            Start Your Journey
            <FiArrowRight className="ml-3" size={20} />
          </Link>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              From scattered thoughts to organized knowledge in just 4 simple
              steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fadeInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 border-2 border-gray-600/50 mb-4 ${step.color}`}
                  >
                    <step.icon size={28} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-400/50 to-cyan-400/50"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Discover what makes your notes intelligent and organized
            </p>
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="inline-flex items-center px-6 py-3 bg-gray-800/50 border border-gray-600/50 text-cyan-400 font-semibold rounded-lg hover:bg-gray-700/50 hover:border-cyan-400/50 transition-all duration-300"
            >
              {showAllFeatures ? (
                <>
                  Show Less{" "}
                  <FiArrowRight className="ml-2 rotate-90" size={16} />
                </>
              ) : (
                <>
                  Show All Features <FiArrowRight className="ml-2" size={16} />
                </>
              )}
            </button>
          </div>

          <div
            className={`grid gap-8 transition-all duration-500 ${
              showAllFeatures
                ? "md:grid-cols-2 lg:grid-cols-4"
                : "md:grid-cols-2 max-w-4xl mx-auto"
            }`}
          >
            {features
              .slice(0, showAllFeatures ? 4 : 2)
              .map((feature, index) => (
                <div
                  key={index}
                  className={`relative p-8 rounded-2xl border-2 ${feature.borderColor} ${feature.bgColor} backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fadeInUp group`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}
                  >
                    <feature.icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="absolute top-4 right-4 w-6 h-6 bg-green-500/20 border border-green-400/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiCheckCircle size={14} className="text-green-400" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              See It In Action
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mx-auto mb-4"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Hover over these example notes to see how our AI transforms your
              content
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {demoNotes.map((note, index) => (
              <div
                key={note.id}
                className={`group relative p-8 rounded-2xl border-2 border-gray-600/50 bg-gray-800/30 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/60 hover:bg-gray-700/40 cursor-pointer animate-fadeInUp min-h-[320px] flex flex-col hover:scale-105 hover:shadow-2xl`}
                style={{ animationDelay: `${index * 0.15}s` }}
                onMouseEnter={() => setActiveDemo(note.id)}
                onMouseLeave={() => setActiveDemo(null)}
              >
                {/* Title and Importance */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex-1 mr-3 leading-tight">
                    {note.title}
                  </h3>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold border ${
                        getImportanceLevel(note.importance).color
                      } bg-gray-800/50 border-gray-600/50`}
                    >
                      <span className="mr-1">
                        {getImportanceLevel(note.importance).icon}
                      </span>
                      {note.importance}/10
                    </span>
                  </div>
                </div>

                {/* Category and Date */}
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border ${getCategoryColor(
                      note.category
                    )}`}
                  >
                    <FiTag className="mr-1" size={12} />
                    {note.category}
                  </span>
                  <span className="text-sm text-gray-400">Just now</span>
                </div>

                {/* Content Preview */}
                <div className="mb-6 flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <FiStar className="text-yellow-400" size={14} />
                    <span className="text-sm font-medium text-gray-300">
                      AI Summary:
                    </span>
                  </div>
                  <p className="text-gray-200 leading-relaxed text-sm">
                    {note.summary}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {note.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-xs px-3 py-1 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Feature Indicator */}
                {activeDemo === note.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border-2 border-cyan-400/50 animate-pulse pointer-events-none">
                    <div className="absolute top-4 right-4 bg-cyan-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
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
        <div className="text-center bg-gradient-to-br from-purple-900/40 to-cyan-900/40 rounded-3xl p-16 border-2 border-purple-400/30 max-w-4xl mx-auto backdrop-blur-sm shadow-2xl shadow-purple-500/20">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border-2 border-purple-400/50 mb-6 shadow-lg shadow-purple-500/20">
              <FiPlay size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Thoughts?
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who've revolutionized their note-taking with
            AI-powered organization
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/notes/create"
              className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold text-lg rounded-2xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              <FiEdit3 className="mr-3" size={24} />
              Create Your First Note
              <FiArrowRight className="ml-3" size={20} />
            </Link>

            <div className="text-gray-300 text-center">
              <div className="text-sm mb-1">
                Free to start • No credit card required
              </div>
              <div className="text-xs text-gray-400">
                Your ideas deserve better organization
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
