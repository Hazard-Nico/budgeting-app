"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { motion } from "framer-motion";
import { Wallet, Target, TrendingUp, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";

export default function SetupPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    initialBalance: "",
    monthlyIncomeGoal: "",
    monthlySavingsGoal: "",
    currency: user?.currency || "IDR",
    language: user?.language || "en",
  });

  const handleNext = () => {
    if (step === 1 && !formData.initialBalance) {
      toast.error("Please enter your initial balance");
      return;
    }
    if (step === 2 && !formData.monthlyIncomeGoal) {
      toast.error("Please enter your monthly income goal");
      return;
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    try {
      await api.patch("/accounts/balance/", {
        current_balance: parseFloat(formData.initialBalance),
        total_income: parseFloat(formData.initialBalance),
      });

      await api.patch("/accounts/profile/", {
        monthly_income_goal: parseFloat(formData.monthlyIncomeGoal),
        monthly_savings_goal: parseFloat(formData.monthlySavingsGoal || "0"),
      });

      await api.post("/accounts/complete-setup/");

      const userRes = await api.get("/accounts/me/");
      setUser(userRes.data);

      toast.success("Setup completed successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to complete setup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full"
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  s <= step ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {step === 1 && "Set Your Initial Balance"}
            {step === 2 && "Set Your Financial Goals"}
            {step === 3 && "Review & Complete"}
          </h2>
          <p className="text-gray-600 mt-2">
            {step === 1 && "Let's start by setting up your current balance"}
            {step === 2 && "Define your monthly income and savings targets"}
            {step === 3 && "Review your setup and get started"}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Wallet className="w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, initialBalance: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <Button onClick={handleNext} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income Goal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  value={formData.monthlyIncomeGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyIncomeGoal: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Savings Goal (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  value={formData.monthlySavingsGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlySavingsGoal: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-purple-600" />
              </div>
            </div>
            <div className="space-y-4 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Initial Balance:</span>
                <span className="font-semibold">
                  Rp {parseFloat(formData.initialBalance).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Income Goal:</span>
                <span className="font-semibold">
                  Rp {parseFloat(formData.monthlyIncomeGoal).toLocaleString()}
                </span>
              </div>
              {formData.monthlySavingsGoal && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Savings Goal:</span>
                  <span className="font-semibold">
                    Rp {parseFloat(formData.monthlySavingsGoal).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Back
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}