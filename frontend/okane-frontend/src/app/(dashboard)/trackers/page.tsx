"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguageStore } from "@/store/languageStore";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, PiggyBank, CreditCard, Calendar, Plus, Edit, Trash2,
  X, TrendingDown, Banknote, CheckCircle, AlertTriangle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";

interface SavingsTracker {
  id: number; goal_name: string; target_amount: number; current_amount: number;
  remaining_amount: number; progress_percentage: number; target_date: string | null;
  priority: 1 | 2 | 3; notes: string; is_completed: boolean; completed_at: string | null;
}
interface DebtTracker {
  id: number; debt_name: string; creditor: string; original_amount: number;
  paid_amount: number; remaining_amount: number; progress_percentage: number;
  interest_rate: number; due_date: string; minimum_payment: number;
  priority: 1 | 2 | 3; notes: string; is_paid_off: boolean;
}
interface LoanTracker {
  id: number; loan_name: string; lender: string; original_amount: number;
  paid_amount: number; remaining_amount: number; progress_percentage: number;
  interest_rate: number; monthly_payment: number; start_date: string | null;
  end_date: string | null; priority: 1 | 2 | 3; notes: string; is_paid_off: boolean;
}
interface SubscriptionTracker {
  id: number; service_name: string; cost: number; billing_cycle: string;
  start_date: string | null; next_billing_date: string; days_until_renewal: number;
  annual_cost: number; category: string; auto_renewal: boolean;
  payment_method: string; notes: string; is_active: boolean;
}

type ActiveTab = "savings" | "debts" | "loans" | "subscriptions";

const PRIORITY_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-600",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-red-100 text-red-700",
};

const BILLING_CYCLE_LABELS: Record<string, string> = {
  daily: "Daily", weekly: "Weekly", monthly: "Monthly",
  quarterly: "Quarterly", yearly: "Yearly",
};

const SUB_CATEGORY_LABELS: Record<string, string> = {
  entertainment: "🎬 Entertainment", productivity: "💼 Productivity",
  health: "🏋️ Health", education: "📚 Education", other: "📦 Other",
};

const EMPTY_SAVINGS = { goal_name: "", target_amount: "", current_amount: "", target_date: "", priority: "2", notes: "" };
const EMPTY_DEBT = { debt_name: "", creditor: "", original_amount: "", paid_amount: "", interest_rate: "", due_date: "", minimum_payment: "", priority: "2", notes: "" };
const EMPTY_LOAN = { loan_name: "", lender: "", original_amount: "", paid_amount: "", interest_rate: "", monthly_payment: "", start_date: "", end_date: "", priority: "2", notes: "" };
const EMPTY_SUB = { service_name: "", cost: "", billing_cycle: "monthly", start_date: "", next_billing_date: "", category: "other", auto_renewal: true, payment_method: "", notes: "" };

