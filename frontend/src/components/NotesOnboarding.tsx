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
    borderColor: "border-purple-400",
    bgColor: "bg-white/95",
  },
  {
    icon: FiLayers,
    title: "Smart Categories",
    description:
      "Automatic note categorization: Learning, Projects, Ideas, Work and more",
    color: "from-blue-600 to-blue-400",
    borderColor: "border-blue-400",
    bgColor: "bg-white/95",
  },
  {
    icon: FiTarget,
    title: "Importance System",
    description:
      "Rate note importance from 1 to 10 for effective prioritization",
    color: "from-orange-600 to-orange-400",
    borderColor: "border-orange-400",
    bgColor: "bg-white/95",
  },
  {
    icon: FiGlobe,
    title: "Connections & Context",
    description:
      "System finds connections between notes and creates contextual knowledge network",
    color: "from-green-600 to-green-400",
    borderColor: "border-green-400",
    bgColor: "bg-white/95",
  },
];

const steps = [
  {
    number: 1,
    title: "Write Your Thoughts",
    description:
      "Just start typing - no need to worry about structure or format",
    icon: FiEdit3,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    number: 2,
    title: "AI Analyzes",
    description: "Our AI processes your content and extracts key insights",
    icon: FiZap,
    color: "from-purple-500 to-purple-600",
  },
  {
    number: 3,
    title: "Smart Organization",
    description:
      "Notes are automatically categorized and tagged for easy retrieval",
    icon: FiLayers,
    color: "from-blue-500 to-blue-600",
  },
  {
    number: 4,
    title: "Build Knowledge",
    description:
      "Watch your ideas connect and grow into a powerful knowledge base",
    icon: FiTrendingUp,
    color: "from-green-500 to-green-600",
  },
];

export default function NotesOnboarding() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors = {
      Learning: "text-blue-700 bg-blue-100 border-blue-300",
      Projects: "text-green-700 bg-green-100 border-green-300",
      Ideas: "text-purple-700 bg-purple-100 border-purple-300",
      Work: "text-orange-700 bg-orange-100 border-orange-300",
      Finance: "text-yellow-700 bg-yellow-100 border-yellow-300",
    };
    return (
      colors[category as keyof typeof colors] ||
      "text-gray-700 bg-gray-100 border-gray-300"
    );
  };

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return {
        text: "Critical",
        color: "text-red-700 bg-red-100 border-red-300",
        icon: "🔥",
      };
    if (importance >= 6)
      return {
        text: "High",
        color: "text-orange-700 bg-orange-100 border-orange-300",
        icon: "⚡",
      };
    if (importance >= 4)
      return {
        text: "Medium",
        color: "text-yellow-700 bg-yellow-100 border-yellow-300",
        icon: "📝",
      };
    return {
      text: "Low",
      color: "text-green-700 bg-green-100 border-green-300",
      icon: "📋",
    };
  };

  return (
    <div className="onboarding w-full flex justify-center">
      <div className="max-w-7xl w-full px-6 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-24 animate-fadeInUp">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 mb-8 shadow-2xl shadow-purple-500/30">
              <FiEdit3 size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Your first note —<br />
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              the beginning of a great journey
            </span>
          </h1>
          <p className="text-2xl text-gray-200 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
            Transform chaotic thoughts into a structured knowledge system with
            AI-powered organization and insights
          </p>

          <Link
            to="/notes/create"
            className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-xl rounded-2xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            <FiPlay className="mr-4" size={28} />
            Start Your Journey
            <FiArrowRight className="ml-4" size={24} />
          </Link>
        </div>

        {/* How It Works Section */}
        <div className="mb-28">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              How It Works
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              From Chaos to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Clarity
              </span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-medium">
              Transform scattered thoughts into organized knowledge in just 4
              simple steps
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative text-center animate-fadeInUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative mb-8">
                  <div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} shadow-2xl mb-6 transform transition-transform hover:scale-110`}
                  >
                    <step.icon size={36} className="text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {step.number}
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-200 min-h-[160px] flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-5 w-10 h-1 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-28">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              What Makes Your Notes{" "}
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Special
              </span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-auto mb-8"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-10 font-medium">
              Discover intelligent features that transform how you organize and
              access your knowledge
            </p>
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
            >
              {showAllFeatures ? (
                <>
                  Show Less{" "}
                  <FiArrowRight className="ml-3 rotate-90" size={18} />
                </>
              ) : (
                <>
                  Show All Features <FiArrowRight className="ml-3" size={18} />
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
                  className={`relative ${feature.bgColor} backdrop-blur-sm rounded-2xl p-8 border-2 ${feature.borderColor} shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl animate-fadeInUp group`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {feature.description}
                  </p>

                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 border-2 border-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <FiCheckCircle size={16} className="text-white" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="mb-28">
          <div className="text-center mb-20">
            <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              See It In Action
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              Live{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Examples
              </span>
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mb-6"></div>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto font-medium">
              Hover over these example notes to see how our AI transforms your
              content
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {demoNotes.map((note, index) => (
              <div
                key={note.id}
                className={`group relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 border-2 border-gray-200 shadow-2xl transition-all duration-300 hover:border-cyan-400 hover:shadow-3xl cursor-pointer animate-fadeInUp min-h-[360px] flex flex-col hover:scale-105`}
                style={{ animationDelay: `${index * 0.15}s` }}
                onMouseEnter={() => setActiveDemo(note.id)}
                onMouseLeave={() => setActiveDemo(null)}
              >
                {/* Title and Importance */}
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-cyan-600 transition-colors flex-1 mr-4 leading-tight">
                    {note.title}
                  </h3>
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border ${
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
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold border ${getCategoryColor(
                      note.category
                    )}`}
                  >
                    <FiTag className="mr-2" size={14} />
                    {note.category}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    Just now
                  </span>
                </div>

                {/* Content Preview */}
                <div className="mb-6 flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <FiStar className="text-yellow-500" size={16} />
                    <span className="text-lg font-bold text-gray-700">
                      AI Summary:
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {note.summary}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mt-auto">
                  {note.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-sm px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Feature Indicator */}
                {activeDemo === note.id && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border-2 border-cyan-400 animate-pulse pointer-events-none">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm px-4 py-2 rounded-full font-bold shadow-xl">
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
        <div className="text-center bg-gradient-to-br from-purple-900/60 to-cyan-900/60 backdrop-blur-sm rounded-3xl p-16 border-2 border-purple-400/50 max-w-5xl mx-auto shadow-2xl shadow-purple-500/30">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 mb-8 shadow-2xl shadow-purple-500/30">
              <FiPlay size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
            Ready to Transform Your Thoughts?
          </h2>
          <p className="text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Join thousands of users who've revolutionized their note-taking with
            AI-powered organization
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              to="/notes/create"
              className="inline-flex items-center px-12 py-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black text-xl rounded-2xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50"
            >
              <FiEdit3 className="mr-4" size={28} />
              Create Your First Note
              <FiArrowRight className="ml-4" size={24} />
            </Link>

            <div className="text-gray-200 text-center">
              <div className="text-lg mb-2 font-bold">
                Free to start • No credit card required
              </div>
              <div className="text-sm text-gray-300 font-medium">
                Your ideas deserve better organization
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
