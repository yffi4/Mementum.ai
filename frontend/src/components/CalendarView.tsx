import React, { useState, useEffect } from "react";
import {
  calendarApiService,
  type CalendarEvent,
  type Calendar,
} from "../services/calendarApi";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiPlus,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiSettings,
} from "react-icons/fi";

const CALENDAR_COLORS = {
  primary: "#a18aff",
  secondary: "#6feaff",
  accent: "#ff6b81",
  success: "#4ade80",
  warning: "#fbbf24",
  info: "#3b82f6",
};

interface CalendarViewProps {
  isAuthenticated: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ isAuthenticated }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendars, setSelectedCalendars] = useState<Set<string>>(
    new Set(["primary"])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day" | "list">(
    "month"
  );
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadCalendars();
      loadEvents();
    }
  }, [isAuthenticated, currentDate, selectedCalendars]);

  const loadCalendars = async () => {
    try {
      const calendarList = await calendarApiService.getCalendars();
      setCalendars(calendarList);
    } catch (err) {
      console.error("Failed to load calendars:", err);
      setError("Failed to load calendars");
    }
  };

  const loadEvents = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError("");

    try {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const allEvents: CalendarEvent[] = [];

      for (const calendarId of selectedCalendars) {
        const calendarEvents = await calendarApiService.getEvents(
          calendarId,
          startOfMonth.toISOString(),
          endOfMonth.toISOString()
        );
        allEvents.push(...calendarEvents);
      }

      // Sort events by start time
      allEvents.sort((a, b) => {
        const startA = new Date(a.start.dateTime || a.start.date || "");
        const startB = new Date(b.start.dateTime || b.start.date || "");
        return startA.getTime() - startB.getTime();
      });

      setEvents(allEvents);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const formatEventTime = (event: CalendarEvent): string => {
    if (calendarApiService.isAllDayEvent(event)) {
      return "All day";
    }

    const start = calendarApiService.formatEventDateTime(
      event.start.dateTime || event.start.date || "",
      event.start.timeZone
    );
    const end = calendarApiService.formatEventDateTime(
      event.end.dateTime || event.end.date || "",
      event.end.timeZone
    );

    return `${start} - ${end}`;
  };

  const getEventColor = (event: CalendarEvent): string => {
    const colorMap: { [key: string]: string } = {
      "1": CALENDAR_COLORS.info,
      "2": CALENDAR_COLORS.success,
      "3": CALENDAR_COLORS.primary,
      "4": CALENDAR_COLORS.accent,
      "5": CALENDAR_COLORS.warning,
      "6": CALENDAR_COLORS.secondary,
    };

    return colorMap[event.colorId || "1"] || CALENDAR_COLORS.primary;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendars((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(calendarId)) {
        newSet.delete(calendarId);
      } else {
        newSet.add(calendarId);
      }
      return newSet;
    });
  };

  const renderCalendarGrid = () => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter((event) => {
        const eventDate = new Date(
          event.start.dateTime || event.start.date || ""
        );
        return eventDate.toDateString() === currentDateObj.toDateString();
      });

      days.push({
        date: new Date(currentDateObj),
        events: dayEvents,
        isCurrentMonth: currentDateObj.getMonth() === currentDate.getMonth(),
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
      });

      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-400"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-24 p-1 border border-white/5 rounded-lg ${
              day.isCurrentMonth ? "bg-white/5" : "bg-white/2"
            } ${day.isToday ? "ring-2 ring-neon-purple/50" : ""}`}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                day.isCurrentMonth ? "text-white" : "text-gray-500"
              } ${day.isToday ? "text-neon-purple" : ""}`}
            >
              {day.date.getDate()}
            </div>

            <div className="space-y-1">
              {day.events.slice(0, 3).map((event, eventIndex) => (
                <div
                  key={eventIndex}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                  className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
                  style={{
                    backgroundColor: getEventColor(event) + "40",
                    color: getEventColor(event),
                  }}
                >
                  {event.summary}
                </div>
              ))}
              {day.events.length > 3 && (
                <div className="text-xs text-gray-400">
                  +{day.events.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventsList = () => {
    const today = new Date();
    const upcomingEvents = events
      .filter((event) => {
        const eventDate = new Date(
          event.start.dateTime || event.start.date || ""
        );
        return eventDate >= today;
      })
      .slice(0, 10);

    return (
      <div className="space-y-3">
        {upcomingEvents.map((event, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedEvent(event);
              setShowEventModal(true);
            }}
            className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-neon-purple/30 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: getEventColor(event) }}
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">
                  {event.summary}
                </h3>

                <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                  <FiClock className="w-4 h-4" />
                  <span>{formatEventTime(event)}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                    <FiMapPin className="w-4 h-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-300">
                    <FiUsers className="w-4 h-4" />
                    <span>{event.attendees.length} attendees</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {upcomingEvents.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <FiCalendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No upcoming events</p>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <FiCalendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Calendar Not Connected
        </h3>
        <p className="text-gray-300">
          Please sign in with Google to view your calendar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
            Calendar
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-4 py-2 text-white font-medium">
              {currentDate.toLocaleDateString("ru-RU", {
                month: "long",
                year: "numeric",
              })}
            </span>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadEvents}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white disabled:opacity-50"
            title="Refresh"
          >
            <FiRefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          <div className="flex rounded-lg bg-white/5 p-1">
            {(["month", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-neon-purple text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Calendar Filters */}
      {calendars.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <FiFilter className="w-5 h-5 text-gray-300" />
            <span className="font-medium text-white">Calendars</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {calendars.map((calendar) => (
              <button
                key={calendar.id}
                onClick={() => toggleCalendar(calendar.id)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedCalendars.has(calendar.id)
                    ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                    : "bg-white/5 text-gray-300 border border-white/10 hover:border-white/20"
                }`}
              >
                {calendar.summary}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Content */}
      <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-purple"></div>
          </div>
        ) : viewMode === "month" ? (
          renderCalendarGrid()
        ) : (
          renderEventsList()
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl border border-white/10 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white pr-4">
                {selectedEvent.summary}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <FiClock className="w-5 h-5" />
                <span>{formatEventTime(selectedEvent)}</span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-3 text-gray-300">
                  <FiMapPin className="w-5 h-5" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.description && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {selectedEvent.attendees &&
                selectedEvent.attendees.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <FiUsers className="w-5 h-5 text-gray-300" />
                      <span className="font-medium text-white">Attendees</span>
                    </div>
                    <div className="space-y-1">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <div key={index} className="text-sm text-gray-300">
                          {attendee.displayName || attendee.email}
                          {attendee.responseStatus && (
                            <span
                              className={`ml-2 px-2 py-1 rounded text-xs ${
                                attendee.responseStatus === "accepted"
                                  ? "bg-green-500/20 text-green-300"
                                  : attendee.responseStatus === "declined"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                              }`}
                            >
                              {attendee.responseStatus}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
