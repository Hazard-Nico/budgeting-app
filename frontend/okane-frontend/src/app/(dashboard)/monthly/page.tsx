"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Calendar, TrendingUp, TrendingDown, DollarSign,
  Plus, Wallet, Target, ChevronDown, ChevronUp, X, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";

interface MonthlyBudget {
  id: number;
  month: number;
  year: number;
  planned_income: number;
  actual_income: number;
  planned_fixed_expenses: number;
  actual_fixed_expenses: number;
  planned_survival: number;
  actual_survival: number;
  planned_optional: number;
  actual_optional: number;
  planned_culture: number;
  actual_culture: number;
  planned_extra: number;
  actual_extra: number;
  planned_savings: number;
  actual_savings: number;
  total_allocated: number;
  total_spent: number;
  remaining: number;
  progress_percentage: number;
  notes: string;
}

interface WeeklyBudget {
  id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  planned_survival: number;
  actual_survival: number;
  planned_optional: number;
  actual_optional: number;
  planned_culture: number;
  actual_culture: number;
  planned_extra: number;
  actual_extra: number;
  total_allocated: number;
  total_spent: number;
  remaining: number;
  progress_percentage: number;
}

interface BudgetSummary {
  spending: { survival: number; optional: number; culture: number; extra: number };
}

const CATEGORIES = [
  { key: "survival", label: "🏠 Survival", desc: "Food, Rent, Transport", color: "emerald" },
  { key: "optional", label: "🛍️ Optional", desc: "Dining out, Shopping", color: "amber" },
  { key: "culture", label: "📚 Culture", desc: "Books, Courses, Gym", color: "violet" },
  { key: "extra", label: "⚡ Extra", desc: "Emergencies, Repairs", color: "red" },
];

