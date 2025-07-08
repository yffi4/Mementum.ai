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
    title: "React Hooks Guide",
    content: "useState, useEffect, useCallback essentials...",
    category: "Learning",
    importance: 8,
    tags: ["react", "javascript"],
    summary: "Key React hooks for development",
    demoType: "ai",
  },
  {
    id: "demo-2",
    title: "Travel AI Assistant",
    content: "Smart planning with weather integration...",
    category: "Ideas",
    importance: 9,
    tags: ["startup", "ai"],
    summary: "AI-powered travel planning concept",
    demoType: "importance",
  },
  {
    id: "demo-3",
    title: "2024 Financial Goals",
    content: "Save 500k, invest in ETFs, reduce expenses...",
    category: "Finance",
    importance: 7,
    tags: ["finance", "planning"],
    summary: "Personal financial strategy",
    demoType: "categories",
  },
]

const features = [
  {
    icon: FiZap,
    title: "AI Processing",
    description: "Automatically structure thoughts and create summaries",
  },
  {
    icon: FiLayers,
    title: "Smart Categories",
    description: "Auto-categorize notes by topic and context",
  },
  {
    icon: FiTarget,
    title: "Priority System",
    description: "Rate importance from 1-10 for better focus",
  },
  {
    icon: FiGlobe,
    title: "Smart Connections",
    description: "Find relationships between your notes",
  },
]

const steps = [
  {
    number: "01",
    title: "Write Freely",
    description: "Just type your thoughts naturally",
    icon: FiEdit3,
  },
  {
    number: "02",
    title: "AI Analyzes",
    description: "Extract insights automatically",
    icon: FiZap,
  },
  {
    number: "03",
    title: "Auto-Organize",
    description: "Categorize and tag intelligently",
    icon: FiLayers,
  },
  {
    number: "04",
    title: "Build Knowledge",
    description: "Connect ideas into a network",
    icon: FiTrendingUp,
  },
]

