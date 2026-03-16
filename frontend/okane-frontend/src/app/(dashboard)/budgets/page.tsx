"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/store/languageStore";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, TrendingDown, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";

const EMPTY_FORM = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  planned_income: "",
  planned_fixed_expenses: "",
  planned_survival: "",
  planned_optional: "",
  planned_culture: "",
  planned_extra: "",
  planned_savings: "",
  notes: "",
};

export default function BudgetsPage() {
  const { t } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MONTHS = [
    t("january"), t("february"), t("march"), t("april"),
    t("may"), t("june"), t("july"), t("august"),
    t("september"), t("october"), t("november"), t("december"),
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/budgets/monthly/");
      setBudgets(Array.isArray(res.data) ? res.data : res.data.results ?? []);
    } catch {
      toast.error("Failed to load budgets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/budgets/monthly/", {
        ...formData,
        planned_income: parseFloat(formData.planned_income as string) || 0,
        planned_fixed_expenses: parseFloat(formData.planned_fixed_expenses as string) || 0,
        planned_survival: parseFloat(formData.planned_survival as string) || 0,
        planned_optional: parseFloat(formData.planned_optional as string) || 0,
        planned_culture: parseFloat(formData.planned_culture as string) || 0,
        planned_extra: parseFloat(formData.planned_extra as string) || 0,
        planned_savings: parseFloat(formData.planned_savings as string) || 0,
      });
      toast.success("Budget created!");
      setShowModal(false);
      setFormData({ ...EMPTY_FORM });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create budget");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryFields = [
    { key: "planned_survival" as const, label: `🏠 ${t("planned_survival")}`, color: "bg-green-500" },
    { key: "planned_optional" as const, label: `🛍️ ${t("planned_optional")}`, color: "bg-yellow-500" },
    { key: "planned_culture" as const, label: `📚 ${t("planned_culture")}`, color: "bg-purple-500" },
    { key: "planned_extra" as const, label: `⚡ ${t("planned_extra")}`, color: "bg-red-500" },
  ];

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
        className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("budgets_title")}</h1>
          <p className="text-gray-500 mt-1">{t("budgets_subtitle")}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-5 h-5 mr-2" /> {t("create_budget")}
        </Button>
      </motion.div>

      {budgets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{t("no_budgets")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map((budget, i) => (
            <motion.div key={budget.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {MONTHS[budget.month - 1]} {budget.year}
                </h3>
                <span className="text-sm text-gray-500">
                  {t("planned_income")}: Rp {Number(budget.planned_income || 0).toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                {categoryFields.map(({ key, label, color }) => {
                  const planned = Number(budget[key] || 0);
                  const spent = Number(budget[key.replace("planned_", "actual_")] || 0);
                  const pct = planned > 0 ? Math.min(100, (spent / planned) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{label}</span>
                        <span className="text-gray-500">
                          Rp {spent.toLocaleString()} / Rp {planned.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {budget.notes && (
                <p className="mt-4 text-xs text-gray-500 border-t border-gray-100 pt-3">{budget.notes}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Budget Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">{t("create_monthly_budget")}</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("month")}</label>
                    <select value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                      {MONTHS.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("year")}</label>
                    <input type="number" value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      min="2020" max="2100" />
                  </div>
                </div>

                {[
                  { key: "planned_income" as const, label: t("planned_income") },
                  { key: "planned_fixed_expenses" as const, label: t("planned_fixed_expenses") },
                  { key: "planned_survival" as const, label: `🏠 ${t("planned_survival")}` },
                  { key: "planned_optional" as const, label: `🛍️ ${t("planned_optional")}` },
                  { key: "planned_culture" as const, label: `📚 ${t("planned_culture")}` },
                  { key: "planned_extra" as const, label: `⚡ ${t("planned_extra")}` },
                  { key: "planned_savings" as const, label: t("planned_savings") },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                      <input type="number" value={formData[key] as string}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0" step="0.01" min="0" />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("notes")}</label>
                  <textarea value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2} placeholder={t("notes")} />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? t("saving") : t("create_budget")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}