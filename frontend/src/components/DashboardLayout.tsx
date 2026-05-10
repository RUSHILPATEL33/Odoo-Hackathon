import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Plane,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  PlaneTakeoff,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clearToken, getUser } from "@/lib/api";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Explore", path: "/explore", icon: Compass },
  { name: "My Trips", path: "/trips", icon: Plane },
  { name: "Expenses", path: "/expenses", icon: CreditCard },
  { name: "Settings", path: "/settings", icon: Settings },
];

function NavContent({
  onClose,
}: {
  onClose?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearToken();
    navigate("/auth");
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <PlaneTakeoff className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gradient">Traveloop</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User badge */}
      {user && (
        <div className="mx-4 mb-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
            Signed in as
          </p>
          <p className="text-sm font-semibold text-white mt-0.5 truncate">
            {user.name || user.email}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="w-64 glass-panel border-r border-white/10 hidden md:flex flex-col flex-shrink-0"
      >
        <NavContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-white/10 flex flex-col md:hidden"
            >
              <NavContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-4 px-4 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-30">
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <PlaneTakeoff className="w-5 h-5 text-white" />
            <span className="text-lg font-bold text-gradient">Traveloop</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
