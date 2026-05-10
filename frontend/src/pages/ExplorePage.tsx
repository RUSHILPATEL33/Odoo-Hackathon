import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  Plus,
  Compass,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActivitySuggestion {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  tags: string[];
}

const MOCK_ACTIVITIES: ActivitySuggestion[] = [
  {
    id: "1",
    title: "Shibuya Crossing Tour",
    location: "Tokyo, Japan",
    rating: 4.9,
    reviews: 1240,
    price: "$25",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400",
    tags: ["Culture", "Photo"],
  },
  {
    id: "2",
    title: "Eiffel Tower Sunset Picnic",
    location: "Paris, France",
    rating: 4.8,
    reviews: 850,
    price: "$45",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400",
    tags: ["Romance", "Food"],
  },
  {
    id: "3",
    title: "Uluwatu Temple Surf Session",
    location: "Bali, Indonesia",
    rating: 4.7,
    reviews: 560,
    price: "$30",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400",
    tags: ["Adventure", "Beach"],
  },
  {
    id: "4",
    title: "Ancient Rome Colosseum Walk",
    location: "Rome, Italy",
    rating: 4.9,
    reviews: 3200,
    price: "$55",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400",
    tags: ["History", "Architecture"],
  },
  {
    id: "5",
    title: "Swiss Alps Skydiving",
    location: "Interlaken, Switzerland",
    rating: 5.0,
    reviews: 420,
    price: "$299",
    image: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=400",
    tags: ["Adventure", "Extreme"],
  },
  {
    id: "6",
    title: "Bangkok Night Food Tour",
    location: "Bangkok, Thailand",
    rating: 4.8,
    reviews: 1800,
    price: "$15",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400",
    tags: ["Food", "Local"],
  },
  {
    id: "7",
    title: "Pyramids of Giza Camel Ride",
    location: "Cairo, Egypt",
    rating: 4.6,
    reviews: 2500,
    price: "$40",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=400",
    tags: ["History", "Adventure"],
  },
  {
    id: "8",
    title: "Kyoto Tea Ceremony",
    location: "Kyoto, Japan",
    rating: 4.9,
    reviews: 900,
    price: "$35",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400",
    tags: ["Culture", "Local"],
  },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_ACTIVITIES.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Explore</h1>
          <p className="text-white/40 text-sm mt-1">Discover activities and hidden gems around the world.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
             variant="outline" 
             onClick={() => setSearch("")}
             className="border-white/10 text-white/60 rounded-xl h-10 hover:text-white"
           >
             Clear
           </Button>
           <Button variant="outline" className="border-white/10 text-white/60 rounded-xl h-10">
             <Filter className="w-4 h-4 mr-2" /> Filters
           </Button>
        </div>
      </div>

      <div className="relative mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
        <Input
          placeholder="Search for cities, sights, or activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 bg-white/5 border-white/10 text-lg rounded-2xl text-white focus:border-white/30 transition-all"
        />
      </div>

      {/* Popular Categories - Now Functional */}
      <div className="mb-12">
        <h2 className="text-sm font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Culture", icon: "🏛️", count: 124 },
            { name: "Adventure", icon: "🏔️", count: 85 },
            { name: "Food", icon: "🍽️", count: 210 },
            { name: "History", icon: "📜", count: 42 },
          ].map((cat) => (
            <button 
              key={cat.name} 
              onClick={() => setSearch(cat.name)}
              className={`glass-card p-6 text-center transition-all group ${search === cat.name ? 'border-indigo-500/50 bg-indigo-500/10' : 'hover:bg-white/5'}`}
            >
               <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
               <h4 className="text-white font-bold text-sm">{cat.name}</h4>
               <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">{cat.count} listings</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card group flex flex-col sm:flex-row overflow-hidden hover:border-white/20 transition-all duration-300"
          >
            <div className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-[10px] font-bold text-white">{activity.rating}</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {activity.title}
                  </h3>
                  <p className="text-xs text-white/40 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {activity.location}
                  </p>
                </div>
                <span className="text-lg font-black text-white">{activity.price}</span>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {activity.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between">
                <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
                  {activity.reviews} REVIEWS
                </p>
                <Button className="h-9 px-4 bg-white text-black hover:bg-white/90 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Add to Trip
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card">
            <Compass className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg">No results found</h3>
            <p className="text-white/40 text-sm mt-1">Try searching for another destination or activity.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
