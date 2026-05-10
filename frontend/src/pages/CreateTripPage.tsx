import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  ArrowLeft,
  Loader2,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { apiCreateTrip } from "@/lib/api";

const schema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    destination: z.string().min(2, "Please enter a destination"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    budget: z
      .string()
      .optional()
      .transform((v) => (v ? parseFloat(v) : 0)),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine((d) => {
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 90;
  }, {
    message: "Trip duration cannot exceed 90 days",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof schema>;

function FormField({
  id,
  label,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white/70 text-sm font-medium flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const trip = await apiCreateTrip({
        title: data.title,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget as number,
      });
      navigate(`/trips/${trip.id}`);
    } catch (e: any) {
      setServerError(e.message || "Failed to create trip");
    }
  };

  const inputClass =
    "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 focus:ring-0 rounded-xl h-11 transition-colors";

  return (
    <DashboardLayout>
      {/* Back button */}
      <button
        id="back-btn"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white/70" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Create a Trip
            </h1>
          </div>
          <p className="text-white/40 text-sm">
            Fill in the details below to start planning your next adventure.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              id="title"
              label="Trip Title"
              icon={Tag}
              error={errors.title?.message}
            >
              <Input
                id="title"
                placeholder="e.g. Summer in Kyoto"
                className={inputClass}
                {...register("title")}
              />
            </FormField>

            <FormField
              id="destination"
              label="Destination"
              icon={MapPin}
              error={errors.destination?.message}
            >
              <Input
                id="destination"
                placeholder="e.g. Kyoto, Japan"
                className={inputClass}
                {...register("destination")}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="startDate"
                label="Start Date"
                icon={Calendar}
                error={errors.startDate?.message}
              >
                <Input
                  id="startDate"
                  type="date"
                  className={`${inputClass} [color-scheme:dark]`}
                  {...register("startDate")}
                />
              </FormField>

              <FormField
                id="endDate"
                label="End Date"
                icon={Calendar}
                error={errors.endDate?.message}
              >
                <Input
                  id="endDate"
                  type="date"
                  className={`${inputClass} [color-scheme:dark]`}
                  {...register("endDate")}
                />
              </FormField>
            </div>

            <FormField
              id="budget"
              label="Total Budget (optional)"
              icon={DollarSign}
              error={errors.budget?.message}
            >
              <Input
                id="budget"
                type="number"
                min={0}
                step={0.01}
                placeholder="e.g. 3000"
                className={inputClass}
                {...register("budget")}
              />
            </FormField>

            {serverError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                {serverError}
              </motion.p>
            )}

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                id="submit-trip-btn"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-white text-black hover:bg-white/90 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating…
                  </>
                ) : (
                  "Create Trip"
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
