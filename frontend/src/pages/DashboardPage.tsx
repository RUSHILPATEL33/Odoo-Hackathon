import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  // Mock data for demo
  const upcomingTrips = [
    { id: "1", title: "Summer in Kyoto", destination: "Kyoto, Japan", startDate: "2024-07-10", endDate: "2024-07-24" },
    { id: "2", title: "Alpine Adventure", destination: "Swiss Alps", startDate: "2024-09-05", endDate: "2024-09-12" },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>
          <p className="text-white/60 mt-1">Manage your upcoming adventures and expenses.</p>
        </div>
        <Button 
          onClick={() => navigate("/trips/new")}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Trip
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Quick Stats */}
        <div className="glass-card p-6">
          <h3 className="text-white/60 text-sm font-medium">Total Trips</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-white/60 text-sm font-medium">Countries Visited</h3>
          <p className="text-3xl font-bold mt-2">8</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-white/60 text-sm font-medium">Upcoming</h3>
          <p className="text-3xl font-bold mt-2">2</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Trips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingTrips.map((trip, idx) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 group cursor-pointer hover:border-white/20 transition-all"
              onClick={() => navigate(`/trips/${trip.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{trip.title}</h3>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <MapPin className="w-4 h-4" />
                  {trip.destination}
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
