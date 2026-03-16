"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguageStore } from "@/store/languageStore";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
  Loader2, RefreshCw, TrendingUp, TrendingDown,
  PiggyBank, Wallet, AlertTriangle, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

type ActiveTab = "weekly" | "monthly" | "yearly";

const CAT_META: Record<string, { color: string }> = {
  needs_spent:      { color: "#10b981" },
  wants_spent:      { color: "#f59e0b" },
  culture_spent:    { color: "#8b5cf6" },
  unexpected_spent: { color: "#ef4444" },
};

const CAT_LABELS: Record<string, string> = {
  needs_spent:      "🏠 Survival",
  wants_spent:      "🛍️ Optional",
  culture_spent:    "📚 Culture",
  unexpected_spent: "⚡ Extra",
};

function getISOWeek(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

function fmt(val: any) {
  return Number(val || 0).toLocaleString();
}

function SummaryCard({ label, value, icon, gradient }: {
  label: string; value: number; icon: React.ReactNode; gradient: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${gradient} text-white`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs opacity-90">{label}</span>
        <span className="opacity-80">{icon}</span>
      </div>
      <p className="text-lg font-bold">Rp {fmt(value)}</p>
    </div>
  );
}

function AdherenceBar({ pct, label }: { pct: number; label: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const color = pct > 100 ? "bg-red-500" : pct > 80 ? "bg-yellow-500" : "bg-green-500";
  const textColor = pct > 100 ? "text-red-600" : pct > 80 ? "text-yellow-600" : "text-green-600";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={`font-bold ${textColor}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full transition-all`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

function CategoryBarChart({ data, noDataLabel }: { data: any; noDataLabel: string }) {
  const chartData = [
    { name: "Survival", value: Number(data.needs_spent || 0),      fill: "#10b981" },
    { name: "Optional", value: Number(data.wants_spent || 0),      fill: "#f59e0b" },
    { name: "Culture",  value: Number(data.culture_spent || 0),    fill: "#8b5cf6" },
    { name: "Extra",    value: Number(data.unexpected_spent || 0), fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0)
    return <p className="text-center text-gray-400 text-sm py-10">{noDataLabel}</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: any) => [`Rp ${Number(v).toLocaleString()}`, "Spent"]} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function CategoryPieChart({ data, noDataLabel }: { data: any; noDataLabel: string }) {
  const chartData = [
    { name: "Survival", value: Number(data.needs_spent || 0),      fill: "#10b981" },
    { name: "Optional", value: Number(data.wants_spent || 0),      fill: "#f59e0b" },
    { name: "Culture",  value: Number(data.culture_spent || 0),    fill: "#8b5cf6" },
    { name: "Extra",    value: Number(data.unexpected_spent || 0), fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0)
    return <p className="text-center text-gray-400 text-sm py-10">{noDataLabel}</p>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}>
          {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
        </Pie>
        <Tooltip formatter={(v: any) => [`Rp ${Number(v).toLocaleString()}`, "Spent"]} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function ReportSelector({ reports, selected, onSelect, label }: {
  reports: any[]; selected: any; onSelect: (r: any) => void; label: (r: any) => string;
}) {
  if (reports.length === 0) return null;
  return (
    <div className="flex gap-2 flex-wrap">
      {reports.map((r) => (
        <button key={r.id} onClick={() => onSelect(r)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
            ${selected?.id === r.id
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
          {label(r)}
        </button>
      ))}
    </div>
  );
}

function ReflectionItem({ question, answer, color }: {
  question: string; answer: string; color: string;
}) {
  return (
    <div className="border-l-2 border-gray-200 pl-3">
      <p className="text-xs text-gray-400 mb-0.5">{question}</p>
      <p className={`text-sm font-semibold ${color}`}>{answer}</p>
    </div>
  );
}

export default function ReportsPage() {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("weekly");
  const [isLoading, setIsLoading] = useState(true);

  const MONTHS_SHORT = [
    t("january").slice(0, 3), t("february").slice(0, 3), t("march").slice(0, 3),
    t("april").slice(0, 3), t("may").slice(0, 3), t("june").slice(0, 3),
    t("july").slice(0, 3), t("august").slice(0, 3), t("september").slice(0, 3),
    t("october").slice(0, 3), t("november").slice(0, 3), t("december").slice(0, 3),
  ];
  const MONTHS_FULL = [
    t("january"), t("february"), t("march"), t("april"), t("may"), t("june"),
    t("july"), t("august"), t("september"), t("october"), t("november"), t("december"),
  ];

  const defaultMonday = () => {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().split("T")[0];
  };
  const defaultSunday = () => {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 6);
    return d.toISOString().split("T")[0];
  };

  const [weekStart, setWeekStart]           = useState(defaultMonday);
  const [weekEnd, setWeekEnd]               = useState(defaultSunday);
  const [weeklyReports, setWeeklyReports]   = useState<any[]>([]);
  const [selectedWeekly, setSelectedWeekly] = useState<any>(null);
  const [generatingW, setGeneratingW]       = useState(false);

  const [selMonth, setSelMonth]               = useState(new Date().getMonth() + 1);
  const [selMonthYear, setSelMonthYear]       = useState(new Date().getFullYear());
  const [monthlyReports, setMonthlyReports]   = useState<any[]>([]);
  const [selectedMonthly, setSelectedMonthly] = useState<any>(null);
  const [generatingM, setGeneratingM]         = useState(false);

  const [selYear, setSelYear]               = useState(new Date().getFullYear());
  const [yearlyReports, setYearlyReports]   = useState<any[]>([]);
  const [selectedYearly, setSelectedYearly] = useState<any>(null);
  const [generatingY, setGeneratingY]       = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [wRes, mRes, yRes] = await Promise.all([
        api.get("/reports/weekly/"),
        api.get("/reports/monthly/"),
        api.get("/reports/yearly/"),
      ]);
      const wData = Array.isArray(wRes.data) ? wRes.data : (wRes.data.results ?? []);
      const mData = Array.isArray(mRes.data) ? mRes.data : (mRes.data.results ?? []);
      const yData = Array.isArray(yRes.data) ? yRes.data : (yRes.data.results ?? []);
      setWeeklyReports(wData);  if (wData.length) setSelectedWeekly(wData[0]);
      setMonthlyReports(mData); if (mData.length) setSelectedMonthly(mData[0]);
      setYearlyReports(yData);  if (yData.length) setSelectedYearly(yData[0]);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const generateWeekly = async () => {
    if (!weekStart || !weekEnd) { toast.error("Select a date range"); return; }
    setGeneratingW(true);
    try {
      const week_number = getISOWeek(weekStart);
      const year = new Date(weekStart + "T00:00:00").getFullYear();
      const res = await api.post("/reports/weekly/generate/", {
        week_number, year, start_date: weekStart, end_date: weekEnd,
      });
      toast.success("Weekly report generated!");
      setSelectedWeekly(res.data);
      const list = await api.get("/reports/weekly/");
      setWeeklyReports(Array.isArray(list.data) ? list.data : list.data.results ?? []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate");
    } finally {
      setGeneratingW(false);
    }
  };

  const generateMonthly = async () => {
    setGeneratingM(true);
    try {
      const res = await api.post("/reports/monthly/generate/", { month: selMonth, year: selMonthYear });
      toast.success("Monthly report generated!");
      setSelectedMonthly(res.data);
      const list = await api.get("/reports/monthly/");
      setMonthlyReports(Array.isArray(list.data) ? list.data : list.data.results ?? []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate");
    } finally {
      setGeneratingM(false);
    }
  };

  const generateYearly = async () => {
    setGeneratingY(true);
    try {
      const res = await api.post("/reports/yearly/generate/", { year: selYear });
      toast.success("Yearly report generated!");
      setSelectedYearly(res.data);
      const list = await api.get("/reports/yearly/");
      setYearlyReports(Array.isArray(list.data) ? list.data : list.data.results ?? []);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to generate");
    } finally {
      setGeneratingY(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const noDataLabel = t("no_category_data");

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">{t("reports_title")}</h1>
        <p className="text-gray-500 mt-1">{t("reports_subtitle")}</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([
          { key: "weekly" as ActiveTab,  label: t("weekly")  },
          { key: "monthly" as ActiveTab, label: t("monthly") },
          { key: "yearly" as ActiveTab,  label: t("yearly")  },
        ]).map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── WEEKLY ── */}
      {activeTab === "weekly" && (
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("weekly_review")}</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("week_start")}</label>
                <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("week_end")}</label>
                <input type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <Button onClick={generateWeekly} isLoading={generatingW}>
                <RefreshCw className="w-4 h-4 mr-2" /> {t("generate_report")}
              </Button>
            </div>
          </motion.div>

          <ReportSelector reports={weeklyReports} selected={selectedWeekly} onSelect={setSelectedWeekly}
            label={(r) => `${t("week_number")} ${r.week_number}, ${r.year}`} />

          {selectedWeekly ? (
            <motion.div key={selectedWeekly.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-5">
              <p className="text-xs text-gray-400">
                📅 {new Date(selectedWeekly.start_date + "T00:00:00").toLocaleDateString()} –{" "}
                {new Date(selectedWeekly.end_date + "T00:00:00").toLocaleDateString()}
                {" "}· {t("week_number")} {selectedWeekly.week_number}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label={t("income")}   value={Number(selectedWeekly.total_income)}   icon={<TrendingUp className="w-4 h-4" />}   gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
                <SummaryCard label={t("expense")}  value={Number(selectedWeekly.total_expenses)} icon={<TrendingDown className="w-4 h-4" />} gradient="bg-gradient-to-br from-red-500 to-red-600" />
                <SummaryCard label={t("saving")}   value={Number(selectedWeekly.total_savings)}  icon={<PiggyBank className="w-4 h-4" />}   gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
                <SummaryCard label={t("net")}      value={Number(selectedWeekly.total_income) - Number(selectedWeekly.total_expenses)} icon={<Wallet className="w-4 h-4" />} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">🪞 {t("kakeibo_reflection")}</h3>
                  <div className="space-y-4">
                    <ReflectionItem question={t("reflection_q1")} answer={`Rp ${fmt(selectedWeekly.total_income)}`} color="text-emerald-600" />
                    <ReflectionItem question={t("reflection_q2")} answer={`Rp ${fmt(selectedWeekly.total_expenses)}`} color="text-red-600" />
                    <ReflectionItem question={t("reflection_q3")} answer={`Rp ${fmt(selectedWeekly.total_savings)}`} color="text-blue-600" />
                    <ReflectionItem question={t("reflection_q4")}
                      answer={
                        Number(selectedWeekly.savings_rate) >= 20
                          ? "🎉 Great job! Savings rate is above 20%."
                          : Number(selectedWeekly.savings_rate) >= 10
                          ? "👍 Good progress. Aim for 20%+ savings."
                          : "⚠️ Low savings rate. Review optional spending."
                      }
                      color={
                        Number(selectedWeekly.savings_rate) >= 20 ? "text-green-600"
                          : Number(selectedWeekly.savings_rate) >= 10 ? "text-yellow-600"
                          : "text-red-600"
                      } />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">📊 {t("key_metrics")}</h3>
                  <div className="space-y-4">
                    <AdherenceBar pct={Number(selectedWeekly.budget_adherence)} label={t("budget_used")} />
                    <AdherenceBar pct={Number(selectedWeekly.savings_rate)}     label={t("savings_rate")} />
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      {Object.entries(CAT_META).map(([key, { color }]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-gray-600">{CAT_LABELS[key]}</span>
                          </div>
                          <span className="font-medium text-gray-800">Rp {fmt((selectedWeekly as any)[key])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">{t("spending_by_category")}</h3>
                <CategoryBarChart data={selectedWeekly} noDataLabel={noDataLabel} />
              </div>
            </motion.div>
          ) : (
            <EmptyState label={t("no_weekly_reports")} />
          )}
        </div>
      )}

      {/* ── MONTHLY ── */}
      {activeTab === "monthly" && (
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("monthly_report")}</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("select_month")}</label>
                <select value={selMonth} onChange={(e) => setSelMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {MONTHS_FULL.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("select_year")}</label>
                <input type="number" min="2000" value={selMonthYear}
                  onChange={(e) => setSelMonthYear(parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <Button onClick={generateMonthly} isLoading={generatingM}>
                <RefreshCw className="w-4 h-4 mr-2" /> {t("generate_report")}
              </Button>
            </div>
          </motion.div>

          <ReportSelector reports={monthlyReports} selected={selectedMonthly} onSelect={setSelectedMonthly}
            label={(r) => `${MONTHS_SHORT[r.month - 1]} ${r.year}`} />

          {selectedMonthly ? (
            <motion.div key={selectedMonthly.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-5">
              <p className="text-xs text-gray-400">📅 {MONTHS_FULL[selectedMonthly.month - 1]} {selectedMonthly.year}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label={t("income")}    value={Number(selectedMonthly.total_income)}          icon={<TrendingUp className="w-4 h-4" />}   gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
                <SummaryCard label={t("expense")}   value={Number(selectedMonthly.total_expenses)}        icon={<TrendingDown className="w-4 h-4" />} gradient="bg-gradient-to-br from-red-500 to-red-600" />
                <SummaryCard label={t("saving")}    value={Number(selectedMonthly.total_savings)}         icon={<PiggyBank className="w-4 h-4" />}   gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
                <SummaryCard label={t("avg_daily")} value={Number(selectedMonthly.average_daily_spending)} icon={<Wallet className="w-4 h-4" />}      gradient="bg-gradient-to-br from-orange-500 to-orange-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">{t("spending_distribution")}</h3>
                  <CategoryPieChart data={selectedMonthly} noDataLabel={noDataLabel} />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">💡 {t("insights")}</h3>
                  <div className="space-y-4">
                    <AdherenceBar pct={Number(selectedMonthly.budget_adherence)} label={t("budget_used")} />
                    <AdherenceBar pct={Number(selectedMonthly.savings_rate)} label={t("savings_rate")} />

                    {selectedMonthly.top_expense_category && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-amber-700">{t("top_category")}</p>
                          <p className="text-sm font-bold text-amber-900 capitalize">{selectedMonthly.top_expense_category}</p>
                        </div>
                      </div>
                    )}

                    {Number(selectedMonthly.savings_rate) < 10 && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-xs text-red-700">⚠️ {t("spending_leak")}</p>
                      </div>
                    )}

                    {Number(selectedMonthly.savings_rate) >= 20 && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className="text-xs text-green-700">🎉 Great month! You saved over 20% of your income.</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      {Object.entries(CAT_META).map(([key, { color }]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-gray-600">{CAT_LABELS[key]}</span>
                          </div>
                          <span className="font-medium text-gray-800">Rp {fmt((selectedMonthly as any)[key])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">{t("category_breakdown")}</h3>
                <CategoryBarChart data={selectedMonthly} noDataLabel={noDataLabel} />
              </div>
            </motion.div>
          ) : (
            <EmptyState label={t("no_monthly_reports")} />
          )}
        </div>
      )}

      {/* ── YEARLY ── */}
      {activeTab === "yearly" && (
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("yearly_report")}</h2>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("select_year")}</label>
                <input type="number" min="2000" value={selYear}
                  onChange={(e) => setSelYear(parseInt(e.target.value))}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <Button onClick={generateYearly} isLoading={generatingY}>
                <RefreshCw className="w-4 h-4 mr-2" /> {t("generate_report")}
              </Button>
            </div>
          </motion.div>

          <ReportSelector reports={yearlyReports} selected={selectedYearly} onSelect={setSelectedYearly}
            label={(r) => `${r.year}`} />

          {selectedYearly ? (
            <motion.div key={selectedYearly.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-5">
              <p className="text-xs text-gray-400">📅 {t("yearly_overview")} {selectedYearly.year}</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SummaryCard label={t("total_income")}   value={Number(selectedYearly.total_income)}   icon={<TrendingUp className="w-4 h-4" />}   gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
                <SummaryCard label={t("total_expenses")} value={Number(selectedYearly.total_expenses)} icon={<TrendingDown className="w-4 h-4" />} gradient="bg-gradient-to-br from-red-500 to-red-600" />
                <SummaryCard label={t("total_savings")}  value={Number(selectedYearly.total_savings)}  icon={<PiggyBank className="w-4 h-4" />}   gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">{t("monthly_averages")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: t("avg_income"),   val: selectedYearly.average_monthly_income,   color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: t("avg_expenses"), val: selectedYearly.average_monthly_expenses, color: "text-red-600",     bg: "bg-red-50" },
                    { label: t("avg_savings"),  val: selectedYearly.average_monthly_savings,  color: "text-blue-600",    bg: "bg-blue-50" },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className={`${bg} rounded-lg p-4`}>
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <p className={`text-lg font-bold ${color}`}>Rp {fmt(val)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">📈 {t("yearly_overview")}</h3>
                  <div className="space-y-4">
                    <AdherenceBar pct={Number(selectedYearly.budget_adherence)} label={t("budget_used")} />
                    <AdherenceBar pct={Number(selectedYearly.savings_rate)}     label={t("savings_rate")} />

                    {selectedYearly.best_month && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-green-700">{t("best_month")}</p>
                          <p className="text-sm font-bold text-green-800">{MONTHS_FULL[selectedYearly.best_month - 1]}</p>
                        </div>
                      </div>
                    )}

                    {selectedYearly.worst_month && (
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-red-700">{t("worst_month")}</p>
                          <p className="text-sm font-bold text-red-800">{MONTHS_FULL[selectedYearly.worst_month - 1]}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900 mb-4">{t("category_breakdown")}</h3>
                  <div className="space-y-3">
                    {Object.entries(CAT_META).map(([key, { color }]) => {
                      const val   = Number((selectedYearly as any)[key] || 0);
                      const total = Number(selectedYearly.total_expenses || 1);
                      const pct   = total > 0 ? (val / total) * 100 : 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-0.5">
                            <span className="text-gray-600">{CAT_LABELS[key]}</span>
                            <span className="font-medium">
                              Rp {fmt(val)}{" "}
                              <span className="text-xs text-gray-400">({pct.toFixed(1)}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">{t("spending_by_category")}</h3>
                <CategoryBarChart data={selectedYearly} noDataLabel={noDataLabel} />
              </div>
            </motion.div>
          ) : (
            <EmptyState label={t("no_yearly_reports")} />
          )}
        </div>
      )}
    </div>
  );
}