import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Lock,
  Globe,
  Palette,
  LogOut,
  Save,
  CheckCircle,
  Plane,
  Award,
  History,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getUser, clearToken, apiGetTrips, type Trip } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const user = getUser();
  const [saved, setSaved] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    apiGetTrips().then(setTrips).catch(console.error);
  }, []);

  const completed = trips.filter(t => new Date(t.endDate) < new Date()).length;
  const upcoming = trips.filter(t => new Date(t.startDate) > new Date()).length;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      title: "Profile Information",
      icon: User,
      fields: [
        { label: "Full Name", value: user?.name || "Explorer", type: "text" },
        { label: "Email Address", value: user?.email || "user@example.com", type: "email", disabled: true },
      ],
    },
    {
      title: "Preferences",
      icon: Globe,
      fields: [
        { label: "Default Currency", value: "INR (₹)", type: "select", options: ["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)", "JPY (¥)"] },
        { label: "Language", value: "English", type: "select", options: ["English", "French", "Spanish", "Japanese"] },
      ],
    },
    {
      title: "App Appearance",
      icon: Palette,
      fields: [
        { label: "Theme", value: "Dark Mode", type: "select", options: ["Dark Mode", "Light Mode", "System"] },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account and app preferences.</p>
      </div>

      {/* Stats Summary - New Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Finished Trips</p>
            <p className="text-xl font-black text-white">{completed}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Plane className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Ongoing Trips</p>
            <p className="text-xl font-black text-white">{trips.filter(t => new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date()).length}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-wider">Future Trips</p>
            <p className="text-xl font-black text-white">{upcoming}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          {sections.map((s) => (
            <button
              key={s.title}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-white/50 hover:bg-white/5 hover:text-white"
            >
              <s.icon className="w-4 h-4" />
              {s.title}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={() => { clearToken(); window.location.href = "/auth"; }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout Session
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2 space-y-6">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <section.icon className="w-4 h-4 text-white/40" />
                {section.title}
              </h3>

              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-xs text-white/30 font-medium ml-1">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        defaultValue={field.value}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                      >
                        {field.options?.map((o) => (
                          <option key={o} value={o} className="bg-zinc-900">{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        disabled={field.disabled}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 disabled:opacity-50"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="bg-white text-black hover:bg-white/90 rounded-xl px-8 h-12 font-bold flex items-center gap-2"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
