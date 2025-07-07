"use client";

import type React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiShield,
  FiLock,
  FiEye,
  FiDatabase,
  FiUsers,
  FiMail,
  FiArrowLeft,
} from "react-icons/fi";

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <FiShield size={24} />,
      content: (
        <p className="text-[#d1d5db] leading-relaxed">
          Mementum.ai – Quick Notes is a Chrome extension that helps users
          quickly save selected text from web pages and generate structured
          notes using an AI assistant. We are committed to protecting your
          privacy and being transparent about the data we collect and how it is
          used.
        </p>
      ),
    },
    {
      id: "data-collection",
      title: "What Information We Collect",
      icon: <FiDatabase size={24} />,
      content: (
        <div className="space-y-4">
          <ul className="space-y-3 text-[#d1d5db]">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6feaff] rounded-full mt-2 flex-shrink-0" />
              <span>
                Email address, username, and password (when registering via
                email)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#a18aff] rounded-full mt-2 flex-shrink-0" />
              <span>
                Google account basic info (when registering via Google)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6feaff] rounded-full mt-2 flex-shrink-0" />
              <span>Selected text that users explicitly choose to save</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#a18aff] rounded-full mt-2 flex-shrink-0" />
              <span>Generated notes (optional, stored locally)</span>
            </li>
          </ul>
          <div
            className="p-4 rounded-lg border"
            style={{
              background: "rgba(74, 222, 128, 0.1)",
              borderColor: "rgba(74, 222, 128, 0.3)",
            }}
          >
            <p className="text-[#4ade80] font-medium text-sm">
              ✅ We do not collect browsing history, cookies, or any unrelated
              personal data.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "data-usage",
      title: "How We Use the Data",
      icon: <FiEye size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#d1d5db] leading-relaxed">
            Your data is used solely for the following purposes:
          </p>
          <div className="grid gap-4 md:grid-cols-1">
            {[
              "To authenticate and authorize your account",
              "To allow AI to generate structured notes from the selected text",
              "To personalize and improve your note-taking experience",
            ].map((purpose, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 p-4 rounded-lg"
                style={{
                  background: "rgba(161, 138, 255, 0.1)",
                  border: "1px solid rgba(161, 138, 255, 0.2)",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                  }}
                >
                  {index + 1}
                </div>
                <span className="text-[#d1d5db]">{purpose}</span>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "data-security",
      title: "Data Storage and Security",
      icon: <FiLock size={24} />,
      content: (
        <div className="space-y-4">
          <div className="grid gap-4">
            {[
              {
                title: "Login Data",
                description: "Securely stored in our backend and encrypted",
                color: "#a18aff",
              },
              {
                title: "Selected Text",
                description:
                  "Sent over secure HTTPS and used only for immediate processing — not stored on servers",
                color: "#6feaff",
              },
              {
                title: "Generated Notes",
                description:
                  "Stored locally in your browser using Chrome's storage API",
                color: "#4ade80",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="p-4 rounded-lg border"
                style={{
                  background: `${item.color}15`,
                  borderColor: `${item.color}40`,
                }}
              >
                <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-[#d1d5db] text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "third-party",
      title: "Third-Party Services",
      icon: <FiUsers size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#d1d5db] leading-relaxed">We use:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-3 h-3 bg-[#4285f4] rounded-full" />
              <span className="text-[#d1d5db]">Google OAuth for login</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-3 h-3 bg-[#a18aff] rounded-full" />
              <span className="text-[#d1d5db]">
                Our own backend AI APIs for generating notes
              </span>
            </div>
          </div>
          <div
            className="p-4 rounded-lg border"
            style={{
              background: "rgba(74, 222, 128, 0.1)",
              borderColor: "rgba(74, 222, 128, 0.3)",
            }}
          >
            <p className="text-[#4ade80] font-medium">
              🔒 We do not share or sell your data to any third parties.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <FiMail size={24} />,
      content: (
        <div className="space-y-4">
          <p className="text-[#d1d5db] leading-relaxed">
            You can request deletion of your account and data by contacting us
            at:
          </p>
          <motion.a
            href="mailto:support@mementum.pro"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              color: "white",
              boxShadow: "0 8px 32px rgba(161, 138, 255, 0.4)",
            }}
          >
            <FiMail size={20} />
            support@mementum.pro
          </motion.a>
        </div>
      ),
    },
  ];

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

      <div
        className="relative z-10 max-w-4xl px-4 sm:px-6 lg:px-8 py-12"
        style={{ margin: "0 auto" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#6feaff] hover:text-white transition-colors duration-300 mb-6"
          >
            <FiArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>

          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Privacy Policy
          </h1>
          <p className="text-xl text-[#b8f2ff] mb-2">
            for Mementum.ai – Quick Notes
          </p>
          <p className="text-[#9ca3af]">Last updated: July 4, 2025</p>
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative group"
            >
              <div
                className="p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 group-hover:border-[#a18aff]/40"
                style={{
                  background: "rgba(24, 27, 58, 0.8)",
                  borderColor: "rgba(111, 234, 255, 0.2)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                      boxShadow: "0 4px 16px rgba(161, 138, 255, 0.3)",
                    }}
                  >
                    <div className="text-white">{section.icon}</div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {section.title}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="relative z-10">{section.content}</div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#a18aff]/5 to-[#6feaff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.section>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div
            className="p-8 rounded-2xl border backdrop-blur-sm"
            style={{
              background: "rgba(24, 27, 58, 0.8)",
              borderColor: "rgba(111, 234, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Contact</h3>
            <p className="text-[#d1d5db] mb-6">
              If you have any questions about this privacy policy, please
              contact us at:
            </p>
            <motion.a
              href="mailto:support@mementum.pro"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #a18aff 0%, #6feaff 100%)",
                color: "white",
                boxShadow: "0 8px 32px rgba(161, 138, 255, 0.4)",
              }}
            >
              <FiMail size={24} />
              support@mementum.pro
            </motion.a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-center text-[#9ca3af] text-sm"
        >
          <p>© 2025 Mementum.ai. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