export default function NotesOnboarding() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  const getCategoryColor = (category: string) => {
    const colors = {
      Learning: "text-[#6feaff] bg-[#6feaff]/10 border-[#6feaff]/30",
      Ideas: "text-[#a18aff] bg-[#a18aff]/10 border-[#a18aff]/30",
      Finance: "text-[#6feaff] bg-[#6feaff]/10 border-[#6feaff]/30",
    }
    return colors[category as keyof typeof colors] || "text-[#b8f2ff] bg-[#b8f2ff]/10 border-[#b8f2ff]/30"
  }

  const getImportanceLevel = (importance: number) => {
    if (importance >= 8)
      return {
        text: "High",
        color: "text-[#a18aff] bg-[#a18aff]/10 border-[#a18aff]/30",
        icon: "🔥",
      }
    if (importance >= 6)
      return {
        text: "Med",
        color: "text-[#6feaff] bg-[#6feaff]/10 border-[#6feaff]/30",
        icon: "⚡",
      }
    return {
      text: "Low",
      color: "text-[#d1d5db] bg-[#d1d5db]/10 border-[#d1d5db]/30",
      icon: "📋",
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0c2a] to-[#1b1740] pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #a18aff 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #6feaff 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-20"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            />
            <div
              className="relative inline-flex items-center justify-center w-20 h-20 rounded-full shadow-xl"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            >
              <FiEdit3 size={32} className="text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1
              className="text-4xl md:text-6xl font-black leading-tight"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your first note
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-white">the beginning of something great</h2>
          </div>

          <p className="text-lg text-[#b8f2ff] max-w-2xl mx-auto">
            Transform chaotic thoughts into structured knowledge with AI
          </p>

          <div className="pt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/notes/create"
                className="group inline-flex items-center px-8 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  boxShadow: "0 4px 20px rgba(161, 138, 255, 0.3)",
                }}
              >
                <FiPlay className="mr-3" size={20} />
                Start Your Journey
                <FiArrowRight className="ml-3 transition-transform group-hover:translate-x-1" size={18} />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div
              className="inline-block px-4 py-2 rounded-full border text-sm font-medium"
              style={{
                background: "rgba(161, 138, 255, 0.1)",
                borderColor: "rgba(161, 138, 255, 0.3)",
                color: "#a18aff",
              }}
            >
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
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
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(24, 27, 58, 0.6)",
                  borderColor: "rgba(111, 234, 255, 0.2)",
                }}
              >
                <div className="absolute top-3 right-3 text-3xl font-black opacity-10 text-[#6feaff]">
                  {step.number}
                </div>

                <div className="space-y-4">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                    }}
                  >
                    <step.icon size={20} className="text-white" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-[#d1d5db]">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div
              className="inline-block px-4 py-2 rounded-full border text-sm font-medium"
              style={{
                background: "rgba(111, 234, 255, 0.1)",
                borderColor: "rgba(111, 234, 255, 0.3)",
                color: "#6feaff",
              }}
            >
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              What Makes Notes{" "}
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="inline-flex items-center px-6 py-2 backdrop-blur-sm border text-[#6feaff] font-medium rounded-lg transition-all duration-300 text-sm"
              style={{
                background: "rgba(24, 27, 58, 0.4)",
                borderColor: "rgba(111, 234, 255, 0.3)",
              }}
            >
              {showAllFeatures ? "Show Less" : "Show All"}
              <FiArrowRight className="ml-2" size={14} />
            </motion.button>
          </motion.div>

          <div
            className={`grid gap-6 transition-all duration-500 ${
              showAllFeatures ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {features.slice(0, showAllFeatures ? 4 : 2).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(24, 27, 58, 0.6)",
                  borderColor: "rgba(111, 234, 255, 0.2)",
                }}
              >
                <div className="space-y-4">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-lg"
                    style={{
                      background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                    }}
                  >
                    <feature.icon size={20} className="text-white" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-[#d1d5db]">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Examples - Компактные */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div
              className="inline-block px-4 py-2 rounded-full border text-sm font-medium"
              style={{
                background: "rgba(161, 138, 255, 0.1)",
                borderColor: "rgba(161, 138, 255, 0.3)",
                color: "#a18aff",
              }}
            >
              Live Examples
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              See{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI Magic
              </span>
            </h2>
            <p className="text-[#b8f2ff]">Hover to see how AI transforms your notes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative backdrop-blur-sm border rounded-xl p-5 transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  background: "rgba(24, 27, 58, 0.6)",
                  borderColor: "rgba(111, 234, 255, 0.2)",
                }}
                onMouseEnter={() => setActiveDemo(note.id)}
                onMouseLeave={() => setActiveDemo(null)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white leading-tight flex-1">{note.title}</h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                        getImportanceLevel(note.importance).color
                      }`}
                    >
                      {getImportanceLevel(note.importance).icon} {note.importance}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(
                        note.category,
                      )}`}
                    >
                      <FiTag className="mr-1" size={10} />
                      {note.category}
                    </span>
                    <span className="text-xs text-[#9ca3af]">2m ago</span>
                  </div>

                  {/* AI Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiStar className="text-[#6feaff]" size={12} />
                      <span className="text-xs font-medium text-[#b8f2ff]">AI Summary</span>
                    </div>
                    <p className="text-sm text-[#d1d5db] leading-relaxed">{note.summary}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs px-2 py-1 border text-[#9ca3af] rounded"
                        style={{
                          background: "rgba(24, 27, 58, 0.4)",
                          borderColor: "rgba(111, 234, 255, 0.2)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hover Effect */}
                {activeDemo === note.id && (
                  <div
                    className="absolute inset-0 rounded-xl border"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(161, 138, 255, 0.05) 0%, rgba(111, 234, 255, 0.05) 100%)",
                      borderColor: "rgba(111, 234, 255, 0.4)",
                    }}
                  >
                    <div
                      className="absolute top-3 right-3 text-white text-xs px-2 py-1 rounded font-medium"
                      style={{
                        background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                      }}
                    >
                      {note.demoType === "ai" && "🤖 AI"}
                      {note.demoType === "categories" && "📁 Auto"}
                      {note.demoType === "importance" && "⭐ Priority"}
                      {note.demoType === "connections" && "🔗 Links"}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action - Компактный */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center backdrop-blur-sm border rounded-2xl p-12"
          style={{
            background: "rgba(24, 27, 58, 0.6)",
            borderColor: "rgba(111, 234, 255, 0.2)",
          }}
        >
          <div className="space-y-6">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              }}
            >
              <FiPlay size={24} className="text-white" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Start?</h2>
              <p className="text-lg text-[#b8f2ff] max-w-xl mx-auto">
                Join thousands transforming their note-taking with AI
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/notes/create"
                  className="group inline-flex items-center px-8 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                    boxShadow: "0 4px 20px rgba(161, 138, 255, 0.3)",
                  }}
                >
                  <FiEdit3 className="mr-3" size={20} />
                  Create First Note
                  <FiArrowRight className="ml-3 transition-transform group-hover:translate-x-1" size={18} />
                </Link>
              </motion.div>

              <div className="text-[#9ca3af] text-center space-y-1">
                <div className="text-sm font-medium">Free to start • No card required</div>
                <div className="text-xs">Your ideas deserve better</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
