import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Plus,
  MapPin,
  Calendar,
  ArrowRight,
  Search,
  Filter,
  Loader2,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { apiGetTrips, type Trip } from "@/lib/api";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

function TripCard({ trip, index }: { trip: Trip; index: number }) {
  const navigate = useNavigate();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="glass-card group cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all duration-300"
      onClick={() => navigate(`/trips/${trip.id}`)}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-white leading-tight truncate">
              {trip.title}
            </h3>
            <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {trip.destination}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/30 text-xs mb-4">
          <Calendar className="w-3 h-3" />
          <span>
            {formatDate(start)} – {formatDate(end)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex -space-x-2">
             {/* Placeholder for companions or status icons */}
             <div className="w-6 h-6 rounded-full bg-white/10 border border-zinc-950 flex items-center justify-center text-[10px] text-white/60">
                {trip.activities.length}
             </div>
             <span className="text-[10px] text-white/30 ml-4 flex items-center">activities</span>
          </div>
          {trip.budget > 0 && (
            <span className="text-sm font-bold text-white">${trip.budget.toLocaleString()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiGetTrips()
      .then(setTrips)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTrips = trips.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase())
  );

  const now = new Date();
  const ongoing = filteredTrips.filter(t => new Date(t.startDate) <= now && new Date(t.endDate) >= now);
  const upcoming = filteredTrips.filter(t => new Date(t.startDate) > now);
  const completed = filteredTrips.filter(t => new Date(t.endDate) < now);

  const Section = ({ title, items }: { title: string, items: Trip[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-12">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
          {title}
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">{items.length}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((trip, idx) => (
            <TripCard key={trip.id} trip={trip} index={idx} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Trips</h1>
          <p className="text-white/40 text-sm mt-1">Explore all your planned and past adventures.</p>
        </div>
        <Button
          onClick={() => navigate("/trips/new")}
          className="bg-white text-black hover:bg-white/90 gap-2 h-10 px-5 rounded-xl font-semibold self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Button>
      </div>

      <div className="flex gap-3 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input
            placeholder="Search trips by name or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white rounded-xl h-11 focus:border-white/30"
          />
        </div>
        <Button variant="outline" className="h-11 px-4 border-white/10 rounded-xl text-white/60">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading your trips…
        </div>
      ) : trips.length === 0 ? (
        <div className="glass-card p-20 text-center">
          <Plane className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg">No trips found</h3>
          <p className="text-white/40 text-sm mt-1">Start your journey by creating your first trip.</p>
        </div>
      ) : (
        <>
          <Section title="Ongoing" items={ongoing} />
          <Section title="Upcoming" items={upcoming} />
          <Section title="Finished" items={completed} />
        </>
      )}
    </DashboardLayout>
  );
}
