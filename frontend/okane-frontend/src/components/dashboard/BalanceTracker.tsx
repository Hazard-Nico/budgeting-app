"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { AccountBalance } from "@/types";

interface BalanceTrackerProps {
  balance: AccountBalance;
  currency: string;
}

export default function BalanceTracker({
  balance,
  currency,
}: BalanceTrackerProps) {
  const stats = [
    {
      label: "Total Income",
      value: balance.total_income,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Total Expenses",
      value: balance.total_expenses,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Total Savings",
      value: balance.total_savings,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={stat.color} size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {currency} {Number(stat.value || 0).toLocaleString()}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
