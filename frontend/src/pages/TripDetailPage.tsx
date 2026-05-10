import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Loader2,
  Clock,
  Plane,
  BarChart2,
  Share2,
  Link,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import AddActivityModal from "@/components/AddActivityModal";
import {
  apiGetTrip,
  apiGetActivities,
  apiCreateActivity,
  apiReorderActivities,
  apiDeleteActivity,
  apiTogglePublic,
  apiDeleteTrip,
  apiGetChecklist,
  apiAddChecklistItem,
  apiToggleChecklistItem,
  apiDeleteChecklistItem,
  type Trip,
  type Activity,
  type ChecklistItem,
  type CreateActivityPayload,
} from "@/lib/api";

// ---- localStorage draft helpers ----
const DRAFT_KEY = (tripId: string) => `traveloop_draft_${tripId}`;

function saveDraft(tripId: string, activities: Activity[]) {
  localStorage.setItem(DRAFT_KEY(tripId), JSON.stringify(activities));
}

function loadDraft(tripId: string): Activity[] | null {
  const raw = localStorage.getItem(DRAFT_KEY(tripId));
  return raw ? JSON.parse(raw) : null;
}

function clearDraft(tripId: string) {
  localStorage.removeItem(DRAFT_KEY(tripId));
}

// ---- Type metadata ----
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

// ---- Sortable Activity Card ----
function ActivityCard({
  activity,
  onDelete,
  isDragging,
}: {
  activity: Activity;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isSorting } =
    useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSorting ? transition : undefined,
  };

  const meta = getTypeMeta(activity.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
        isDragging
          ? "opacity-30"
          : "bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/15"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Type badge */}
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${meta.color}`}
      >
        {meta.emoji} {activity.type}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{activity.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {activity.time && (
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              {activity.time}
            </span>
          )}
          {activity.description && (
            <span className="text-xs text-white/30 truncate">{activity.description}</span>
          )}
        </div>
      </div>

      {/* Cost */}
      {activity.cost > 0 && (
        <span className="text-sm font-semibold text-white/60 flex-shrink-0">
          ${activity.cost.toFixed(0)}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(activity.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all flex-shrink-0"
        aria-label="Delete activity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---- Overlay card (shown while dragging) ----
function DragOverlayCard({ activity }: { activity: Activity }) {
  const meta = getTypeMeta(activity.type);
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-white/20 bg-zinc-900/95 shadow-2xl backdrop-blur-xl opacity-95 rotate-1">
      <GripVertical className="w-4 h-4 text-white/40" />
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${meta.color}`}>
        {meta.emoji} {activity.type}
      </span>
      <p className="text-sm font-semibold text-white">{activity.title}</p>
    </div>
  );
}

// ---- Day Column ----
function DayColumn({
  dayIndex,
  dayDate,
  activities,
  onAddClick,
  onDelete,
  activeId,
}: {
  dayIndex: number;
  dayDate: Date;
  activities: Activity[];
  onAddClick: (dayIndex: number) => void;
  onDelete: (id: string) => void;
  activeId: string | null;
}) {
  const label = dayDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const totalCost = activities.reduce((s, a) => s + a.cost, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayIndex * 0.06 }}
      className="glass-card p-5 flex flex-col gap-3 min-w-0"
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Day {dayIndex + 1}
          </p>
          <p className="text-sm font-bold text-white">{label}</p>
        </div>
        {totalCost > 0 && (
          <span className="text-xs text-white/40 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />${totalCost.toFixed(0)}
          </span>
        )}
      </div>

      {/* Sortable list */}
      <SortableContext
        items={activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[60px]">
          {activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onDelete={onDelete}
              isDragging={activeId === act.id}
            />
          ))}
          {activities.length === 0 && (
            <div className="flex-1 flex items-center justify-center py-6 text-white/20 text-xs border border-dashed border-white/8 rounded-xl">
              Drop activities here
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add button */}
      <button
        id={`add-activity-day-${dayIndex}`}
        onClick={() => onAddClick(dayIndex)}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-white/15 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all text-xs font-medium"
      >
        <Plus className="w-3.5 h-3.5" /> Add Activity
      </button>
    </motion.div>
  );
}

