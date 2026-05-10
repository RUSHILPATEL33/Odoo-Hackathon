import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, RefreshCw, Calculator } from "lucide-react";

const DEFAULT_RATES: Record<string, number> = {
  "USD ($)": 1.0,
  "INR (₹)": 83.50,
  "EUR (€)": 0.92,
  "GBP (£)": 0.78,
  "JPY (¥)": 156.40,
};

const SYMBOL_TO_CODE: Record<string, string> = {
  "USD ($)": "USD",
  "INR (₹)": "INR",
  "EUR (€)": "EUR",
  "GBP (£)": "GBP",
  "JPY (¥)": "JPY",
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("100");
  const [from, setFrom] = useState("USD ($)");
  const [to, setTo] = useState("INR (₹)");
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [result, setResult] = useState<number>(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRates() {
      setLoading(true);
      try {
        const fromCode = SYMBOL_TO_CODE[from];
        const res = await fetch(`https://api.frankfurter.app/latest?from=${fromCode}`);
        const data = await res.json();
        
        const newRates: Record<string, number> = { [from]: 1.0 };
        Object.entries(SYMBOL_TO_CODE).forEach(([symbol, code]) => {
          if (code === fromCode) return;
          if (data.rates[code]) {
            newRates[symbol] = data.rates[code];
          }
        });
        setRates(newRates);
      } catch (e) {
        console.error("Failed to fetch rates:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, [from]);

  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    const rateTo = rates[to] || (DEFAULT_RATES[to] / DEFAULT_RATES[from]);
    setResult(numAmount * rateTo);
  }, [amount, from, to, rates]);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = from;
      setFrom(to);
      setTo(temp);
      setIsSwapping(false);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Currency Converter
            {loading && <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />}
          </h3>
          <p className="text-[10px] text-white/30 font-medium">REAL-TIME DATA FROM FRANKFURTER</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-white/30 transition-all"
            placeholder="0.00"
          />
        </div>

        {/* Currency Selects */}
        <div className="flex items-end gap-2 relative">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
            >
              {Object.keys(SYMBOL_TO_CODE).map((c) => (
                <option key={c} value={c} className="bg-zinc-900">{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className={`mb-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all z-10 ${isSwapping ? 'rotate-180' : ''}`}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
            >
              {Object.keys(SYMBOL_TO_CODE).map((c) => (
                <option key={c} value={c} className="bg-zinc-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${result}-${to}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
          >
            <p className="text-[10px] text-indigo-400/60 uppercase font-bold tracking-[0.2em] mb-1">Live Result</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black text-white">
                {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-sm font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-lg">
                {to.split(" ")[0]}
              </span>
            </div>
            <p className="text-[10px] text-white/20 mt-3 flex items-center justify-center gap-1">
              <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} /> 1 {from.split(" ")[0]} ≈ {(rates[to] || 1).toFixed(4)} {to.split(" ")[0]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
