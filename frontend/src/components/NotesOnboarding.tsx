"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
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
} from "react-icons/fi"

interface DemoNote {
  id: string
  title: string
  content: string
  category: string
  importance: number
  tags: string[]
  summary: string
  demoType: "ai" | "categories" | "importance" | "connections"
}

const demoNotes: DemoNote[] = [
  {
    id: "demo-1",
    title: "Learning React Hooks",
    content: "useState, useEffect, useCallback - essential hooks for state management and side effects...",
    category: "Learning",
    importance: 8,
    tags: ["react", "javascript", "frontend"],
    summary: "Note about key React hooks and their application in development",
    demoType: "ai",
  },
  {
    id: "demo-2",
    title: "Startup Idea",
    content: "AI-powered travel planning assistant considering weather and local events...",
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
]

const features = [
  {
    icon: FiZap,
    title: "AI Processing",
    description: "Artificial intelligence automatically structures your thoughts, creates summaries and suggests tags",
  },
  {
    icon: FiLayers,
    title: "Smart Categories",
    description: "Automatic note categorization: Learning, Projects, Ideas, Work and more",
  },
  {
    icon: FiTarget,
    title: "Importance System",
    description: "Rate note importance from 1 to 10 for effective prioritization",
  },
  {
    icon: FiGlobe,
    title: "Connections & Context",
    description: "System finds connections between notes and creates contextual knowledge network",
  },
]

const steps = [
  {
    number: "01",
    title: "Write Your Thoughts",
    description: "Just start typing - no need to worry about structure or format",
    icon: FiEdit3,
  },
  {
    number: "02",
    title: "AI Analyzes",
    description: "Our AI processes your content and extracts key insights",
    icon: FiZap,
  },
  {
    number: "03",
    title: "Smart Organization",
    description: "Notes are automatically categorized and tagged for easy retrieval",
    icon: FiLayers,
  },
  {
    number: "04",
    title: "Build Knowledge",
    description: "Watch your ideas connect and grow into a powerful knowledge base",
    icon: FiTrendingUp,
  },
]

export default function NotesOnboarding() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const getCategoryColor = (category: string) => {
    const colors = {
      Learning: "text-[#6feaff] bg-[#6feaff]/20 border-[#6feaff]/50",
      Projects: "text-[#a18aff] bg-[#a18aff]/20 border-[#a18aff]/50",
      Ideas: "text-[#6feaff] bg-[#6feaff]/20 border-[#6feaff]/50",
      Work: "text-[#a18aff] bg-[#a18aff]/20 border-[#a18aff]/50",
      Finance: "text-[#6feaff] bg-[#6feaff]/20 border-[#6feaff]/50",
    }
    return colors[category as keyof typeof colors] || "text-[#b8f2ff] bg-[#b8f2ff]/20 border-[#b8f2ff]/50"
  }

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return {
        text: "Critical",
        color: "text-[#a18aff] bg-[#a18aff]/20 border-[#a18aff]/50",
        icon: "🔥",
      }
    if (importance >= 6)
      return {
        text: "High",
        color: "text-[#6feaff] bg-[#6feaff]/20 border-[#6feaff]/50",
        icon: "⚡",
      }
    if (importance >= 4)
      return {
        text: "Medium",
        color: "text-[#b8f2ff] bg-[#b8f2ff]/20 border-[#b8f2ff]/50",
        icon: "📝",
      }
    return {
      text: "Low",
      color: "text-[#d1d5db] bg-[#d1d5db]/20 border-[#d1d5db]/50",
      icon: "📋",
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0c2a] to-[#1b1740] pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #a18aff 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #6feaff 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-32">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            />
            <div
              className="relative inline-flex items-center justify-center w-32 h-32 rounded-full shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                boxShadow: "0 0 40px rgba(161, 138, 255, 0.5)",
              }}
            >
              <FiEdit3 size={48} className="text-white" />
            </div>
          </div>

          <div className="space-y-6">
            <h1
              className="text-6xl md:text-8xl font-black leading-tight"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your first note
            </h1>
            <div
              className="h-1 w-32 mx-auto rounded-full"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            />
            <h2 className="text-3xl md:text-4xl font-bold text-white">the beginning of a great journey</h2>
          </div>

          <p className="text-xl text-[#b8f2ff] max-w-3xl mx-auto leading-relaxed">
            Transform chaotic thoughts into a structured knowledge system with AI-powered organization
          </p>

          <div className="pt-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/notes/create"
                className="group relative inline-flex items-center px-12 py-6 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  boxShadow: "0 8px 32px rgba(161, 138, 255, 0.4)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(135deg, #6feaff 0%, #a18aff 100%)",
                  }}
                />
                <FiPlay className="relative mr-4" size={24} />
                <span className="relative">Start Your Journey</span>
                <FiArrowRight className="relative ml-4 transition-transform group-hover:translate-x-1" size={20} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works */}
        <div className="space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div
              className="inline-block px-6 py-2 rounded-full border"
              style={{
                background: "rgba(161, 138, 255, 0.1)",
                borderColor: "rgba(161, 138, 255, 0.3)",
              }}
            >
              <span className="text-[#a18aff] font-semibold text-sm uppercase tracking-wider">How It Works</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white">
              From Chaos to{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Clarity
              </span>
            </h2>
            <div
              className="h-1 w-24 mx-auto rounded-full"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 hover:scale-105"
                style={{
                  background: "rgba(24, 27, 58, 0.8)",
                  borderColor: "rgba(111, 234, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div className="absolute top-4 right-4 text-6xl font-black opacity-10 group-hover:opacity-20 transition-opacity text-[#6feaff]">
                  {step.number}
                </div>

                <div className="relative space-y-6">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                    }}
                  >
                    <step.icon size={28} className="text-white" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#6feaff] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[#d1d5db] text-sm leading-relaxed group-hover:text-[#b8f2ff] transition-colors">
                      {step.description}
                    </p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#a18aff]/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div
              className="inline-block px-6 py-2 rounded-full border"
              style={{
                background: "rgba(111, 234, 255, 0.1)",
                borderColor: "rgba(111, 234, 255, 0.3)",
              }}
            >
              <span className="text-[#6feaff] font-semibold text-sm uppercase tracking-wider">Powerful Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white">
              What Makes Your Notes{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Special
              </span>
            </h2>
            <div
              className="h-1 w-24 mx-auto rounded-full"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="group inline-flex items-center px-8 py-3 backdrop-blur-sm border text-[#6feaff] font-semibold rounded-xl transition-all duration-300"
              style={{
                background: "rgba(24, 27, 58, 0.5)",
                borderColor: "rgba(111, 234, 255, 0.3)",
              }}
            >
              {showAllFeatures ? "Show Less" : "Show All Features"}
              <FiArrowRight
                className={`ml-3 transition-transform ${showAllFeatures ? "rotate-90" : "group-hover:translate-x-1"}`}
                size={16}
              />
            </motion.button>
          </motion.div>

          <div
            className={`grid gap-8 transition-all duration-700 ${
              showAllFeatures
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                : "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
            }`}
          >
            {features.slice(0, showAllFeatures ? 4 : 2).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 hover:scale-105"
                style={{
                  background: "rgba(24, 27, 58, 0.8)",
                  borderColor: "rgba(111, 234, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div className="space-y-6">
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                    style={{
                      background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                    }}
                  >
                    <feature.icon size={28} className="text-white" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#6feaff] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[#d1d5db] text-sm leading-relaxed group-hover:text-[#b8f2ff] transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 right-4 w-6 h-6 bg-[#4ade80]/20 border border-[#4ade80]/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <FiCheckCircle size={12} className="text-[#4ade80]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Examples */}
        <div className="space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div
              className="inline-block px-6 py-2 rounded-full border"
              style={{
                background: "rgba(161, 138, 255, 0.1)",
                borderColor: "rgba(161, 138, 255, 0.3)",
              }}
            >
              <span className="text-[#a18aff] font-semibold text-sm uppercase tracking-wider">See It In Action</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white">
              Live{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Examples
              </span>
            </h2>
            <div
              className="h-1 w-24 mx-auto rounded-full"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            />
            <p className="text-xl text-[#b8f2ff] max-w-3xl mx-auto">
              Hover over these example notes to see how our AI transforms your content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative backdrop-blur-sm border rounded-2xl p-8 transition-all duration-500 hover:scale-105 cursor-pointer min-h-[400px] flex flex-col"
                style={{
                  background: "rgba(24, 27, 58, 0.8)",
                  borderColor: "rgba(111, 234, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
                onMouseEnter={() => setActiveDemo(note.id)}
                onMouseLeave={() => setActiveDemo(null)}
              >
                <div className="space-y-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#6feaff] transition-colors flex-1 mr-4 leading-tight">
                      {note.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${
                        getImportanceLevel(note.importance).color
                      }`}
                    >
                      <span className="mr-1">{getImportanceLevel(note.importance).icon}</span>
                      {note.importance}/10
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(
                        note.category,
                      )}`}
                    >
                      <FiTag className="mr-1" size={10} />
                      {note.category}
                    </span>
                    <span className="text-xs text-[#9ca3af]">Just now</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <FiStar className="text-[#6feaff]" size={14} />
                      <span className="text-sm font-semibold text-[#b8f2ff]">AI Summary:</span>
                    </div>
                    <p className="text-sm text-[#d1d5db] leading-relaxed group-hover:text-[#b8f2ff] transition-colors">
                      {note.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {note.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-2 py-1 border text-[#9ca3af] rounded-md"
                        style={{
                          background: "rgba(24, 27, 58, 0.5)",
                          borderColor: "rgba(111, 234, 255, 0.2)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {activeDemo === note.id && (
                  <div
                    className="absolute inset-0 rounded-2xl border animate-pulse"
                    style={{
                      background: "linear-gradient(135deg, rgba(161, 138, 255, 0.1) 0%, rgba(111, 234, 255, 0.1) 100%)",
                      borderColor: "rgba(111, 234, 255, 0.5)",
                    }}
                  >
                    <div
                      className="absolute top-4 right-4 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                      }}
                    >
                      {note.demoType === "ai" && "🤖 AI Magic"}
                      {note.demoType === "categories" && "📁 Auto-Categorized"}
                      {note.demoType === "importance" && "⭐ Prioritized"}
                      {note.demoType === "connections" && "🔗 Connected"}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center backdrop-blur-sm border rounded-3xl p-16 shadow-2xl"
          style={{
            background: "rgba(24, 27, 58, 0.8)",
            borderColor: "rgba(111, 234, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(161, 138, 255, 0.2)",
          }}
        >
          <div className="space-y-8">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse"
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                }}
              />
              <div
                className="relative inline-flex items-center justify-center w-24 h-24 rounded-full shadow-2xl"
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  boxShadow: "0 0 40px rgba(161, 138, 255, 0.5)",
                }}
              >
                <FiPlay size={32} className="text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white">Ready to Transform Your Thoughts?</h2>
              <p className="text-xl text-[#b8f2ff] max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who've revolutionized their note-taking with AI
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/notes/create"
                  className="group relative inline-flex items-center px-12 py-6 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                    boxShadow: "0 8px 32px rgba(161, 138, 255, 0.4)",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(135deg, #6feaff 0%, #a18aff 100%)",
                    }}
                  />
                  <FiEdit3 className="relative mr-4" size={24} />
                  <span className="relative">Create Your First Note</span>
                  <FiArrowRight className="relative ml-4 transition-transform group-hover:translate-x-1" size={20} />
                </Link>
              </motion.div>

              <div className="text-[#9ca3af] text-center space-y-1">
                <div className="text-sm font-semibold">Free to start • No credit card required</div>
                <div className="text-xs">Your ideas deserve better organization</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
