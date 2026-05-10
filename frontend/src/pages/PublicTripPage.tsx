import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  Clock,
  Plane,
} from "lucide-react";
import {
  apiGetPublicTrip,
  type Trip,
  type Activity,
} from "@/lib/api";

const TYPE_META: Record<string, { emoji: string; color: string }> = {
  Flight:      { emoji: "✈️", color: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
  Hotel:       { emoji: "🏨", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  Food:        { emoji: "🍽️", color: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  Sightseeing: { emoji: "🗺️", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  Transport:   { emoji: "🚌", color: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  Shopping:    { emoji: "🛍️", color: "bg-pink-500/15 text-pink-400 border-pink-500/20" },
  Activity:    { emoji: "🎯", color: "bg-red-500/15 text-red-400 border-red-500/20" },
  Other:       { emoji: "📌", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META["Other"];
}

export default function PublicTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    apiGetPublicTrip(tripId)
      .then(setTrip)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/40">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mb-4"
        >
          <Plane className="w-8 h-8 text-white/60" />
        </motion.div>
        <p className="text-sm font-medium tracking-widest uppercase opacity-50">Preparing Itinerary</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Plane className="w-10 h-10 text-white/10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Trip Not Found</h1>
        <p className="text-white/40 max-w-xs text-sm leading-relaxed">
          This trip might not be public or the link is incorrect. Please check with the owner.
        </p>
        <button 
          onClick={() => window.location.href = "/"}
          className="mt-8 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all"
        >
          Go to Traveloop
        </button>
      </div>
    );
  }

  const numDays = Math.max(
    1,
    Math.ceil(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  );

  const getDayDate = (dayIndex: number) => {
    const d = new Date(trip.startDate);
    d.setDate(d.getDate() + dayIndex);
    return d;
  };

  const getActivitiesForDay = (dayIndex: number) =>
    trip.activities
      .filter((a) => a.dayIndex === dayIndex)
      .sort((a, b) => a.orderIndex - b.orderIndex);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/10">
      {/* Dynamic Background Blur */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shadow-inner">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Traveloop</span>
          </div>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all active:scale-95"
          >
            {copySuccess ? "Link Copied!" : "Share Link"}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 relative z-10">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
            <Globe className="w-3 h-3" /> Shared Itinerary
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-[1.1]">
            {trip.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-4 gap-x-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Destination</span>
              <span className="flex items-center gap-2 text-white font-medium">
                <MapPin className="w-4 h-4 text-white/60" />
                {trip.destination}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden md:block" />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Duration</span>
              <span className="flex items-center gap-2 text-white font-medium">
                <Calendar className="w-4 h-4 text-white/60" />
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
            </div>
            {trip.budget > 0 && (
              <>
                <div className="w-px h-8 bg-white/10 hidden md:block" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Budget</span>
                  <span className="flex items-center gap-2 text-white font-medium">
                    <DollarSign className="w-4 h-4 text-white/60" />
                    ${trip.budget.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Itinerary Timeline */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-12"
        >
          {Array.from({ length: numDays }).map((_, dayIdx) => {
            const dayActivities = getActivitiesForDay(dayIdx);
            const dayDate = getDayDate(dayIdx);
            const label = dayDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            });

            return (
              <motion.section
                key={dayIdx}
                variants={itemVariants}
                className="relative"
              >
                {/* Connector Line */}
                {dayIdx < numDays - 1 && (
                  <div className="absolute left-[20px] top-[40px] bottom-[-48px] w-px bg-gradient-to-b from-white/10 via-white/10 to-transparent hidden md:block" />
                )}

                <div className="flex items-start gap-6 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm text-white/80 shadow-xl relative z-10 shrink-0">
                    {dayIdx + 1}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-bold text-xl md:text-2xl text-white/90">{label}</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mt-0.5">
                      Day {dayIdx + 1}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pl-0 md:pl-16">
                  {dayActivities.map((act) => {
                    const meta = getTypeMeta(act.type);
                    return (
                      <motion.div
                        key={act.id}
                        whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.04)" }}
                        className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300"
                      >
                        <div className={`self-start sm:self-center px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 ${meta.color}`}>
                          <span className="text-base leading-none">{meta.emoji}</span>
                          {act.type}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base md:text-lg text-white group-hover:text-white transition-colors truncate">{act.title}</h4>
                          <div className="flex flex-wrap items-center gap-4 mt-1.5">
                            {act.time && (
                              <div className="flex items-center gap-1.5 text-xs text-white/40">
                                <Clock className="w-3.5 h-3.5" />
                                {act.time}
                              </div>
                            )}
                            {act.description && (
                              <p className="text-xs text-white/30 truncate max-w-xs">{act.description}</p>
                            )}
                          </div>
                        </div>
                        {act.cost > 0 && (
                          <div className="text-lg font-black text-white/50 tabular-nums">
                            ${act.cost.toFixed(0)}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  {dayActivities.length === 0 && (
                    <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl text-white/20 text-xs font-medium uppercase tracking-widest">
                      Rest day — No activities
                    </div>
                  )}
                </div>
              </motion.section>
            );
          })}
        </motion.div>

        {/* CTA Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-10 md:p-16 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Plan your next adventure</h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Traveloop is the world's most beautiful and intuitive trip planner. Join thousands of travelers today.
            </p>
            <button 
              onClick={() => window.location.href = "/"}
              className="px-8 py-3.5 rounded-2xl bg-white text-black font-black text-sm hover:scale-105 transition-all shadow-xl shadow-white/5"
            >
              Get Started for Free
            </button>
          </div>
        </motion.div>

        <footer className="mt-20 pb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-20">
            <div className="w-1 h-1 rounded-full bg-white" />
            <div className="w-1 h-1 rounded-full bg-white" />
            <div className="w-1 h-1 rounded-full bg-white" />
          </div>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
            Powered by Traveloop AI
          </p>
        </footer>
      </main>
    </div>
  );
}

