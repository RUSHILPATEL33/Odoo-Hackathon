import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  TrendingUp,
  Wallet,
  Loader2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { apiGetTrips, type Trip, type Expense } from "@/lib/api";

const CATEGORIES = [
  { label: "Flights", color: "#38bdf8" },
  { label: "Accommodation", color: "#a78bfa" },
  { label: "Food", color: "#fb923c" },
  { label: "Transport", color: "#34d399" },
  { label: "Activities", color: "#f472b6" },
  { label: "Shopping", color: "#facc15" },
  { label: "Health", color: "#f87171" },
  { label: "Other", color: "#94a3b8" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.label, c.color]));

export default function GlobalExpensesPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetTrips()
      .then(setTrips)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Flatten all expenses and attach trip info
  const allExpenses = trips.flatMap((t) =>
    (t.expenses || []).map((e) => ({ ...e, tripTitle: t.title, tripId: t.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0);

  // Group by category
  const categoryTotals = CATEGORIES.map((c) => ({
    name: c.label,
    value: allExpenses
      .filter((e) => e.category === c.label)
      .reduce((s, e) => s + e.amount, 0),
    color: c.color,
  })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-40 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading all expenses…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Global Expenses</h1>
        <p className="text-white/40 text-sm mt-1">Track your spending across all your adventures.</p>
      </div>

      {allExpenses.length === 0 ? (
        <div className="glass-card p-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <CreditCard className="w-8 h-8 text-white/20" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No expenses found</h2>
          <p className="text-white/40 max-w-sm mb-8">
            You haven't added any expenses yet. Go to a specific trip to start tracking your budget.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats & Charts */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Total Spent Globally</p>
              <h2 className="text-4xl font-bold text-white">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Total Trips</span>
                  <span className="text-white font-semibold">{trips.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Total Transactions</span>
                  <span className="text-white font-semibold">{allExpenses.length}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Top Categories</h3>
              <div className="space-y-4">
                {categoryTotals.map((cat) => {
                  const share = (cat.value / totalSpent) * 100;
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">{cat.name}</span>
                        <span className="text-white font-bold">${cat.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${share}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Transaction List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Transactions</h3>
                <Filter className="w-4 h-4 text-white/20" />
              </div>
              <div className="divide-y divide-white/5">
                {allExpenses.map((exp, idx) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 hover:bg-white/3 transition-colors flex items-center gap-4 group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shrink-0"
                      style={{ background: `${CAT_MAP[exp.category]}15` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: CAT_MAP[exp.category] }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {exp.category}
                        </span>
                        <span className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">
                          • {exp.tripTitle}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 truncate">
                        {exp.description || "No description"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">
                        ${exp.amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-white/20">
                        {new Date(exp.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/trips/${exp.tripId}/budget`)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-white transition-all"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
