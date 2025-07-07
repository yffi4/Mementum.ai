import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiX, FiInfo } from "react-icons/fi";
import { useCookieConsent } from "../hooks/useCookieConsent";

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({
  onAccept,
  onDecline,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { hasGivenConsent, acceptCookies, declineCookies, isConsentExpired } =
    useCookieConsent();

  useEffect(() => {
    // Показываем banner если пользователь не дал согласие или согласие истекло
    if (!hasGivenConsent() || isConsentExpired()) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasGivenConsent, isConsentExpired]);

  const handleAccept = () => {
    acceptCookies();
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    declineCookies();
    setIsVisible(false);
    onDecline?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center p-4 pointer-events-none"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={handleDismiss}
        />

        {/* Cookie Banner */}
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg pointer-events-auto"
        >
          <div
            className="cookie-consent-card"
            style={{
              background: "rgba(24, 27, 58, 0.98)",
              border: "1.5px solid rgba(111, 234, 255, 0.4)",
              borderRadius: "1.25rem",
              padding: "1.5rem",
              boxShadow:
                "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(111, 234, 255, 0.1) inset",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <FiX size={16} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
                <FiShield className="text-cyan-300" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Cookie Preferences
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  We use cookies to enhance your experience and analyze usage.
                </p>
              </div>
            </div>

            {/* Details section */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="text-sm font-medium text-cyan-300 mb-2">
                      What we collect:
                    </h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Analytics data to improve our service</li>
                      <li>• Authentication tokens for login sessions</li>
                      <li>• User preferences and settings</li>
                      <li>• Anonymous usage statistics</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-500">
                        Your privacy is important to us. You can change your
                        preferences anytime.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {/* Info toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-cyan-300 transition-colors self-start mb-2"
              >
                <FiInfo size={12} />
                {showDetails ? "Hide details" : "Learn more"}
              </button>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDecline}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  Accept All
                </button>
              </div>
            </div>

            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-[1.25rem] opacity-50 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(161, 138, 255, 0.1) 0%, rgba(111, 234, 255, 0.1) 100%)",
                filter: "blur(1px)",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
