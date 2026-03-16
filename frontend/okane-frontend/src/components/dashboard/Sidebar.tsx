"use client";

import { useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Calendar, TrendingUp, Wallet, Target, FileText,
  Settings, LogOut, Menu, X, PlusCircle, BookOpen,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

const NAV_IDS: Record<string, string> = {
  "/dashboard": "tutorial-nav-home",
  "/monthly": "tutorial-nav-monthly",
  "/transactions": "tutorial-nav-transactions",
  "/budgets": "tutorial-nav-budgets",
  "/trackers": "tutorial-nav-trackers",
  "/reports": "tutorial-nav-reports",
  "/settings": "tutorial-nav-settings",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { t, setLanguage } = useLanguageStore();

  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language as Language);
    }
  }, [user?.language, setLanguage]);

  const menuItems = [
    { icon: Home, labelKey: "nav_home" as const, href: "/dashboard" },
    { icon: Calendar, labelKey: "nav_monthly" as const, href: "/monthly" },
    { icon: TrendingUp, labelKey: "nav_transactions" as const, href: "/transactions" },
    { icon: Wallet, labelKey: "nav_budgets" as const, href: "/budgets" },
    { icon: Target, labelKey: "nav_trackers" as const, href: "/trackers" },
    { icon: FileText, labelKey: "nav_reports" as const, href: "/reports" },
    { icon: Settings, labelKey: "nav_settings" as const, href: "/settings" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      <aside
        id="tutorial-sidebar"
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-1xl font-bold text-blue-600">💰 Our Okane Kakeibo</h1>
          <p className="text-sm text-gray-600 mt-1">Bismillah Nikah 2026</p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <button
            id="tutorial-quick-add"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold"
          >
            <PlusCircle size={18} />
            Quick Add
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  id={NAV_IDS[item.href]}
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{t(item.labelKey)}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">{t("nav_logout")}</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
}