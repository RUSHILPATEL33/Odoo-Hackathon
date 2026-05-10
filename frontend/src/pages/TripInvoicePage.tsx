import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Printer,
  ChevronLeft,
  CheckCircle,
  Clock,
  PieChart,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGetTrip, type Trip, type Expense } from "@/lib/api";

export default function TripInvoicePage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (tripId) {
      apiGetTrip(tripId)
        .then(setTrip)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [tripId]);

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;
  if (!trip) return <DashboardLayout>Trip not found</DashboardLayout>;

  const expenses = trip.expenses || [];
  const subtotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const tax = subtotal * 0.05;
  const discount = 50; // Mock discount as per design
  const grandTotal = subtotal + tax - discount;
  const remaining = trip.budget - subtotal;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-white/40 hover:text-white flex items-center gap-2 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
          </div>
          back to My Trips
        </button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-white rounded-xl gap-2 h-10">
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button variant="outline" className="border-white/10 text-white rounded-xl gap-2 h-10">
            <Printer className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Invoice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="glass-card p-8 border-white/10">
            <div className="flex justify-between items-start mb-12">
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white/20" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">{trip.title}</h2>
                  <p className="text-white/40 text-sm mt-1">{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</p>
                  <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-widest">CREATED BY YOU</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Invoice Id</p>
                <p className="text-white font-mono text-sm">INV-{trip.id.substring(0, 8).toUpperCase()}</p>
                <div className="mt-6">
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Table */}
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">#</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-white/30 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((expense, i) => (
                    <tr key={expense.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm text-white/20">{i + 1}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-white bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider">{expense.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">{expense.description}</td>
                      <td className="px-6 py-4 text-sm font-black text-white text-right">${expense.amount}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-white/20 text-sm">No expenses logged for this trip.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-8 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white font-medium">${subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Tax (5%)</span>
                  <span className="text-white font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Discount</span>
                  <span className="text-white font-medium">-${discount}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between">
                  <span className="text-white font-black uppercase tracking-widest text-xs">Grand Total</span>
                  <span className="text-xl font-black text-white">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setIsPaid(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-emerald-500/20"
            >
              {isPaid ? <CheckCircle className="w-5 h-5 mr-2" /> : null}
              {isPaid ? "Marked as Paid" : "Mark as paid"}
            </Button>
          </div>
        </motion.div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 border-white/10"
          >
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PieChart className="w-4 h-4" /> Budget Insights
            </h3>
            
            <div className="flex items-center justify-center py-6">
               <div className="relative w-32 h-32">
                 <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-indigo-500" strokeWidth="3" strokeDasharray={`${Math.min((subtotal / trip.budget) * 100, 100)}, 100`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-black text-white">{Math.round((subtotal / trip.budget) * 100)}%</span>
                    <span className="text-[8px] text-white/40 uppercase font-bold tracking-tighter">Spent</span>
                 </div>
               </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Total Budget</span>
                <span className="text-sm font-bold text-white">${trip.budget}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Total Spent</span>
                <span className="text-sm font-bold text-white">${subtotal}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-xs text-white/40">Remaining</span>
                <span className={`text-sm font-bold ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  ${remaining}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate(`/trips/${tripId}/budget`)}
              className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-widest border border-white/10"
            >
              View Full Budget
            </Button>
          </motion.div>

          <div className="glass-card p-6 border-white/10">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Traveler Details
            </h3>
            <div className="space-y-2">
              {['You (James)', 'Arjun', 'Jerry', 'Cristina'].map(name => (
                <div key={name} className="flex items-center gap-3 text-sm text-white/60">
                   <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                     {name[0]}
                   </div>
                   {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
