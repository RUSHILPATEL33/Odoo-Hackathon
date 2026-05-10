import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ArrowLeft, Plus, Trash2, DollarSign, TrendingUp,
  TrendingDown, Wallet, Loader2, X, AlertCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  apiGetTrip, apiGetExpenses, apiCreateExpense, apiDeleteExpense,
  type Trip, type Expense, type CreateExpensePayload,
} from "@/lib/api";

// ── category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "Flights",       color: "#38bdf8" },
  { label: "Accommodation", color: "#a78bfa" },
  { label: "Food",          color: "#fb923c" },
  { label: "Transport",     color: "#34d399" },
  { label: "Activities",    color: "#f472b6" },
  { label: "Shopping",      color: "#facc15" },
  { label: "Health",        color: "#f87171" },
  { label: "Other",         color: "#94a3b8" },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.label, c.color]));

// ── tooltip ───────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-sm">
      <p className="font-semibold text-white">{payload[0].name}</p>
      <p className="text-white/60 mt-0.5">${Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
}

// ── Add Expense Modal ─────────────────────────────────────────────────────────
function AddExpenseModal({
  open, onClose, onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: CreateExpensePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<CreateExpensePayload>({
    category: "Other",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof CreateExpensePayload, v: any) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) { setErr("Amount must be > 0"); return; }
    setSaving(true);
    setErr("");
    try {
      await onSave({ ...form, amount: Number(form.amount) });
      onClose();
      setForm({ category: "Other", amount: 0, date: new Date().toISOString().slice(0, 10), description: "" });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="glass-card w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Add Expense</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.label} type="button"
                    onClick={() => set("category", c.label)}
                    style={{ borderColor: form.category === c.label ? c.color : "transparent" }}
                    className={`px-2 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                      form.category === c.label ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Amount ($)</label>
              <input
                type="number" step="0.01" min="0.01" required
                value={form.amount || ""}
                onChange={(e) => set("amount", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30"
                placeholder="0.00"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date" required
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 [color-scheme:dark]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5">Note (optional)</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/30"
                placeholder="e.g. Dinner at rooftop restaurant"
              />
            </div>

            {err && (
              <p className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{err}
              </p>
            )}

            <button
              type="submit" disabled={saving}
              className="w-full bg-white text-black font-semibold rounded-xl py-3 text-sm hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Saving…" : "Add Expense"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub?: string; icon: React.ElementType; accent?: string;
}) {
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border"
        style={{ background: accent ? `${accent}18` : "rgba(255,255,255,0.05)", borderColor: accent ? `${accent}30` : "rgba(255,255,255,0.1)" }}
      >
        <Icon className="w-6 h-6" style={{ color: accent ?? "rgba(255,255,255,0.7)" }} />
      </div>
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    Promise.all([apiGetTrip(tripId), apiGetExpenses(tripId)])
      .then(([t, exps]) => { setTrip(t); setExpenses(exps); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tripId]);

  const handleAdd = async (payload: CreateExpensePayload) => {
    if (!tripId) return;
    const created = await apiCreateExpense(tripId, payload);
    setExpenses((prev) => [created, ...prev]);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiDeleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  // ── derived analytics ──
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budget = trip?.budget ?? 0;
  const remaining = budget - totalSpent;
  const overBudget = remaining < 0;
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  // Pie data — by category
  const categoryTotals = CATEGORIES.map((c) => ({
    name: c.label,
    value: expenses.filter((e) => e.category === c.label).reduce((s, e) => s + e.amount, 0),
    color: c.color,
  })).filter((d) => d.value > 0);

  // Bar data — spending by day
  const dayMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const d = e.date.slice(0, 10);
    dayMap[d] = (dayMap[d] ?? 0) + e.amount;
  });
  const barData = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount: Number(amount.toFixed(2)),
    }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-40 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading budget…
        </div>
      </DashboardLayout>
    );
  }

  if (!trip) {
    return (
      <DashboardLayout>
        <div className="text-center py-40 text-white/40">Trip not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back */}
      <button
        onClick={() => navigate(`/trips/${tripId}`)}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Itinerary
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Budget & Expenses</h1>
            <p className="text-white/40 text-sm mt-1">{trip.title} · {trip.destination}</p>
          </div>
          <button
            id="add-expense-btn"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-xl text-sm hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </motion.div>

      {/* Budget progress bar */}
      {budget > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white/60">Budget Usage</span>
            <span className={`text-sm font-bold ${overBudget ? "text-red-400" : "text-emerald-400"}`}>
              {pct.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className={`h-full rounded-full ${overBudget ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-emerald-400"}`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/30">
            <span>$0</span>
            <span>${budget.toLocaleString()} budget</span>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          label="Total Spent" value={`$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign} accent="#38bdf8"
        />
        {budget > 0 && (
          <StatCard
            label={overBudget ? "Over Budget" : "Remaining"}
            value={`$${Math.abs(remaining).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={overBudget ? TrendingDown : TrendingUp}
            accent={overBudget ? "#f87171" : "#34d399"}
          />
        )}
        <StatCard
          label="Transactions" value={`${expenses.length}`}
          sub={expenses.length === 1 ? "expense" : "expenses"}
          icon={Wallet} accent="#a78bfa"
        />
        {budget > 0 && (
          <StatCard
            label="Budget" value={`$${budget.toLocaleString()}`}
            icon={DollarSign} accent="#facc15"
          />
        )}
      </motion.div>

      {/* Charts */}
      {expenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Pie Chart */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-white mb-6">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {categoryTotals.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-white mb-6">Daily Spending</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="amount" name="Spent" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${200 + i * 18}, 80%, 65%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-white/20 text-sm">
                No daily data yet
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Category breakdown table */}
      {categoryTotals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-base font-semibold text-white mb-5">Category Breakdown</h2>
          <div className="space-y-3">
            {categoryTotals.sort((a, b) => b.value - a.value).map((cat) => {
              const share = totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0;
              return (
                <div key={cat.name} className="flex items-center gap-4">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: cat.color }}
                  />
                  <span className="text-sm text-white/60 w-28 flex-shrink-0">{cat.name}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${share}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: cat.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-20 text-right flex-shrink-0">
                    ${cat.value.toFixed(2)}
                  </span>
                  <span className="text-xs text-white/30 w-10 text-right flex-shrink-0">
                    {share.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Expense list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">All Transactions</h2>
          <span className="text-xs text-white/30">{expenses.length} total</span>
        </div>

        {expenses.length === 0 ? (
          <div className="glass-card p-14 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Wallet className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No expenses yet.</p>
            <p className="text-white/20 text-xs mt-1">Add your first expense to start tracking.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {expenses.map((exp, idx) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-4 px-5 py-4 group hover:bg-white/3 transition-colors"
                  >
                    {/* Color dot */}
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: CAT_MAP[exp.category] ?? "#94a3b8" }}
                    />

                    {/* Category badge */}
                    <span
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: `${CAT_MAP[exp.category] ?? "#94a3b8"}20`,
                        color: CAT_MAP[exp.category] ?? "#94a3b8",
                        border: `1px solid ${CAT_MAP[exp.category] ?? "#94a3b8"}30`,
                      }}
                    >
                      {exp.category}
                    </span>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      {exp.description ? (
                        <p className="text-sm text-white/80 truncate">{exp.description}</p>
                      ) : (
                        <p className="text-sm text-white/30 italic">No note</p>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-xs text-white/30 flex-shrink-0 hidden sm:block">
                      {new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>

                    {/* Amount */}
                    <span className="text-sm font-semibold text-white flex-shrink-0 w-20 text-right">
                      ${exp.amount.toFixed(2)}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deleting === exp.id}
                      className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all flex-shrink-0 disabled:opacity-30"
                      aria-label="Delete expense"
                    >
                      {deleting === exp.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer total */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/8 bg-white/2">
              <span className="text-sm text-white/40 font-medium">Total</span>
              <span className="text-base font-bold text-white">
                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      <AddExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAdd} />
    </DashboardLayout>
  );
}
