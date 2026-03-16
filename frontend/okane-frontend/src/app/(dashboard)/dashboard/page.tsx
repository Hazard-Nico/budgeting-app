"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTutorialStore, TUTORIAL_PENDING_KEY, TUTORIAL_DONE_KEY } from "@/store/tutorialStore";
import api from "@/lib/api";
import BalanceTracker from "@/components/dashboard/BalanceTracker";
import ExpenseChart from "@/components/charts/ExpenseChart";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Wallet, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { startTutorial } = useTutorialStore();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [initialBalance, setInitialBalance] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const pending = localStorage.getItem(TUTORIAL_PENDING_KEY);
    const done = localStorage.getItem(TUTORIAL_DONE_KEY);
    if (pending === "true" && done !== "true") {
      const timer = setTimeout(() => {
        startTutorial();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [startTutorial]);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, summaryRes] = await Promise.all([
        api.get("/accounts/balance/"),
        api.get("/transactions/summary/", {
          params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
        }),
      ]);
      setBalance(balanceRes.data);
      setSummary(summaryRes.data);
      if (balanceRes.data.current_balance === 0 || balanceRes.data.current_balance === "0.00") {
        setShowBalanceModal(true);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetInitialBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialBalance || parseFloat(initialBalance) <= 0) {
      toast.error("Please enter a valid balance amount");
      return;
    }
    try {
      await api.patch("/accounts/balance/", {
        current_balance: parseFloat(initialBalance),
        total_income: parseFloat(initialBalance),
      });
      toast.success("Initial balance set successfully!");
      setShowBalanceModal(false);
      setInitialBalance("");
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to set initial balance");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("dashboard_title")}, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {t("dashboard_subtitle")}{" "}
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => startTutorial()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <BookOpen size={16} />
          Tutorial
        </button>
      </motion.div>

      {balance && (
        <div id="tutorial-balance">
          <BalanceTracker balance={balance} currency={user?.currency || "IDR"} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary && (
          <>
            <ExpenseChart data={summary.by_category} />
            <motion.div
              id="tutorial-monthly-summary"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("monthly_summary")}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{t("total_income")}</span>
                  <span className="text-lg font-bold text-green-600">
                    Rp {Number(summary.total_income || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{t("total_expenses")}</span>
                  <span className="text-lg font-bold text-red-600">
                    Rp {Number(summary.total_expenses || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{t("total_savings")}</span>
                  <span className="text-lg font-bold text-blue-600">
                    Rp {Number(summary.total_savings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                  <span className="text-sm font-medium text-gray-700">{t("net_balance")}</span>
                  <span className="text-lg font-bold text-indigo-600">
                    Rp {Number((Number(summary.total_income || 0) - Number(summary.total_expenses || 0)).toFixed(2)).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("recent_transactions")}</h3>
        <p className="text-gray-500 text-center py-8">{t("no_recent_transactions")}</p>
      </motion.div>

      <AnimatePresence>
        {showBalanceModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("set_initial_balance")}</h3>
                <p className="text-gray-600">{t("set_initial_balance_desc")}</p>
              </div>
              <form onSubmit={handleSetInitialBalance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("current_balance_amount")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <input
                      type="number" required value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                      placeholder="0" step="0.01" min="0" autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t("balance_tip")}</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" onClick={() => setShowBalanceModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                    {t("skip_for_now")}
                  </Button>
                  <Button type="submit" className="flex-1">{t("set_balance")}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}