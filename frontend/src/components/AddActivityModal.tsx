import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { type CreateActivityPayload } from "@/lib/api";

const ACTIVITY_TYPES = [
  { value: "Flight", emoji: "✈️" },
  { value: "Hotel", emoji: "🏨" },
  { value: "Food", emoji: "🍽️" },
  { value: "Sightseeing", emoji: "🗺️" },
  { value: "Transport", emoji: "🚌" },
  { value: "Shopping", emoji: "🛍️" },
  { value: "Activity", emoji: "🎯" },
  { value: "Other", emoji: "📌" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  dayIndex: number;
  dayLabel: string;
  existingCount: number;
  onSave: (payload: CreateActivityPayload) => Promise<void>;
}

export default function AddActivityModal({
  open,
  onClose,
  dayIndex,
  dayLabel,
  existingCount,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Sightseeing");
  const [time, setTime] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setType("Sightseeing");
    setTime("");
    setCost("");
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSave({
        dayIndex,
        orderIndex: existingCount,
        title: title.trim(),
        type,
        time: time || undefined,
        cost: cost ? parseFloat(cost) : 0,
        description: description.trim() || undefined,
      });
      reset();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to add activity");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 rounded-xl h-10 transition-colors";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-zinc-950 border border-white/10 text-white max-w-md rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Add Activity —{" "}
            <span className="text-white/50 font-normal">{dayLabel}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Type picker */}
          <div className="space-y-2">
            <Label className="text-white/60 text-sm">Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                    type === t.value
                      ? "bg-white/15 border-white/30 text-white"
                      : "bg-white/3 border-white/8 text-white/50 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="font-medium leading-none">{t.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="act-title" className="text-white/60 text-sm">
              Title
            </Label>
            <Input
              id="act-title"
              placeholder="e.g. Visit Fushimi Inari"
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Time + Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="act-time" className="text-white/60 text-sm">
                Time (optional)
              </Label>
              <Input
                id="act-time"
                placeholder="e.g. 10:00 AM"
                className={inputClass}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-cost" className="text-white/60 text-sm">
                Cost ($)
              </Label>
              <Input
                id="act-cost"
                type="number"
                min={0}
                step={0.01}
                placeholder="0"
                className={inputClass}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="act-desc" className="text-white/60 text-sm">
              Notes (optional)
            </Label>
            <textarea
              id="act-desc"
              rows={2}
              placeholder="Any notes or details…"
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:border-white/30 rounded-xl px-3 py-2 text-sm resize-none outline-none transition-colors"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              id="save-activity-btn"
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Add Activity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
