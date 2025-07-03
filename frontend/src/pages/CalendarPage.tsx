import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { authApi } from "../services/authApi";
import GoogleAuth from "../components/GoogleAuth";
import Navbar from "../components/Navbar";
import NeonBackground from "../components/NeonBackground";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
  Star,
} from "lucide-react";

const localizer = momentLocalizer(moment);

interface ExtendedEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  html_link?: string;
  isFromNote?: boolean;
  noteId?: number;
}

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ExtendedEvent | null>(
    null
  );
  const [showEventModal, setShowEventModal] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkConnectionAndLoadData();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await authApi.getAuthStatus();
      setUser(response.user);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const checkConnectionAndLoadData = async () => {
    try {
      const status = await authApi.getAuthStatus();
      setIsConnected(status.user.google_connected);

      if (status.user.google_connected) {
        await Promise.all([loadCalendarEvents(), loadUserInfo()]);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const calendarEvents = await authApi.getCalendarEvents({
        max_results: 50,
        time_min: moment().startOf("month").toISOString(),
        time_max: moment().endOf("month").add(1, "month").toISOString(),
      });

      const formattedEvents: ExtendedEvent[] = calendarEvents.map((event) => ({
        id: event.id,
        title: event.summary || "Untitled Event",
        start: new Date(event.start.dateTime ?? event.start.date ?? ""),
        end: new Date(event.end.dateTime ?? event.end.date ?? ""),
        location: event.location,
        description: event.description,
        html_link: event.html_link,
        isFromNote: false,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error loading calendar events:", error);
    }
  };

  const loadUserInfo = async () => {
    try {
      const info = await authApi.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  };

  const handleEventClick = (event: ExtendedEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCreateEvent = async (slotInfo: any) => {
    const title = prompt("Enter event title:");
    if (!title) return;

    try {
      const eventData = {
        summary: title,
        start: { dateTime: moment(slotInfo.start).toISOString() },
        end: { dateTime: moment(slotInfo.end).toISOString() },
        description: "Created from calendar",
      } as any;

      await authApi.createCalendarEvent(eventData);
      await loadCalendarEvents();
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const EventModal = () => {
    if (!selectedEvent) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setShowEventModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-dark-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-purple-500/20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              Event Details
            </h3>
            {selectedEvent.isFromNote && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs flex items-center gap-1">
                <Star className="w-3 h-3" />
                From Note
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-white">
                {selectedEvent.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>
                {moment(selectedEvent.start).format("MMM DD, YYYY - HH:mm")} -
                {moment(selectedEvent.end).format("HH:mm")}
              </span>
            </div>

            {selectedEvent.location && (
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{selectedEvent.location}</span>
              </div>
            )}

            {selectedEvent.description && (
              <div>
                <h5 className="text-sm font-semibold text-gray-400 mb-1">
                  Description
                </h5>
                <p className="text-gray-300 text-sm">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {selectedEvent.html_link && (
              <a
                href={selectedEvent.html_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open in Google Calendar
              </a>
            )}
          </div>

          <button
            onClick={() => setShowEventModal(false)}
            className="w-full mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="page-bg relative overflow-hidden">
        <NeonBackground />
        <Navbar user={user} />
        <div className="pt-32 min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading calendar...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="page-bg relative overflow-hidden">
        <NeonBackground />
        <Navbar user={user} />
        <div className="pt-32 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-purple-400" />
              Calendar Integration
            </h1>
            <GoogleAuth onConnectionChange={checkConnectionAndLoadData} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg relative overflow-hidden">
      <NeonBackground />
      <Navbar user={user} />
      <div className="pt-32 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-purple-400" />
              Calendar
            </h1>
            {userInfo && (
              <div className="flex items-center gap-3 text-gray-300">
                <span>Welcome, {userInfo.name}</span>
                {userInfo.picture && (
                  <img
                    src={userInfo.picture}
                    alt={userInfo.name}
                    className="w-8 h-8 rounded-full border-2 border-purple-500"
                  />
                )}
              </div>
            )}
          </div>

          <div className="bg-dark-800 rounded-2xl p-6 border border-purple-500/20">
            <div className="mb-6">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Regular Events
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Created from Notes
                </div>
              </div>
            </div>

            <div className="h-[600px] bg-white rounded-lg">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleEventClick}
                onSelectSlot={handleCreateEvent}
                selectable
                style={{
                  height: "100%",
                  backgroundColor: "white",
                }}
                eventPropGetter={(event: ExtendedEvent) => ({
                  style: {
                    backgroundColor: event.isFromNote ? "#10b981" : "#3b82f6",
                    borderColor: event.isFromNote ? "#059669" : "#2563eb",
                    color: "white",
                  },
                })}
              />
            </div>
          </div>

          {showEventModal && <EventModal />}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
