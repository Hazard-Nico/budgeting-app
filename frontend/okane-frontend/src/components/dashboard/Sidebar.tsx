"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Calendar,
  TrendingUp,
  Wallet,
  Target,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Calendar, label: "Monthly", href: "/monthly" },
  { icon: TrendingUp, label: "Transactions", href: "/transactions" },
  { icon: Wallet, label: "Budgets", href: "/budgets" },
  { icon: Target, label: "Trackers", href: "/trackers" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: BookOpen, label: "Learn", href: "/learn" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : "-100%",
        }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col",
          "lg:translate-x-0 transition-transform duration-300"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600">
            💰 Okane Kakeibo
          </h1>
          <p className="text-sm text-gray-600 mt-1">v2.2025 Premium Plus</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/transactions/new">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusCircle size={20} />
              <span className="font-medium">Quick Add</span>
            </motion.button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Account Balance */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Current Balance</p>
            <p className="text-2xl font-bold mt-1">
              {user?.currency}{" "}
              {user?.balance?.current_balance?.toLocaleString() || "0"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
