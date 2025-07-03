import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { authApi, type AuthStatus } from "../services/authApi";

interface GoogleAuthProps {
  onConnectionChange?: () => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onConnectionChange }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const status = await authApi.getAuthStatus();
      setAuthStatus(status);
      setError("");
    } catch (err) {
      setError("Failed to check authentication status");
      console.error("Auth status error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      await authApi.getGoogleAuthUrl();
    } catch (err) {
      setError("Failed to initiate Google connection");
      console.error("Google connect error:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await authApi.disconnectGoogle();
      await checkAuthStatus();
      if (onConnectionChange) {
        onConnectionChange();
      }
    } catch (err) {
      setError("Failed to disconnect Google account");
      console.error("Disconnect error:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-2xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-gray-300">Checking connection...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-2xl p-6 border border-purple-500/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">
          Google Calendar Integration
        </h3>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </motion.div>
      )}

      {authStatus?.user.google_connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">
              Connected to Google Calendar
            </span>
          </div>

          {authStatus.user.google_name && (
            <div className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg">
              {authStatus.user.google_picture && (
                <img
                  src={authStatus.user.google_picture}
                  alt={authStatus.user.google_name}
                  className="w-12 h-12 rounded-full border-2 border-purple-500"
                />
              )}
              <div>
                <h4 className="text-white font-medium">
                  {authStatus.user.google_name}
                </h4>
                <p className="text-gray-400 text-sm">{authStatus.user.email}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDisconnect}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Disconnect Google Account
            </button>
            <button
              onClick={checkAuthStatus}
              className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          {authStatus.google_token_expires && (
            <p className="text-gray-400 text-sm">
              Token expires:{" "}
              {new Date(authStatus.google_token_expires).toLocaleString()}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-300 text-sm">
              Connect your Google account to view and manage your calendar
              events. This will allow the AI to automatically create calendar
              events from your notes.
            </p>
          </div>

          <button
            onClick={handleGoogleConnect}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                       text-white py-3 px-6 rounded-lg transition-all duration-300 font-medium 
                       flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Connect with Google
          </button>

          <div className="space-y-2 text-gray-400 text-sm">
            <h4 className="font-medium text-white">What you'll get:</h4>
            <ul className="space-y-1 ml-4">
              <li>• Automatic calendar event creation from notes</li>
              <li>• View your existing calendar events</li>
              <li>• Create new events directly from the calendar</li>
              <li>• AI-powered date and time detection</li>
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GoogleAuth;
