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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Your Dashboard
          </h1>
          <p className="text-white/50 mt-1 text-sm">
            Manage your adventures and track your journey.
          </p>
        </div>
        <Button
          id="create-trip-btn"
          onClick={() => navigate("/trips/new")}
          className="bg-white text-black hover:bg-white/90 gap-2 h-10 px-5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Trip
        </Button>
      </div>

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