// ---- Main Page ----
export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"itinerary" | "checklist">("itinerary");

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDayIndex, setModalDayIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Load trip + activities
  useEffect(() => {
    if (!tripId) return;
    
    // Fetch trip details first
    apiGetTrip(tripId)
      .then(t => {
        setTrip(t);
        // Once trip is loaded, fetch sub-data
        apiGetActivities(tripId).then(acts => {
          const draft = loadDraft(tripId);
          if (draft) {
            setActivities(draft);
            setHasDraft(true);
          } else {
            setActivities(acts);
          }
        }).catch(err => console.error("Activities load failed", err));

        apiGetChecklist(tripId)
          .then(setChecklist)
          .catch(err => console.error("Checklist load failed", err));
      })
      .catch(err => {
        console.error("Trip load failed", err);
        setTrip(null);
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  // Compute number of days
  const numDays = trip
    ? Math.min(
        100, // Sanity cap
        Math.max(
          1,
          Math.ceil(
            (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      )
    : 0;

  const isCapped = trip && (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1 > 100;

  const getDayDate = (dayIndex: number) => {
    if (!trip) return new Date();
    const d = new Date(trip.startDate);
    d.setDate(d.getDate() + dayIndex);
    return d;
  };

  const getActivitiesForDay = (dayIndex: number) =>
    activities
      .filter((a) => a.dayIndex === dayIndex)
      .sort((a, b) => a.orderIndex - b.orderIndex);

  // --- Drag handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeAct = activities.find((a) => a.id === active.id);
      const overAct = activities.find((a) => a.id === over.id);
      if (!activeAct || !overAct) return;

      const targetDay = overAct.dayIndex;
      const dayActs = activities
        .filter((a) => a.dayIndex === targetDay)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      let newActivities: Activity[];

      if (activeAct.dayIndex === targetDay) {
        // Same day reorder
        const oldIdx = dayActs.findIndex((a) => a.id === active.id);
        const newIdx = dayActs.findIndex((a) => a.id === over.id);
        const reordered = arrayMove(dayActs, oldIdx, newIdx).map((a, i) => ({
          ...a,
          orderIndex: i,
        }));
        newActivities = activities.map(
          (a) => reordered.find((r) => r.id === a.id) ?? a
        );
      } else {
        // Move to different day
        const updatedActive = { ...activeAct, dayIndex: targetDay };
        const newDayActs = [
          ...dayActs.filter((a) => a.id !== active.id),
          updatedActive,
        ].map((a, i) => ({ ...a, orderIndex: i }));
        const oldDayActs = activities
          .filter((a) => a.dayIndex === activeAct.dayIndex && a.id !== active.id)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((a, i) => ({ ...a, orderIndex: i }));

        newActivities = activities.map((a) => {
          const fromNewDay = newDayActs.find((r) => r.id === a.id);
          if (fromNewDay) return fromNewDay;
          const fromOldDay = oldDayActs.find((r) => r.id === a.id);
          if (fromOldDay) return fromOldDay;
          return a;
        });
      }

      setActivities(newActivities);
      if (tripId) {
        saveDraft(tripId, newActivities);
        setHasDraft(true);
      }
    },
    [activities, tripId]
  );

  // Sync draft to backend
  const syncToBackend = async () => {
    if (!tripId) return;
    setSyncing(true);
    try {
      await apiReorderActivities(
        tripId,
        activities.map((a) => ({ id: a.id, dayIndex: a.dayIndex, orderIndex: a.orderIndex }))
      );
      clearDraft(tripId);
      setHasDraft(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Add activity
  const handleAddActivity = async (payload: CreateActivityPayload) => {
    if (!tripId) return;
    const created = await apiCreateActivity(tripId, payload);
    const updated = [...activities, created];
    setActivities(updated);
    saveDraft(tripId, updated);
    setHasDraft(true);
  };

  // Delete activity
  const handleDelete = async (id: string) => {
    await apiDeleteActivity(id);
    const updated = activities.filter((a) => a.id !== id);
    setActivities(updated);
    if (tripId) {
      saveDraft(tripId, updated);
    }
  };

  const togglePublic = async () => {
    if (!tripId || !trip) return;
    setSharing(true);
    try {
      const updated = await apiTogglePublic(tripId, !trip.isPublic);
      setTrip(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSharing(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripId) return;
    if (confirm("Are you sure you want to delete this entire trip? This action cannot be undone.")) {
      try {
        await apiDeleteTrip(tripId);
        navigate("/dashboard");
      } catch (e) {
        console.error(e);
        alert("Failed to delete trip.");
      }
    }
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/shared/${tripId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !newChecklistItem.trim()) return;
    try {
      const item = await apiAddChecklistItem(tripId, newChecklistItem.trim());
      setChecklist([...checklist, item]);
      setNewChecklistItem("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleChecklist = async (id: string) => {
    try {
      const updated = await apiToggleChecklistItem(id);
      setChecklist(checklist.map((c) => (c.id === id ? updated : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    try {
      await apiDeleteChecklistItem(id);
      setChecklist(checklist.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const activeActivity = activities.find((a) => a.id === activeId) ?? null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-40 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mr-3" />
          Loading itinerary…
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <DashboardLayout>
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      {/* Trip header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-white/50 text-sm">
                <MapPin className="w-4 h-4" />
                {trip.destination}
              </span>
              <span className="flex items-center gap-1.5 text-white/50 text-sm">
                <Calendar className="w-4 h-4" />
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </span>
              {trip.budget > 0 && (
                <span className="flex items-center gap-1.5 text-white/50 text-sm">
                  <DollarSign className="w-4 h-4" />${trip.budget.toLocaleString()} budget
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              id="budget-btn"
              onClick={() => navigate(`/trips/${tripId}/budget`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all text-sm font-medium"
            >
              <BarChart2 className="w-4 h-4" /> Budget
            </button>

            <button
              onClick={() => navigate(`/trips/${tripId}/invoice`)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all text-sm font-medium"
            >
              <FileText className="w-4 h-4" /> Billing
            </button>

            <button
              onClick={handleDeleteTrip}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>

            <div className="relative">
              <button
                id="share-btn"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
                  trip.isPublic
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                    : "border-white/15 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/5"
                }`}
              >
                <Share2 className="w-4 h-4" /> Share
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowShareMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 z-50 glass-card p-4 shadow-2xl"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-white">Share Trip</span>
                        {trip.isPublic ? (
                          <Globe className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-white/20" />
                        )}
                      </div>

                      <p className="text-xs text-white/40 mb-4">
                        {trip.isPublic
                          ? "Anyone with the link can view this itinerary."
                          : "This trip is private. Only you can see it."}
                      </p>

                      <Button
                        onClick={togglePublic}
                        disabled={sharing}
                        variant={trip.isPublic ? "outline" : "default"}
                        className={`w-full h-9 text-xs mb-3 font-bold ${
                          trip.isPublic
                            ? "border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                            : "bg-white text-black hover:bg-white/90"
                        }`}
                      >
                        {sharing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : trip.isPublic ? (
                          "Make Private"
                        ) : (
                          "Make Public"
                        )}
                      </Button>

                      {trip.isPublic && (
                        <button
                          onClick={copyShareLink}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all group"
                        >
                          <span className="text-xs truncate mr-2">
                            {copySuccess ? "Copied!" : "Copy Link"}
                          </span>
                          <Link className={`w-3.5 h-3.5 transition-transform ${copySuccess ? "scale-0" : "group-hover:scale-110"}`} />
                          {copySuccess && <div className="absolute right-3 text-emerald-400 text-[10px] font-bold">✓</div>}
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          {/* Sync banner */}
          <AnimatePresence>
            {hasDraft && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Unsaved changes</span>
                <Button
                  id="sync-btn"
                  onClick={syncToBackend}
                  disabled={syncing}
                  className="h-7 px-3 text-xs bg-amber-500 text-black hover:bg-amber-400 rounded-lg font-semibold"
                >
                  {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sync"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-white/5 mb-8">
        <button
          onClick={() => setActiveTab("itinerary")}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === "itinerary" ? "text-white" : "text-white/40 hover:text-white/60"
          }`}
        >
          Itinerary
          {activeTab === "itinerary" && (
            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("checklist")}
          className={`pb-4 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "checklist" ? "text-white" : "text-white/40 hover:text-white/60"
          }`}
        >
          Packing List
          <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/30">
            {checklist.length}
          </span>
          {activeTab === "checklist" && (
            <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
          )}
        </button>
      </div>

      {/* Capped warning */}
      {isCapped && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>
            This trip is very long! For performance, we are only showing the first 100 days.
          </p>
        </div>
      )}

      {/* Views */}
      <AnimatePresence mode="wait">
        {activeTab === "itinerary" ? (
          <motion.div
            key="itinerary"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                className="flex flex-col gap-5"
              >
                {Array.from({ length: numDays }).map((_, dayIdx) => (
                  <DayColumn
                    key={dayIdx}
                    dayIndex={dayIdx}
                    dayDate={getDayDate(dayIdx)}
                    activities={getActivitiesForDay(dayIdx)}
                    onAddClick={(d) => {
                      setModalDayIndex(d);
                      setModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    activeId={activeId}
                  />
                ))}
              </motion.div>

              <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
                {activeActivity && <DragOverlayCard activity={activeActivity} />}
              </DragOverlay>
            </DndContext>
          </motion.div>
        ) : (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="max-w-2xl mx-auto w-full"
          >
            <div className="glass-card p-6 mb-8">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-white/40" />
                Packing & Prep Checklist
              </h3>
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add item (e.g. Passport, Sunscreen...)"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                />
                <Button type="submit" className="bg-white text-black hover:bg-white/90 rounded-xl px-6 h-10 font-bold">
                  Add
                </Button>
              </form>
            </div>

            <div className="space-y-2">
              {checklist.length === 0 && (
                <div className="text-center py-20 text-white/20 border border-dashed border-white/10 rounded-3xl">
                  Your checklist is empty.
                </div>
              )}
              {checklist.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    item.completed
                      ? "bg-white/1 border-white/5 opacity-50"
                      : "bg-white/3 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <button
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      item.completed
                        ? "bg-emerald-500 border-emerald-500 text-black"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <span
                    className={`flex-1 text-sm font-medium ${
                      item.completed ? "line-through text-white/30" : "text-white"
                    }`}
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => handleDeleteChecklist(item.id)}
                    className="text-white/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {numDays === 0 && (
        <div className="glass-card p-16 flex flex-col items-center text-center">
          <Plane className="w-10 h-10 text-white/20 mb-4" />
          <p className="text-white/40 text-sm">
            No days to plan yet — check your trip dates.
          </p>
        </div>
      )}

      {/* Add Activity Modal */}
      <AddActivityModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        dayIndex={modalDayIndex}
        dayLabel={`Day ${modalDayIndex + 1} — ${getDayDate(modalDayIndex).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
        existingCount={getActivitiesForDay(modalDayIndex).length}
        onSave={handleAddActivity}
      />
    </DashboardLayout>
  );
}
