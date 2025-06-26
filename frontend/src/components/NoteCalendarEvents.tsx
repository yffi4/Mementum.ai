import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Zap, RefreshCw } from "lucide-react";
import { authApi, type NoteCalendarEvent } from "../services/authApi";

interface NoteCalendarEventsProps {
  noteId: number;
  noteTitle: string;
}

const NoteCalendarEvents: React.FC<NoteCalendarEventsProps> = ({
  noteId,
  noteTitle,
}) => {
  const [events, setEvents] = useState<NoteCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadEvents();
  }, [noteId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await authApi.getNoteCalendarEvents(noteId);
      setEvents(response.events);
      setError("");
    } catch (err) {
      setError("Failed to load calendar events");
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      await authApi.analyzeNoteForCalendar(noteId);
      await loadEvents(); // Reload events after analysis
      setError("");
    } catch (err) {
      setError("Failed to analyze note for calendar events");
      console.error("Error analyzing note:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && events.length === 0) {
    return (
      <div className="bg-dark-800 rounded-lg p-4 border border-purple-500/20">
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Loading calendar events...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-lg p-4 border border-purple-500/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">
            Calendar Events
          </span>
          {events.length > 0 && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
              {events.length}
            </span>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 
                     text-purple-300 rounded-lg transition-colors text-sm disabled:opacity-50"
          title="Analyze note for calendar events"
        >
          {analyzing ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Zap className="w-3 h-3" />
          )}
          {analyzing ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-xs">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-gray-400 text-xs">
          No calendar events found for this note. Click "Analyze" to check for
          dates and meetings.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-700 rounded-lg p-3 border border-green-500/20"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-white">
                  {event.title}
                </h4>
                {event.created_by_ai && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    AI Created
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>
                    {formatDateTime(event.start_datetime)}
                    {!event.is_all_day &&
                      ` - ${formatDateTime(event.end_datetime)}`}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-purple-400" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.description && (
                  <div className="mt-2 text-gray-400 text-xs">
                    {event.description}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default NoteCalendarEvents;
