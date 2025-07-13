"use client";

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthNav from "../components/AuthNav";
import NeonBackground from "../components/NeonBackground";
import CookieConsent from "../components/CookieConsent";
import "../styles/LandingPage.css";

const TITLE = "Mementum.ai - Quick Notes";
const SUBTITLE =
  "Never forget important information again with AI-powered note organization";
const PLACEHOLDER = "Select text from any webpage...";
const TRY_LABEL = "Try it now";

const FEATURES = [
  {
    title: "Smart Text Capture",
    desc: "Select any text on the web and instantly save it to your organized knowledge base.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-cyan-300"
      >
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    title: "AI Enhancement",
    desc: "AI automatically adds context, related information, and useful links to your saved content.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-purple-300"
      >
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 1v6m0 6v6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M21 12h-6m-6 0H3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Auto-Categorization",
    desc: "Notes are automatically sorted by categories and importance levels for easy retrieval.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-cyan-300"
      >
        <path
          d="M22 12h-4l-3 9L9 3l-3 9H2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Chrome Extension",
    desc: "Seamlessly capture information while browsing with our powerful Chrome extension.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-purple-300"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M21.17 8a3 3 0 0 0-6.15-2.15A3 3 0 0 0 8 5.17a3 3 0 0 0-2.15 6.15A3 3 0 0 0 5.17 16a3 3 0 0 0 6.15 2.15A3 3 0 0 0 16 18.83a3 3 0 0 0 2.15-6.15A3 3 0 0 0 21.17 8z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
];

const DEMO_TEXTS = [
  "Machine learning algorithms can be categorized into supervised and unsupervised learning...",
  "The key to successful project management is clear communication and defined milestones...",
  "React hooks provide a more functional approach to state management in components...",
  "Climate change impacts include rising sea levels and extreme weather patterns...",
];

function useTypewriter(texts: string[], speed = 100) {
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [isCreatingNote, setIsCreatingNote] = React.useState(false);
  const [showResult, setShowResult] = React.useState(false);

  React.useEffect(() => {
    if (!isTyping) return;

    const text = texts[currentTextIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setCurrentText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setIsCreatingNote(true);
          setTimeout(() => {
            setIsCreatingNote(false);
            setShowResult(true);
            setTimeout(() => {
              setShowResult(false);
              setCurrentText("");
              setCurrentTextIndex((prev) => (prev + 1) % texts.length);
              setTimeout(() => setIsTyping(true), 2000);
            }, 3000);
          }, 2000);
        }, 1000);
      }
    }, speed);

    return () => clearInterval(typeInterval);
  }, [texts, currentTextIndex, speed, isTyping]);

  React.useEffect(() => {
    const startDelay = setTimeout(() => {
      setIsTyping(true);
    }, 2000);
    return () => clearTimeout(startDelay);
  }, []);

  return { currentText, isCreatingNote, showResult };
}