function ProgressBar({ pct, color = "bg-blue-500" }: { pct: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 text-center">
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm";

export default function TrackersPage() {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("savings");
  const [isLoading, setIsLoading] = useState(true);

  const [savings, setSavings] = useState<SavingsTracker[]>([]);
  const [debts, setDebts] = useState<DebtTracker[]>([]);
  const [loans, setLoans] = useState<LoanTracker[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionTracker[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{ type: "savings" | "debt" | "loan"; item: any } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sRes, dRes, lRes, subRes] = await Promise.all([
        api.get("/trackers/savings/"),
        api.get("/trackers/debts/"),
        api.get("/trackers/loans/"),
        api.get("/trackers/subscriptions/"),
      ]);
      setSavings(Array.isArray(sRes.data) ? sRes.data : sRes.data.results ?? []);
      setDebts(Array.isArray(dRes.data) ? dRes.data : dRes.data.results ?? []);
      setLoans(Array.isArray(lRes.data) ? lRes.data : lRes.data.results ?? []);
      setSubscriptions(Array.isArray(subRes.data) ? subRes.data : subRes.data.results ?? []);
    } catch {
      toast.error("Failed to load trackers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => {
    setEditingItem(null);
    if (activeTab === "savings") setFormData({ ...EMPTY_SAVINGS });
    else if (activeTab === "debts") setFormData({ ...EMPTY_DEBT });
    else if (activeTab === "loans") setFormData({ ...EMPTY_LOAN });
    else setFormData({ ...EMPTY_SUB });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === "savings") {
      setFormData({
        goal_name: item.goal_name, target_amount: item.target_amount,
        current_amount: item.current_amount, target_date: item.target_date || "",
        priority: String(item.priority), notes: item.notes,
      });
    } else if (activeTab === "debts") {
      setFormData({
        debt_name: item.debt_name, creditor: item.creditor,
        original_amount: item.original_amount, paid_amount: item.paid_amount,
        interest_rate: item.interest_rate, due_date: item.due_date,
        minimum_payment: item.minimum_payment, priority: String(item.priority), notes: item.notes,
      });
    } else if (activeTab === "loans") {
      setFormData({
        loan_name: item.loan_name, lender: item.lender,
        original_amount: item.original_amount, paid_amount: item.paid_amount,
        interest_rate: item.interest_rate, monthly_payment: item.monthly_payment,
        start_date: item.start_date || "", end_date: item.end_date || "",
        priority: String(item.priority), notes: item.notes,
      });
    } else {
      setFormData({
        service_name: item.service_name, cost: item.cost,
        billing_cycle: item.billing_cycle, start_date: item.start_date || "",
        next_billing_date: item.next_billing_date, category: item.category,
        auto_renewal: item.auto_renewal, payment_method: item.payment_method, notes: item.notes,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = `/trackers/${activeTab}/`;
    try {
      const payload = { ...formData, priority: formData.priority ? parseInt(formData.priority) : undefined };
      if (editingItem) {
        await api.put(`${endpoint}${editingItem.id}/`, payload);
        toast.success("Updated successfully!");
      } else {
        await api.post(endpoint, payload);
        toast.success("Created successfully!");
      }
      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/trackers/${activeTab}/${id}/`);
      toast.success("Deleted!");
      fetchAll();
    } catch { toast.error("Failed to delete"); }
  };

  const openPayment = (type: "savings" | "debt" | "loan", item: any) => {
    setPaymentTarget({ type, item });
    setPaymentAmount("");
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!paymentTarget || !paymentAmount || parseFloat(paymentAmount) <= 0) return;
    const { type, item } = paymentTarget;
    try {
      if (type === "savings") {
        await api.post(`/trackers/savings/${item.id}/add_amount/`, { amount: parseFloat(paymentAmount) });
        toast.success("Amount added to savings!");
      } else if (type === "debt") {
        await api.post(`/trackers/debts/${item.id}/make_payment/`, { amount: parseFloat(paymentAmount) });
        toast.success("Payment recorded!");
      } else {
        await api.post(`/trackers/loans/${item.id}/make_payment/`, { amount: parseFloat(paymentAmount) });
        toast.success("Payment recorded!");
      }
      setShowPaymentModal(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to record payment");
    }
  };

  const handleToggleSubscription = async (sub: SubscriptionTracker) => {
    try {
      if (sub.is_active) {
        await api.post(`/trackers/subscriptions/${sub.id}/cancel/`);
        toast.success("Subscription cancelled");
      } else {
        await api.post(`/trackers/subscriptions/${sub.id}/reactivate/`);
        toast.success("Subscription reactivated");
      }
      fetchAll();
    } catch { toast.error("Failed to update subscription"); }
  };

  const tabs = [
    { key: "savings" as ActiveTab,       icon: <PiggyBank className="w-4 h-4" />,  color: "text-green-600"  },
    { key: "debts" as ActiveTab,         icon: <CreditCard className="w-4 h-4" />, color: "text-red-600"    },
    { key: "loans" as ActiveTab,         icon: <Banknote className="w-4 h-4" />,   color: "text-orange-600" },
    { key: "subscriptions" as ActiveTab, icon: <Calendar className="w-4 h-4" />,   color: "text-blue-600"   },
  ];

  const tabLabelKeys: Record<ActiveTab, "savings_goals" | "debts" | "loans" | "subscriptions"> = {
    savings: "savings_goals",
    debts: "debts",
    loans: "loans",
    subscriptions: "subscriptions",
  };

  const addLabelKeys: Record<ActiveTab, "add_savings_goal" | "add_debt" | "add_loan" | "add_subscription"> = {
    savings: "add_savings_goal",
    debts: "add_debt",
    loans: "add_loan",
    subscriptions: "add_subscription",
  };

  const emptyLabelKeys: Record<ActiveTab, "no_savings" | "no_debts" | "no_loans" | "no_subscriptions"> = {
    savings: "no_savings",
    debts: "no_debts",
    loans: "no_loans",
    subscriptions: "no_subscriptions",
  };

  const priorityLabel = (p: number) => ({ 1: t("low"), 2: t("medium"), 3: t("high") }[p] ?? "");

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
          <h1 className="text-3xl font-bold text-gray-900">{t("trackers_title")}</h1>
          <p className="text-gray-500 mt-1">{t("trackers_subtitle")}</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-5 h-5 mr-2" /> {t(addLabelKeys[activeTab])}
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            <span className={activeTab === tab.key ? tab.color : ""}>{tab.icon}</span>
            <span className="hidden sm:inline">{t(tabLabelKeys[tab.key])}</span>
          </button>
        ))}
      </div>

      {/* Savings Tab */}
      {activeTab === "savings" && (
        <div className="space-y-4">
          {savings.length === 0 ? (
            <EmptyState label={t(emptyLabelKeys.savings)} />
          ) : (
            savings.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border p-5 ${item.is_completed ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.is_completed ? "bg-green-100" : "bg-green-50"}`}>
                      {item.is_completed
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <PiggyBank className="w-5 h-5 text-green-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.goal_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[item.priority]}`}>
                          {priorityLabel(item.priority)}
                        </span>
                        {item.is_completed && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{t("completed_label")}</span>}
                        {item.target_date && <span className="text-xs text-gray-500">{t("due")} {new Date(item.target_date + "T00:00:00").toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!item.is_completed && (
                      <button onClick={() => openPayment("savings", item)}
                        className="px-3 py-1.5 text-xs text-green-700 bg-green-100 hover:bg-green-200 rounded-lg font-medium transition-colors">
                        {t("add_funds")}
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("progress")}</span>
                    <span className="font-medium text-gray-900">{item.progress_percentage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar pct={item.progress_percentage} color="bg-green-500" />
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">{t("saved")}: <span className="text-green-600 font-medium">Rp {Number(item.current_amount).toLocaleString()}</span></span>
                    <span className="text-gray-500">{t("target")}: <span className="font-medium text-gray-900">Rp {Number(item.target_amount).toLocaleString()}</span></span>
                  </div>
                  {!item.is_completed && <p className="text-xs text-gray-400">{t("remaining")}: Rp {Number(item.remaining_amount).toLocaleString()}</p>}
                </div>
                {item.notes && <p className="mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2">{item.notes}</p>}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Debts Tab */}
      {activeTab === "debts" && (
        <div className="space-y-4">
          {debts.length === 0 ? (
            <EmptyState label={t(emptyLabelKeys.debts)} />
          ) : (
            debts.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border p-5 ${item.is_paid_off ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.is_paid_off ? "bg-green-100" : "bg-red-50"}`}>
                      {item.is_paid_off
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <CreditCard className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.debt_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">{t("to")} {item.creditor}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[item.priority]}`}>{priorityLabel(item.priority)}</span>
                        {item.is_paid_off && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{t("paid_off_label")}</span>}
                        <span className="text-xs text-gray-500">{t("due")} {new Date(item.due_date + "T00:00:00").toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!item.is_paid_off && (
                      <button onClick={() => openPayment("debt", item)}
                        className="px-3 py-1.5 text-xs text-red-700 bg-red-100 hover:bg-red-200 rounded-lg font-medium transition-colors">
                        {t("make_payment")}
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("paid_off_text")}</span>
                    <span className="font-medium text-gray-900">{item.progress_percentage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar pct={item.progress_percentage} color="bg-red-400" />
                  <div className="flex justify-between text-sm mt-1 flex-wrap gap-2">
                    <span className="text-gray-500">{t("paid")}: <span className="text-green-600 font-medium">Rp {Number(item.paid_amount).toLocaleString()}</span></span>
                    <span className="text-gray-500">{t("total")}: <span className="font-medium text-gray-900">Rp {Number(item.original_amount).toLocaleString()}</span></span>
                  </div>
                  {!item.is_paid_off && (
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>{t("remaining")}: Rp {Number(item.remaining_amount).toLocaleString()}</span>
                      {Number(item.interest_rate) > 0 && <span>{t("rate")}: {item.interest_rate}%</span>}
                      {Number(item.minimum_payment) > 0 && <span>{t("min_payment_hint")}: Rp {Number(item.minimum_payment).toLocaleString()}</span>}
                    </div>
                  )}
                </div>
                {item.notes && <p className="mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2">{item.notes}</p>}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === "loans" && (
        <div className="space-y-4">
          {loans.length === 0 ? (
            <EmptyState label={t(emptyLabelKeys.loans)} />
          ) : (
            loans.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border p-5 ${item.is_paid_off ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.is_paid_off ? "bg-green-100" : "bg-orange-50"}`}>
                      {item.is_paid_off
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <Banknote className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.loan_name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">{t("from")} {item.lender}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[item.priority]}`}>{priorityLabel(item.priority)}</span>
                        {item.is_paid_off && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{t("paid_off_label")}</span>}
                        {item.end_date && <span className="text-xs text-gray-500">{t("until")} {new Date(item.end_date + "T00:00:00").toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!item.is_paid_off && (
                      <button onClick={() => openPayment("loan", item)}
                        className="px-3 py-1.5 text-xs text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg font-medium transition-colors">
                        {t("make_payment")}
                      </button>
                    )}
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("paid_off_text")}</span>
                    <span className="font-medium text-gray-900">{item.progress_percentage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar pct={item.progress_percentage} color="bg-orange-400" />
                  <div className="flex justify-between text-sm mt-1 flex-wrap gap-2">
                    <span className="text-gray-500">{t("paid")}: <span className="text-green-600 font-medium">Rp {Number(item.paid_amount).toLocaleString()}</span></span>
                    <span className="text-gray-500">{t("total")}: <span className="font-medium text-gray-900">Rp {Number(item.original_amount).toLocaleString()}</span></span>
                  </div>
                  {!item.is_paid_off && (
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>{t("remaining")}: Rp {Number(item.remaining_amount).toLocaleString()}</span>
                      {Number(item.interest_rate) > 0 && <span>{t("rate")}: {item.interest_rate}%</span>}
                      {Number(item.monthly_payment) > 0 && <span>{t("monthly_payment")}: Rp {Number(item.monthly_payment).toLocaleString()}</span>}
                    </div>
                  )}
                </div>
                {item.notes && <p className="mt-2 text-xs text-gray-500 border-t border-gray-100 pt-2">{item.notes}</p>}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <EmptyState label={t(emptyLabelKeys.subscriptions)} />
          ) : (
            subscriptions.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border p-5 ${!item.is_active ? "border-gray-200 opacity-60" : item.days_until_renewal <= 3 ? "border-yellow-300" : "border-gray-100"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.is_active ? "bg-blue-50" : "bg-gray-100"}`}>
                      <Calendar className={`w-5 h-5 ${item.is_active ? "text-blue-500" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{item.service_name}</h3>
                        {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t("cancelled")}</span>}
                        {item.is_active && item.days_until_renewal <= 3 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Renews soon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">{SUB_CATEGORY_LABELS[item.category]}</span>
                        <span className="text-xs text-gray-400">· {BILLING_CYCLE_LABELS[item.billing_cycle]}</span>
                        {item.auto_renewal && <span className="text-xs text-blue-500">· {t("auto_renewal")}</span>}
                        {item.payment_method && <span className="text-xs text-gray-400">· {item.payment_method}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">Rp {Number(item.cost).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">/{item.billing_cycle}</p>
                    </div>
                    <button onClick={() => handleToggleSubscription(item)}
                      className={`p-1.5 rounded-lg transition-colors ${item.is_active ? "text-gray-500 hover:bg-gray-100" : "text-green-500 hover:bg-green-50"}`}
                      title={item.is_active ? t("cancel_subscription") : t("reactivate_subscription")}>
                      {item.is_active ? <TrendingDown className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {item.is_active && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span>
                      {new Date(item.next_billing_date + "T00:00:00").toLocaleDateString()}
                      {" "}({item.days_until_renewal >= 0 ? `${item.days_until_renewal} ${t("days_until_renewal")}` : "overdue"})
                    </span>
                    <span>{t("annual_cost")}: Rp {Number(item.annual_cost).toLocaleString()}</span>
                  </div>
                )}
                {item.notes && <p className="mt-2 text-xs text-gray-500">{item.notes}</p>}
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingItem ? t("edit") : t("add")} {t(tabLabelKeys[activeTab])}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === "savings" && (
                  <>
                    <Field label={t("goal_name")} required>
                      <input type="text" required value={formData.goal_name} onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`${t("target_amount")} (Rp)`} required>
                        <input type="number" required min="1" value={formData.target_amount} onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                      <Field label={`${t("current_amount")} (Rp)`}>
                        <input type="number" min="0" value={formData.current_amount} onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("target_date")}>
                        <input type="date" value={formData.target_date} onChange={(e) => setFormData({ ...formData, target_date: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label={t("priority")}>
                        <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputCls}>
                          <option value="1">{t("low")}</option>
                          <option value="2">{t("medium")}</option>
                          <option value="3">{t("high")}</option>
                        </select>
                      </Field>
                    </div>
                    <Field label={t("notes")}>
                      <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls + " resize-none"} rows={2} />
                    </Field>
                  </>
                )}

                {activeTab === "debts" && (
                  <>
                    <Field label={t("debt_name")} required>
                      <input type="text" required value={formData.debt_name} onChange={(e) => setFormData({ ...formData, debt_name: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label={t("creditor")} required>
                      <input type="text" required value={formData.creditor} onChange={(e) => setFormData({ ...formData, creditor: e.target.value })} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`${t("original_amount")} (Rp)`} required>
                        <input type="number" required min="1" value={formData.original_amount} onChange={(e) => setFormData({ ...formData, original_amount: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                      <Field label={`${t("paid_amount")} (Rp)`}>
                        <input type="number" min="0" value={formData.paid_amount} onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("interest_rate")}>
                        <input type="number" min="0" step="0.01" value={formData.interest_rate} onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                      <Field label={`${t("minimum_payment")} (Rp)`}>
                        <input type="number" min="0" value={formData.minimum_payment} onChange={(e) => setFormData({ ...formData, minimum_payment: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("due_date")} required>
                        <input type="date" required value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label={t("priority")}>
                        <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputCls}>
                          <option value="1">{t("low")}</option>
                          <option value="2">{t("medium")}</option>
                          <option value="3">{t("high")}</option>
                        </select>
                      </Field>
                    </div>
                    <Field label={t("notes")}>
                      <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls + " resize-none"} rows={2} />
                    </Field>
                  </>
                )}

                {activeTab === "loans" && (
                  <>
                    <Field label={t("loan_name")} required>
                      <input type="text" required value={formData.loan_name} onChange={(e) => setFormData({ ...formData, loan_name: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label={t("lender")} required>
                      <input type="text" required value={formData.lender} onChange={(e) => setFormData({ ...formData, lender: e.target.value })} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`${t("original_amount")} (Rp)`} required>
                        <input type="number" required min="1" value={formData.original_amount} onChange={(e) => setFormData({ ...formData, original_amount: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                      <Field label={`${t("paid_amount")} (Rp)`}>
                        <input type="number" min="0" value={formData.paid_amount} onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("interest_rate")}>
                        <input type="number" min="0" step="0.01" value={formData.interest_rate} onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                      <Field label={`${t("monthly_payment")} (Rp)`}>
                        <input type="number" min="0" value={formData.monthly_payment} onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("start_date")}>
                        <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label={t("end_date")}>
                        <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                    <Field label={t("priority")}>
                      <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputCls}>
                        <option value="1">{t("low")}</option>
                        <option value="2">{t("medium")}</option>
                        <option value="3">{t("high")}</option>
                      </select>
                    </Field>
                    <Field label={t("notes")}>
                      <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls + " resize-none"} rows={2} />
                    </Field>
                  </>
                )}

                {activeTab === "subscriptions" && (
                  <>
                    <Field label={t("service_name")} required>
                      <input type="text" required value={formData.service_name} onChange={(e) => setFormData({ ...formData, service_name: e.target.value })} className={inputCls} placeholder="e.g. Netflix" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={`${t("cost")} (Rp)`} required>
                        <input type="number" required min="1" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className={inputCls} placeholder="0" />
                      </Field>
                      <Field label={t("billing_cycle")}>
                        <select value={formData.billing_cycle} onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })} className={inputCls}>
                          {Object.entries(BILLING_CYCLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("start_date")}>
                        <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label={t("next_billing_date")} required>
                        <input type="date" required value={formData.next_billing_date} onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })} className={inputCls} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label={t("category")}>
                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls}>
                          {Object.entries(SUB_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </Field>
                      <Field label={t("payment_method")}>
                        <input type="text" value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className={inputCls} placeholder="e.g. GoPay" />
                      </Field>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="auto_renewal" checked={formData.auto_renewal}
                        onChange={(e) => setFormData({ ...formData, auto_renewal: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600" />
                      <label htmlFor="auto_renewal" className="text-sm text-gray-700">{t("auto_renewal")}</label>
                    </div>
                    <Field label={t("notes")}>
                      <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={inputCls + " resize-none"} rows={2} />
                    </Field>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    {t("cancel")}
                  </button>
                  <Button type="submit" className="flex-1">
                    {editingItem ? t("save_changes") : t("add")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment / Add Funds Modal */}
      <AnimatePresence>
        {showPaymentModal && paymentTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {paymentTarget.type === "savings" ? t("add_amount_title") : t("payment_title")}
                </h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {paymentTarget.type === "savings"
                  ? `"${paymentTarget.item.goal_name}"`
                  : `"${paymentTarget.item.debt_name || paymentTarget.item.loan_name}"`}
              </p>
              <Field label={`${t("amount")} (Rp)`}>
                <input type="number" min="1" autoFocus value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handlePayment(); }}
                  className={inputCls} placeholder="0" />
              </Field>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  {t("cancel")}
                </button>
                <Button onClick={handlePayment} className="flex-1" disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}>
                  {t("confirm")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}