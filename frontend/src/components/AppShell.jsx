import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import { IconButton } from "./ui";
import { Menu, X } from "lucide-react";
import Navbar from "./Navbar";
import { useAuth } from "../store/auth";
import { useTranslation } from "react-i18next";

export default function AppShell({ children }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100">
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {children}
        </motion.main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50/60 dark:bg-[#0b1220] text-ink-900 dark:text-ink-100 flex">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-20 h-14 px-4 flex items-center gap-3 bg-white/90 dark:bg-ink-950/90 backdrop-blur-xl border-b border-ink-200/60 dark:border-ink-800/60">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setMobileOpen((v) => !v)}
          className="h-9 w-9 rounded-lg grid place-items-center hover:bg-ink-100 dark:hover:bg-ink-800 transition"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </motion.button>
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-extrabold tracking-tight truncate"
        >
          {t("brand")}
        </motion.div>
      </div>

      <div className="flex-1 min-w-0">
        <motion.main
          key={typeof window !== "undefined" ? window.location.pathname : "app"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="pb-20 md:pb-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
