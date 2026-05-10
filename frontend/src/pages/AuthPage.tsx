import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { PlaneTakeoff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiLogin, apiRegister, setToken } from "@/lib/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      let res;
      if (isLogin) {
        res = await apiLogin(email, password);
      } else {
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        res = await apiRegister(email, password, name);
      }
      setToken(res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 focus:ring-0 rounded-xl h-11 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/12 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card p-8 z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-13 h-13 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
            <PlaneTakeoff className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            Traveloop
          </h1>
          <p className="text-sm text-white/50 mt-2 text-center">
            {isLogin
              ? "Welcome back to your travel hub"
              : "Start your next adventure"}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                key="reg-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/70 text-xs">Full Name</Label>
                    <Input id="name" name="name" placeholder="John Doe" className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/70 text-xs">User Name</Label>
                    <Input id="username" name="username" placeholder="johndoe" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/70 text-xs">Phone Number</Label>
                    <Input id="phone" name="phone" placeholder="+1..." className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-white/70 text-xs">Country</Label>
                    <select id="country" name="country" className={`${inputClass} w-full px-3 py-2 text-sm appearance-none`}>
                      <option value="IN" className="bg-zinc-900">India</option>
                      <option value="US" className="bg-zinc-900">USA</option>
                      <option value="UK" className="bg-zinc-900">UK</option>
                      <option value="FR" className="bg-zinc-900">France</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/70 text-sm">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/70 text-sm">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}

          <Button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-white text-black hover:bg-white/90 rounded-xl h-11 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isLogin ? "Signing in…" : "Creating account…"}
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            id="auth-toggle-btn"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
