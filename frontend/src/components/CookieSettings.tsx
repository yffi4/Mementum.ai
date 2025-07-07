import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiShield, FiSettings, FiInfo, FiCheck, FiX } from "react-icons/fi";
import { useCookieConsent } from "../hooks/useCookieConsent";

interface CookieSettingsProps {
  className?: string;
}

const CookieSettings: React.FC<CookieSettingsProps> = ({ className = "" }) => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    consentStatus,
    consentDate,
    acceptCookies,
    declineCookies,
    resetConsent,
    getConsentData,
  } = useCookieConsent();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = () => {
    switch (consentStatus) {
      case "accepted":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "declined":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    }
  };

  const getStatusIcon = () => {
    switch (consentStatus) {
      case "accepted":
        return <FiCheck size={16} />;
      case "declined":
        return <FiX size={16} />;
      default:
        return <FiInfo size={16} />;
    }
  };

  return (
    <div className={`cookie-settings ${className}`}>
      <div
        className="p-6 rounded-xl border backdrop-blur-sm"
        style={{
          background: "rgba(24, 27, 58, 0.8)",
          borderColor: "rgba(111, 234, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-purple-500/30">
            <FiShield className="text-cyan-300" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Cookie Preferences
              <FiSettings size={16} className="text-gray-400" />
            </h3>
            <p className="text-sm text-gray-400">
              Manage your cookie and privacy settings
            </p>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">
              Current Status:
            </span>
            <div
              className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getStatusColor()}`}
            >
              {getStatusIcon()}
              {consentStatus
                ? consentStatus.charAt(0).toUpperCase() + consentStatus.slice(1)
                : "Not Set"}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {formatDate(consentDate)}
          </div>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-300 transition-colors mb-4"
        >
          <FiInfo size={14} />
          {showDetails ? "Hide details" : "What cookies do we use?"}
        </button>

        {/* Details Section */}
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-cyan-300 mb-2">
                  Essential Cookies
                </h4>
                <p className="text-xs text-gray-400 mb-2">
                  Required for the website to function properly.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Authentication tokens</li>
                  <li>• Session management</li>
                  <li>• Security features</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-2">
                  Analytics Cookies
                </h4>
                <p className="text-xs text-gray-400 mb-2">
                  Help us understand how you use our service.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Usage statistics</li>
                  <li>• Performance metrics</li>
                  <li>• Anonymous user behavior</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-lg transition-all duration-200"
          >
            Decline Optional
          </button>
          <button
            onClick={acceptCookies}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            Accept All
          </button>
        </div>

        {/* Reset Option */}
        {consentStatus && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={resetConsent}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Reset preferences
            </button>
          </div>
        )}

        {/* Debug Info (только в development) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-xs">
            <summary className="text-gray-500 cursor-pointer hover:text-gray-300">
              Debug Info
            </summary>
            <pre className="mt-2 p-2 bg-black/20 rounded text-gray-400 text-xs overflow-x-auto">
              {JSON.stringify(getConsentData(), null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default CookieSettings;
