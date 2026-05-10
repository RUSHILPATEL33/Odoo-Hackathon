import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Plus,
  MapPin,
  Calendar,
  ArrowRight,
  Plane,
  Globe,
  TrendingUp,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiGetTrips, type Trip } from "@/lib/api";
import CurrencyConverter from "@/components/CurrencyConverter";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

function StatCard({
  label,
  value,
  icon: Icon,
  index,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="glass-card p-6 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center flex-shrink-0 border border-white/10">
        <Icon className="w-6 h-6 text-white/70" />
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const navigate = useNavigate();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const daysLeft = Math.ceil(
    (start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="glass-card p-6 group cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all duration-300"
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">
            {trip.title}
          </h3>
          {daysLeft > 0 && (
            <span className="inline-block mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {daysLeft}d away
            </span>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>
            {formatDate(start)} – {formatDate(end)}
          </span>
        </div>
      </div>

      {trip.budget > 0 && (
        <div className="mt-4 pt-4 border-t border-white/8 flex justify-between items-center">
          <span className="text-xs text-white/40">Budget</span>
          <span className="text-sm font-semibold text-white">
            ${trip.budget.toLocaleString()}
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGetTrips()
      .then(setTrips)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = trips.filter((t) => new Date(t.startDate) > new Date());
  const uniqueDestinations = new Set(trips.map((t) => t.destination)).size;

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[400px] rounded-3xl overflow-hidden mb-12 border border-white/5 shadow-2xl"
      >
        {/* Background Image / Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              WHERE TO <span className="text-indigo-400">NEXT?</span>
            </h1>
            <p className="text-white/60 text-lg max-w-lg mx-auto leading-relaxed">
              Plan your next dream adventure with Traveloop's intuitive itinerary builder.
            </p>
          </motion.div>

          <div className="w-full max-w-2xl relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search destinations (e.g. Tokyo, Paris, Bali...)"
              className="w-full h-16 pl-14 pr-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-all shadow-2xl text-lg"
            />
            <Button
              onClick={() => navigate("/trips/new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-white/90 h-10 px-6 rounded-xl font-bold hidden md:flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </Button>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { label: "Flights", icon: Plane, color: "text-sky-400" },
              { icon: Globe, label: "Hotels", color: "text-emerald-400" },
              { icon: MapPin, label: "Transport", color: "text-violet-400" },
              { icon: Calendar, label: "Events", color: "text-orange-400" },
            ].map((cat) => (
              <button
                key={cat.label}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-white transition-all duration-300 group-hover:-translate-y-1">
                  <cat.icon className={`w-6 h-6 ${cat.color} group-hover:text-black transition-colors`} />
                </div>
                <span className="text-[10px] font-bold text-white/60 group-hover:text-white uppercase tracking-widest">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats & Tools */}

      {/* Stats & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Trips" value={trips.length} icon={Plane} index={0} />
          <StatCard
            label="Destinations"
            value={uniqueDestinations}
            icon={Globe}
            index={1}
          />
          <StatCard
            label="Upcoming"
            value={upcoming.length}
            icon={TrendingUp}
            index={2}
          />
        </div>
        <div className="lg:col-span-1">
          <CurrencyConverter />
        </div>
      </div>

      {/* Trending Adventures - New Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            Trending Adventures
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { city: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400", desc: "The perfect mix of culture & neon." },
            { city: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400", desc: "The city of lights and romance." },
            { city: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400", desc: "Tropical paradise and serenity." },
            { city: "Rome", country: "Italy", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400", desc: "Ancient history and world-class food." }
          ].map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-white/5"
            >
              <img src={dest.img} alt={dest.city} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{dest.country}</p>
                <h4 className="text-lg font-bold text-white">{dest.city}</h4>
                <p className="text-xs text-white/60 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity">{dest.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upcoming trips */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Upcoming Trips</h2>
          <button
            onClick={() => navigate("/trips")}
            className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />
            Loading your trips…
          </div>
        )}

        {error && (
          <div className="glass-card p-6 text-center text-red-400/80 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && upcoming.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-12 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Plane className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No upcoming trips
            </h3>
            <p className="text-white/40 text-sm mb-6 max-w-xs">
              Start planning your next adventure by creating a new trip.
            </p>
            <Button
              onClick={() => navigate("/trips/new")}
              className="bg-white text-black hover:bg-white/90 gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Create your first trip
            </Button>
          </motion.div>
        )}

        {!loading && !error && upcoming.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcoming.slice(0, 4).map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} index={idx} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