function useFadeIn(delay = 0) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return show;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const showHero = useFadeIn(100);
  const showInput = useFadeIn(600);
  const showFeatures = useFadeIn(1100);
  const showAppInfo = useFadeIn(1600);

  const { currentText, isCreatingNote, showResult } = useTypewriter(
    DEMO_TEXTS,
    80
  );

  return (
    <div className="app">
      <div className="background">
        <NeonBackground />
      </div>
      <div>
        <AuthNav />
      </div>
      <main className="main">
        {/* Hero Section */}
        <h1 className={`title ${showHero ? "show" : ""}`} data-text={TITLE}>
          {TITLE}
        </h1>
        <p className={`subtitle ${showHero ? "show" : ""}`}>{SUBTITLE}</p>

        {/* Interactive Demo */}
        <div className={`input-section ${showInput ? "show" : ""}`}>
          <div
            className={`input-container ${isCreatingNote ? "creating" : ""}`}
          >
            <span className="input-icon">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <input
              className="text-input"
              value={currentText}
              placeholder={currentText ? "" : PLACEHOLDER}
              readOnly
            />
            <div className="button-container">
              {isCreatingNote ? (
                <div className="creating-button">
                  <svg className="spinner" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    />
                  </svg>
                  Processing with AI...
                </div>
              ) : (
                <button
                  className="try-button"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  <span className="button-text">{TRY_LABEL}</span>
                </button>
              )}
            </div>
          </div>

          {showResult && (
            <div className="result-card">
              <div className="result-content">
                <div className="result-indicator"></div>
                <div>
                  <h3 className="result-title">
                    ✨ Note Enhanced Successfully!
                  </h3>
                  <div className="result-details">
                    <p>
                      <span className="result-label purple">📝 Category:</span>{" "}
                      Technology/Learning
                    </p>
                    <p>
                      <span className="result-label cyan">⭐ Importance:</span>{" "}
                      High (8/10)
                    </p>
                    <p>
                      <span className="result-label green">🔗 AI Added:</span> 3
                      related links and context
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className={`features-grid ${showFeatures ? "show" : ""}`}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <span className="feature-title">{f.title}</span>
                <span className="feature-desc">{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* App Information Section - Required by Google */}
        <div className={`app-info-section ${showAppInfo ? "show" : ""}`}>
          <div className="app-info-container">
            <h2 className="app-info-title">About Mementum.ai - Quick Notes</h2>

            {/* App Description */}
            <div className="app-description">
              <h3>What is Mementum.ai - Quick Notes?</h3>
              <p>
                Mementum.ai - Quick Notes is a revolutionary web application
                with generative AI that solves the universal problem of
                forgetting important information. Whether you're researching
                online, preparing for exams, or reading articles, our platform
                ensures you never lose valuable insights again.
              </p>
              <p>
                The application allows you to capture important data in notes
                that are automatically processed by AI, categorized by topic,
                and ranked by importance level, creating an intelligent
                knowledge management system.
              </p>
            </div>

            {/* Core Functionality */}
            <div className="app-functionality">
              <h3>Core Functionality</h3>
              <ul>
                <li>
                  <strong>🌐 Chrome Extension:</strong> Our flagship feature - a
                  Chrome extension that allows you to select and save any text
                  from web pages instantly
                </li>
                <li>
                  <strong>🤖 AI Enhancement:</strong> AI automatically enriches
                  your saved content with additional context, related
                  information, and useful links on the same topic
                </li>
                <li>
                  <strong>📂 Smart Categorization:</strong> Notes are
                  automatically organized into relevant categories for easy
                  navigation
                </li>
                <li>
                  <strong>⭐ Importance Ranking:</strong> AI assigns importance
                  levels (1-10) to help you prioritize your knowledge
                </li>
                <li>
                  <strong>🔍 Intelligent Search:</strong> Find your notes
                  quickly with semantic search capabilities
                </li>
                <li>
                  <strong>📱 Cross-Platform Access:</strong> Access your
                  organized knowledge from web, mobile, and browser extension
                </li>
                <li>
                  <strong>📅 Calendar Integration:</strong> We use Google
                  Calendar events scope to help you organize study schedules and
                  review sessions
                </li>
              </ul>
            </div>

            {/* Chrome Extension Highlight */}
            <div className="chrome-extension-section">
              <h3>🚀 Chrome Extension - The Game Changer</h3>
              <p>
                The main feature for research and smart internet browsing is our
                Chrome extension. It transforms how you consume information
                online by allowing you to:
              </p>
              <ul>
                <li>Select any text on any webpage and save it instantly</li>
                <li>
                  Let AI automatically add context and related information
                </li>
                <li>
                  Get useful links and resources attached to your saved content
                </li>
                <li>Build a comprehensive knowledge base while browsing</li>
              </ul>
              <div className="chrome-store-link">
                <a
                  href="https://chromewebstore.google.com/detail/mementumai-quick-notes/mfgdogmepogfbcoopjiioabdfmfkkjan?authuser=0&hl=ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chrome-btn"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169-.331-.353-.651-.551-.962.551.015 1.085.078 1.588.182-.188.255-.389.5-.603.734-.22.253-.454.49-.703.712l.269.334zM12 2.25c1.47 0 2.849.319 4.094.894-.394.643-.803 1.265-1.223 1.863-.42-.598-.829-1.22-1.223-1.863C13.849 2.569 12.47 2.25 12 2.25zm-5.568 5.91c-.169.331-.353.651-.551.962-.551-.015-1.085-.078-1.588-.182.188-.255.389-.5.603-.734.22-.253.454-.49.703-.712l-.167-.334z" />
                  </svg>
                  Install Chrome Extension
                </a>
              </div>
            </div>

            {/* Data Usage Transparency */}
            <div className="data-usage">
              <h3>Data Collection & Usage Transparency</h3>
              <p>
                <strong>What data we collect:</strong>
              </p>
              <ul>
                <li>
                  Account information (email, username) for authentication via
                  Google OAuth
                </li>
                <li>
                  Text content that you explicitly select and choose to save
                  from web pages
                </li>
                <li>
                  Google Calendar events data (calendar.events scope) to help
                  organize your study and review schedules
                </li>
                <li>
                  Usage analytics to improve our AI models and user experience
                  (anonymized)
                </li>
              </ul>
              <p>
                <strong>Why we collect this data:</strong>
              </p>
              <ul>
                <li>
                  To provide AI-powered content enhancement and organization
                </li>
                <li>To sync your notes and knowledge base across devices</li>
                <li>
                  To integrate with your calendar for better learning schedule
                  management
                </li>
                <li>
                  To improve our AI algorithms and provide better categorization
                </li>
                <li>To provide customer support when needed</li>
              </ul>
              <p>
                <strong>Calendar Events Scope Usage:</strong> We access your
                Google Calendar events to help you schedule study sessions, set
                review reminders for your saved notes, and organize your
                learning timeline. This integration is optional and can be
                disabled at any time.
              </p>
              <p>
                <strong>Your data rights:</strong> You can export, delete, or
                modify your data at any time. We never sell your personal
                information to third parties. All data is encrypted and stored
                securely.
              </p>
            </div>

            {/* Company Information */}
            <div className="company-info">
              <h3>About Our Company</h3>
              <p>
                Mementum.ai is developed by a team passionate about solving the
                universal problem of information retention and knowledge
                management. We believe that in our information-rich world, the
                ability to capture, organize, and retrieve knowledge efficiently
                is crucial for personal and professional success.
              </p>
              <p>
                Our mission is to help users build comprehensive, AI-enhanced
                knowledge bases that grow smarter over time, turning scattered
                information into organized wisdom.
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href="https://mementum.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  mementum.pro
                </a>
                <br />
                <strong>Contact:</strong> ikulesh200515@gmail.com
                <br />
                <strong>Chrome Extension:</strong>{" "}
                <a
                  href="https://chromewebstore.google.com/detail/mementumai-quick-notes/mfgdogmepogfbcoopjiioabdfmfkkjan?authuser=0&hl=ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Chrome Web Store
                </a>
              </p>
            </div>

            {/* Privacy Policy Link */}
            <div className="privacy-links">
              <h3>Privacy & Legal</h3>
              <div className="legal-links">
                <Link to="/privacy-policy" className="legal-link">
                  🔒 Privacy Policy
                </Link>
              </div>
              <p className="privacy-note">
                Our privacy policy explains in detail how we collect, use, and
                protect your data, including our use of Google Calendar events
                scope. Please review it before using our services.
              </p>
            </div>

            {/* Security & Compliance */}
            <div className="security-info">
              <h3>Security & Compliance</h3>
              <ul>
                <li>
                  🔐 End-to-end encryption for all user data and saved content
                </li>
                <li>🛡️ Google OAuth 2.0 secure authentication</li>
                <li>🌍 GDPR and CCPA compliant data handling</li>
                <li>
                  🔒 Regular security audits and vulnerability assessments
                </li>
                <li>
                  📱 Secure API endpoints with rate limiting and monitoring
                </li>
                <li>
                  📅 Secure Google Calendar API integration with minimal
                  required permissions
                </li>
              </ul>
            </div>

            {/* Call to Action */}
            <div className="cta-section">
              <h3>Ready to Never Forget Again?</h3>
              <p>
                Join thousands of researchers, students, and professionals who
                have transformed their information management with AI-powered
                note organization. Start building your intelligent knowledge
                base today.
              </p>
              <div className="cta-buttons">
                <button
                  className="cta-primary"
                  onClick={() => navigate("/register")}
                >
                  Start Free Account
                </button>
                <a
                  href="https://chromewebstore.google.com/detail/mementumai-quick-notes/mfgdogmepogfbcoopjiioabdfmfkkjan?authuser=0&hl=ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-secondary"
                >
                  Install Extension
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with essential links only */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Mementum.ai - Quick Notes</h4>
            <p>
              Never forget important information again with AI-powered note
              organization.
            </p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <a
              href="https://chromewebstore.google.com/detail/mementumai-quick-notes/mfgdogmepogfbcoopjiioabdfmfkkjan?authuser=0&hl=ru"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chrome Extension
            </a>
            <Link to="/onboarding">How it Works</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <a href="mailto:ikulesh200515@gmail.com">Contact Support</a>
            <a
              href="https://mementum.pro"
              target="_blank"
              rel="noopener noreferrer"
            >
              Main Website
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Mementum.ai. All rights reserved.</p>
          <p>Transform information into knowledge 🧠✨</p>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent
        onAccept={() => {
          console.log("Landing page: Cookies accepted");
        }}
        onDecline={() => {
          console.log("Landing page: Cookies declined");
        }}
      />
    </div>
  );
};

export default LandingPage;
