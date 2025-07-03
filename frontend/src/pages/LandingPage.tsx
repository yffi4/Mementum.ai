import React from "react";
import { useNavigate } from "react-router-dom";
import AuthNav from "../components/AuthNav";
import NeonBackground from "../components/NeonBackground";
import "../styles/LandingPage.css";

const TITLE = "Mementum.ai";
const SUBTITLE = "AI-powered structured notes for your mind.";
const PLACEHOLDER = "Type your thought...";
const TRY_LABEL = "Try it now";

const FEATURES = [
  {
    title: "AI Structuring",
    desc: "Turn messy thoughts into organized, actionable notes in seconds.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-cyan-300"
      >
        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="16" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="16" r="2" stroke="currentColor" strokeWidth="2" />
        <path d="M12 11v2" stroke="currentColor" strokeWidth="2" />
        <path d="M10 15l2-2" stroke="currentColor" strokeWidth="2" />
        <path d="M14 15l-2-2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Smart Search",
    desc: "Find any idea instantly with semantic and tag-based search.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-purple-300"
      >
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
        <path d="M9 9l6 6" stroke="currentColor" strokeWidth="2" />
        <path d="M15 9l-6 6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Cross-Platform",
    desc: "Access your notes anywhere: web, mobile, and soon as a Chrome extension.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-cyan-300"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 20h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Privacy First",
    desc: "Your data is encrypted and never sold. You control your knowledge.",
    icon: (
      <svg
        width="36"
        height="36"
        fill="none"
        viewBox="0 0 24 24"
        className="text-purple-300"
      >
        <path
          d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const DEMO_TEXTS = [
  "I need to organize my thoughts about the new project...",
  "Remember to call mom about dinner plans",
  "Ideas for improving team productivity",
  "Research notes on AI and machine learning trends",
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
        <h1 className={`title ${showHero ? "show" : ""}`} data-text={TITLE}>
          {TITLE}
        </h1>
        <p className={`subtitle ${showHero ? "show" : ""}`}>{SUBTITLE}</p>
        <div className={`input-section ${showInput ? "show" : ""}`}>
          <div
            className={`input-container ${isCreatingNote ? "creating" : ""}`}
          >
            <span className="input-icon">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 2a10 10 0 100 20 10 10 0 000-20z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 12h8M12 8v8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
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
                  Creating...
                </div>
              ) : (
                <button className="try-button">
                  <span
                    className="button-text"
                    onClick={() => {
                      navigate("/login");
                    }}
                  >
                    {TRY_LABEL}
                  </span>
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
                    ✨ Note Created Successfully!
                  </h3>
                  <div className="result-details">
                    <p>
                      <span className="result-label purple">📝 Title:</span>{" "}
                      {DEMO_TEXTS[0].split(" ").slice(0, 4).join(" ")}...
                    </p>
                    <p>
                      <span className="result-label cyan">🏷️ Tags:</span>{" "}
                      #productivity #planning #ideas
                    </p>
                    <p>
                      <span className="result-label green">
                        🔗 Connections:
                      </span>{" "}
                      3 related notes found
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
      </main>
    </div>
  );
};

export default LandingPage;
