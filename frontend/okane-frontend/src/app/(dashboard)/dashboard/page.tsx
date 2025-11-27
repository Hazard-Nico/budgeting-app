"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import BalanceTracker from "@/components/dashboard/BalanceTracker";
import ExpenseChart from "@/components/charts/ExpenseChart";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, summaryRes] = await Promise.all([
        api.get("/auth/balance/"),
        api.get("/transactions/summary/", {
          params: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        }),
      ]);

      setSummary(summaryRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here`s your financial overview for{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </motion.div>

      {/* Balance Tracker */}
      {user?.balance && (
        <BalanceTracker balance={user.balance} currency={user.currency} />
      )}

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {summary && (
          <>
            <ExpenseChart data={summary.by_category} />

            {/* Monthly Summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total Income
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {user?.currency} {summary.total_income.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total Expenses
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {user?.currency} {summary.total_expenses.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total Savings
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {user?.currency} {summary.total_savings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                  <span className="text-sm font-medium text-gray-700">
                    Net Balance
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {user?.currency}{" "}
                    {(
                      summary.total_income - summary.total_expenses
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Transactions
        </h3>
        <p className="text-gray-500 text-center py-8">
          No recent transactions. Start adding your transactions!
        </p>
      </motion.div>
    </div>
  );
}