const COLORS: Record<string, { bar: string; text: string; light: string; grad: string }> = {
  emerald: { bar: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", grad: "from-emerald-500 to-emerald-600" },
  amber: { bar: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", grad: "from-amber-500 to-amber-600" },
  violet: { bar: "bg-violet-500", text: "text-violet-600", light: "bg-violet-50", grad: "from-violet-500 to-violet-600" },
  red: { bar: "bg-red-500", text: "text-red-600", light: "bg-red-50", grad: "from-red-500 to-red-600" },
};

function getWeeksOfMonth(year: number, month: number) {
  const weeks: { week_number: number; start_date: string; end_date: string }[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  let current = new Date(firstDay);
  let weekNum = 1;
  while (current <= lastDay) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());
    weeks.push({
      week_number: weekNum,
      start_date: current.toISOString().split("T")[0],
      end_date: weekEnd.toISOString().split("T")[0],
    });
    current = new Date(weekEnd);
    current.setDate(current.getDate() + 1);
    weekNum++;
  }
  return weeks;
}

const EMPTY_FORM = {
  planned_income: "",
  planned_fixed_expenses: "",
  planned_survival: "",
  planned_optional: "",
  planned_culture: "",
  planned_extra: "",
  planned_savings: "",
  notes: "",
};

export default function MonthlyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [weeklyBudgets, setWeeklyBudgets] = useState<WeeklyBudget[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState(EMPTY_FORM);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const budgetRes = await api.get("/budgets/monthly/current/");
      setBudget(budgetRes.data);
      const [summaryRes, weeklyRes] = await Promise.all([
        api.get(`/budgets/monthly/${budgetRes.data.id}/summary/`),
        api.get("/budgets/weekly/", { params: { monthly_budget: budgetRes.data.id } }),
      ]);
      setSummary(summaryRes.data);
      setWeeklyBudgets(weeklyRes.data.results || weeklyRes.data);
    } catch (err: any) {
      if (err.response?.status !== 404) toast.error("Failed to load budget data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoCalculate = () => {
    const income = parseFloat(formData.planned_income) || 0;
    const fixed = parseFloat(formData.planned_fixed_expenses) || 0;
    const variable = income - fixed;
    if (variable <= 0) { toast.error("Income must exceed fixed expenses"); return; }
    const savings = variable * 0.2;
    const spendable = variable - savings;
    setFormData({
      ...formData,
      planned_savings: savings.toFixed(0),
      planned_survival: (spendable * 0.55).toFixed(0),
      planned_optional: (spendable * 0.25).toFixed(0),
      planned_culture: (spendable * 0.10).toFixed(0),
      planned_extra: (spendable * 0.10).toFixed(0),
    });
    toast.success("Auto-calculated using Kakeibo methodology!");
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/budgets/monthly/", {
        month: currentMonth,
        year: currentYear,
        planned_income: parseFloat(formData.planned_income) || 0,
        planned_fixed_expenses: parseFloat(formData.planned_fixed_expenses) || 0,
        planned_survival: parseFloat(formData.planned_survival) || 0,
        planned_optional: parseFloat(formData.planned_optional) || 0,
        planned_culture: parseFloat(formData.planned_culture) || 0,
        planned_extra: parseFloat(formData.planned_extra) || 0,
        planned_savings: parseFloat(formData.planned_savings) || 0,
        notes: formData.notes,
      });
      toast.success("Monthly budget created!");
      setShowModal(false);
      setFormData(EMPTY_FORM);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create budget");
    }
  };

  const handleGenerateWeekly = async () => {
    if (!budget) return;
    setIsGenerating(true);
    try {
      const weeks = getWeeksOfMonth(currentYear, currentMonth);
      const n = weeks.length;
      await Promise.all(
        weeks.map((w) =>
          api.post("/budgets/weekly/", {
            monthly_budget: budget.id,
            week_number: w.week_number,
            start_date: w.start_date,
            end_date: w.end_date,
            planned_survival: (budget.planned_survival / n).toFixed(2),
            planned_optional: (budget.planned_optional / n).toFixed(2),
            planned_culture: (budget.planned_culture / n).toFixed(2),
            planned_extra: (budget.planned_extra / n).toFixed(2),
          })
        )
      );
      toast.success(`${n} weekly budgets generated!`);
      const weeklyRes = await api.get("/budgets/weekly/", { params: { monthly_budget: budget.id } });
      setWeeklyBudgets(weeklyRes.data.results || weeklyRes.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate weekly budgets");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleWeek = (id: number) =>
    setExpandedWeeks((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const BudgetModal = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Create Monthly Budget</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              {[
                { key: "planned_income", label: "Monthly Income" },
                { key: "planned_fixed_expenses", label: "Fixed Expenses (Rent, Bills, Subscriptions)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={(formData as any)[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}

              <Button type="button" onClick={handleAutoCalculate} className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200">
                <RefreshCw className="w-4 h-4 mr-2" />
                Auto-Calculate Kakeibo Allocation
              </Button>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Variable Budget Allocation</p>
                <div className="space-y-3">
                  {[
                    { key: "planned_survival", label: "🏠 Survival (55%)", hint: "Food, rent, transport" },
                    { key: "planned_optional", label: "🛍️ Optional (25%)", hint: "Wants & entertainment" },
                    { key: "planned_culture", label: "📚 Culture (10%)", hint: "Self-development" },
                    { key: "planned_extra", label: "⚡ Extra (10%)", hint: "Unexpected expenses" },
                    { key: "planned_savings", label: "💰 Savings (20% of variable)", hint: "Goals & emergency fund" },
                  ].map(({ key, label, hint }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} <span className="text-gray-400 font-normal text-xs">· {hint}</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Rp</span>
                        <input
                          type="number" min="0" step="0.01"
                          value={(formData as any)[key]}
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2} placeholder="Budget notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</Button>
                <Button type="submit" className="flex-1">Create Budget</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!budget) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Budget for {monthName}</h2>
          <p className="text-gray-500 mb-6">Create a monthly budget to begin your Kakeibo journey</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-5 h-5 mr-2" /> Create Monthly Budget
          </Button>
        </motion.div>
        <BudgetModal />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Overview</h1>
          <p className="text-gray-500 mt-1">{monthName} · Kakeibo Command Center</p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Planned Income", value: budget.planned_income, Icon: TrendingUp, grad: "from-blue-500 to-blue-600" },
          { label: "Total Allocated", value: budget.total_allocated, Icon: DollarSign, grad: "from-indigo-500 to-indigo-600" },
          { label: "Total Spent", value: budget.total_spent, Icon: TrendingDown, grad: "from-rose-500 to-rose-600" },
          { label: "Remaining", value: budget.remaining, Icon: Wallet, grad: "from-emerald-500 to-emerald-600" },
        ].map(({ label, value, Icon, grad }, i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${grad} rounded-xl p-5 text-white shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs opacity-90 font-medium">{label}</span>
              <Icon className="w-4 h-4 opacity-80" />
            </div>
            <p className="text-xl font-bold">Rp {Number(value).toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900">Budget Usage</h3>
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
            budget.progress_percentage > 90 ? "bg-red-100 text-red-700" :
            budget.progress_percentage > 70 ? "bg-amber-100 text-amber-700" :
            "bg-emerald-100 text-emerald-700"
          }`}>{Number(budget.progress_percentage).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budget.progress_percentage, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${budget.progress_percentage > 90 ? "bg-red-500" : budget.progress_percentage > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Rp {Number(budget.total_spent).toLocaleString()} spent</span>
          <span>Rp {Number(budget.total_allocated).toLocaleString()} total</span>
        </div>
      </motion.div>

      {/* Kakeibo Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Kakeibo Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CATEGORIES.map((cat, i) => {
            const planned = Number((budget as any)[`planned_${cat.key}`]) || 0;
            const actual = Number((budget as any)[`actual_${cat.key}`]) ||
              (summary?.spending as any)?.[cat.key] || 0;
            const pct = planned > 0 ? (actual / planned) * 100 : 0;
            const remaining = planned - actual;
            const c = COLORS[cat.color];
            const isOver = pct > 100;
            return (
              <motion.div key={cat.key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-xl border-2 ${isOver ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-500">{cat.desc}</p>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${isOver ? "bg-red-100 text-red-700" : `${c.light} ${c.text}`}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-full ${isOver ? "bg-red-500" : c.bar}`} />
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Spent: Rp {actual.toLocaleString()}</span>
                  <span className={`font-medium ${remaining < 0 ? "text-red-600" : "text-gray-700"}`}>
                    {remaining < 0 ? "⚠ Over" : "Left"}: Rp {Math.abs(remaining).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Budget: Rp {planned.toLocaleString()}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Savings & Fixed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            label: "💰 Savings", Icon: Target, color: "blue",
            planned: budget.planned_savings, actual: budget.actual_savings,
          },
          {
            label: "🏦 Fixed Expenses", Icon: DollarSign, color: "orange",
            planned: budget.planned_fixed_expenses, actual: budget.actual_fixed_expenses,
          },
        ].map(({ label, planned, actual, color }) => {
          const pct = Number(planned) > 0 ? (Number(actual) / Number(planned)) * 100 : 0;
          return (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">{label}</h3>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Planned</span>
                  <span className="font-semibold">Rp {Number(planned).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Actual</span>
                  <span className={`font-semibold ${color === "blue" ? "text-blue-600" : "text-orange-600"}`}>
                    Rp {Number(actual).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${color === "blue" ? "bg-blue-500" : "bg-orange-500"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Weekly Breakdown</h3>
          {weeklyBudgets.length === 0 && (
            <Button onClick={handleGenerateWeekly} disabled={isGenerating} className="text-sm">
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Generate Weekly Budgets
            </Button>
          )}
        </div>

        {weeklyBudgets.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Generate weekly budgets to split your monthly allocation week by week.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weeklyBudgets.map((week) => {
              const isExpanded = expandedWeeks.has(week.id);
              const pct = Number(week.total_allocated) > 0
                ? (Number(week.total_spent) / Number(week.total_allocated)) * 100 : 0;
              return (
                <div key={week.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => toggleWeek(week.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                        W{week.week_number}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">Week {week.week_number}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(week.start_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                          {new Date(week.end_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold">Rp {Number(week.total_spent).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">of Rp {Number(week.total_allocated).toLocaleString()}</p>
                      </div>
                      <div className="w-20">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-full rounded-full ${pct > 100 ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-0.5">{pct.toFixed(0)}%</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {CATEGORIES.map((cat) => {
                        const p = Number((week as any)[`planned_${cat.key}`]) || 0;
                        const a = Number((week as any)[`actual_${cat.key}`]) || 0;
                        const c = COLORS[cat.color];
                        return (
                          <div key={cat.key} className={`p-3 rounded-lg ${c.light}`}>
                            <p className="text-xs font-medium text-gray-600 mb-1">{cat.label}</p>
                            <p className={`text-sm font-bold ${c.text}`}>Rp {a.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">/ Rp {p.toLocaleString()}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {budget.notes && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-amber-800 mb-1">Notes</p>
          <p className="text-gray-700 text-sm">{budget.notes}</p>
        </motion.div>
      )}

      <BudgetModal />
    </div>
  );
}