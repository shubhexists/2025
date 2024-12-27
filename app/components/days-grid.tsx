"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DateInfo {
  date: Date;
  dayOfWeek: string;
  dayOfYear: number;
}

interface Event {
  id: string;
  date: Date;
  title: string;
  description: string;
}

interface NewEvent {
  title: string;
  description: string;
}

export default function DaysGrid(): JSX.Element {
  const totalDays = 365;
  const columns = 20;
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [dateInfo, setDateInfo] = useState<DateInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    description: "",
  });
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const startDate = new Date(2025, 0, 1);
  const now = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const currentDate = formatter.format(now);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(
            data.map((event: any) => ({
              ...event,
              date: new Date(event.date),
            }))
          );
        } else {
          console.error("Failed to fetch events");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  const handleAddEvent = async (): Promise<void> => {
    if (newEvent.title.trim() && selectedDate) {
      if (password !== process.env.NEXT_PUBLIC_PASSWORD) {
        setErrorMessage("Incorrect password. Please try again.");
        setPassword("");
        return;
      }

      let nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const event = {
        id: crypto.randomUUID(),
        date: nextDate.toISOString().split("T")[0],
        title: newEvent.title,
        description: newEvent.description,
      };

      try {
        const response = await fetch("/api/events/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        if (response.ok) {
          setEvents([...events, { ...event, date: new Date(event.date) }]);
          setNewEvent({ title: "", description: "" });
          setPassword("");
          setIsDialogOpen(false);
          setErrorMessage(null);
          setIsDialogOpen(false);
        } else {
          console.error("Failed to add event");
        }
      } catch (err) {
        console.error("Error adding event:", err);
      }
    }
  };

  const upcomingEvents = events
    .filter((event) => event.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent): void => {
      setMousePos({ x: event.clientX, y: event.clientY });
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cellWidth = rect.width / columns;
        const cellHeight = cellWidth;
        const row = Math.floor(y / cellHeight);
        const col = Math.floor(x / cellWidth);
        const index = row * columns + col;

        if (index < totalDays) {
          setHighlightedIndex(index);
          const date = new Date(startDate);
          date.setDate(date.getDate() + index);
          setDateInfo({
            date,
            dayOfWeek: new Intl.DateTimeFormat("en-US", {
              weekday: "long",
            }).format(date),
            dayOfYear: index + 1,
          });
        } else {
          setHighlightedIndex(null);
          setDateInfo(null);
        }
      }
    };

    const handleMouseLeave = (): void => {
      setHighlightedIndex(null);
      setDateInfo(null);
    };

    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener("mousemove", handleMouseMove);
      grid.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        grid.removeEventListener("mousemove", handleMouseMove);
        grid.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [columns]);

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black rounded-3xl p-8 w-[400px] aspect-[3/4] flex flex-col justify-between relative"
      >
        <div
          ref={gridRef}
          className="grid gap-2 relative"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: totalDays }).map((_, index) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + index);
            const hasEvent = events.some(
              (event) => event.date.toDateString() === date.toDateString()
            );

            return (
              <motion.div
                key={index}
                className="aspect-square flex items-center justify-center cursor-pointer"
                onClick={() => {
                  setSelectedDate(date);
                  setIsDialogOpen(true);
                }}
                animate={{
                  opacity:
                    highlightedIndex !== null && index <= highlightedIndex
                      ? 1
                      : 0.15,
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`w-1 h-1 rounded-full ${
                    hasEvent ? "bg-red-400" : "bg-white"
                  }`}
                  animate={{
                    scale: index === highlightedIndex ? 1.5 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {dateInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className="fixed bg-white backdrop-blur-sm px-2 py-1 rounded text-black text-xs pointer-events-none"
              style={{
                left: `${mousePos.x}px`,
                top: `${mousePos.y - 30}px`,
              }}
            >
              {dateInfo.date.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}{" "}
              • {dateInfo.dayOfWeek}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          {upcomingEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 rounded-lg p-3 mb-4"
            >
              <h3 className="text-white/80 text-sm mb-2 font-medium">
                Upcoming Events
              </h3>
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="text-white/60 text-xs">
                    <p className="font-medium">{event.title}</p>
                    <p>{event.date.toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          className="flex justify-between items-end text-white/80 font-mono text-sm"
          layout
        >
          <span>2025</span>
          <div className="flex flex-col items-end gap-2">
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs"
            >
              {currentDate}
            </motion.div>
            <AnimatePresence mode="wait">
              <motion.div
                key="days-left"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {`${daysLeft} days left`}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex gap-2 items-center text-white/90">
                <Calendar className="h-5 w-5" />
                <div className="flex flex-col gap-1">
                  <span>
                    {selectedDate?.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-xs text-white/60 font-normal">
                    Add new event
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                className="bg-black/50 border-zinc-800 text-white placeholder:text-white/40"
                placeholder="Event title"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
              <Input
                className="bg-black/50 border-zinc-800 text-white placeholder:text-white/40"
                placeholder="Description (optional)"
                value={newEvent.description}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
              />
              <Input
                type="password"
                className="bg-black/50 border-zinc-800 text-white placeholder:text-white/40"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errorMessage && (
                <div className="text-red-500 text-sm">{errorMessage}</div>
              )}
              <Button
                onClick={handleAddEvent}
                className="bg-red-500/80 hover:bg-red-500 transition-colors"
              >
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
