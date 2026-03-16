"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Search, Edit, Trash2, ArrowUpCircle,
  ArrowDownCircle, PiggyBank, Calendar, X, ChevronLeft,
  ChevronRight, CheckSquare, Square, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";

interface Transaction {
  id: number;
  transaction_type: "income" | "expense" | "saving";
  category: "survival" | "optional" | "culture" | "extra" | null;
  amount: number;
  description: string;
  notes: string;
  date: string;
  shopping_group: string;
  is_recurring: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  transaction_type: "expense",
  category: "survival",
  amount: "",
  description: "",
  notes: "",
  date: new Date().toISOString().split("T")[0],
  shopping_group: "",
  is_recurring: false,
};

const TYPE_COLORS: Record<string, string> = {
  income: "text-emerald-600",
  expense: "text-red-600",
  saving: "text-blue-600",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  income: <ArrowUpCircle className="w-5 h-5 text-emerald-600" />,
  expense: <ArrowDownCircle className="w-5 h-5 text-red-600" />,
  saving: <PiggyBank className="w-5 h-5 text-blue-600" />,
};

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const CATEGORY_LABELS = () => ({
    survival: `🏠 ${t("survival")}`,
    optional: `🛍️ ${t("optional")}`,
    culture: `📚 ${t("culture")}`,
    extra: `⚡ ${t("extra")}`,
  });

  const fetchTransactions = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page, page_size: PAGE_SIZE, ordering: "-date" };
      if (filterType !== "all") params.transaction_type = filterType;
      if (filterCategory !== "all") params.category = filterCategory;
      if (startDate) params.date__gte = startDate;
      if (endDate) params.date__lte = endDate;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get("/transactions/", { params });
      const data = res.data;
      if (data.results !== undefined) {
        setTransactions(data.results);
        setTotalCount(data.count);
      } else {
        setTransactions(Array.isArray(data) ? data : []);
        setTotalCount(Array.isArray(data) ? data.length : 0);
      }
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [filterType, filterCategory, startDate, endDate, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => { setCurrentPage(1); fetchTransactions(1); }, 300);
    return () => clearTimeout(timer);
  }, [filterType, filterCategory, startDate, endDate, searchQuery]);

  useEffect(() => { fetchTransactions(currentPage); }, [currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        category: formData.transaction_type === "expense" ? formData.category : null,
      };
      if (editingTx) {
        await api.put(`/transactions/${editingTx.id}/`, payload);
        toast.success("Transaction updated!");
      } else {
        await api.post("/transactions/", payload);
        toast.success("Transaction added!");
      }
      setShowModal(false);
      setEditingTx(null);
      setFormData({ ...EMPTY_FORM });
      fetchTransactions(currentPage);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save transaction");
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormData({
      transaction_type: tx.transaction_type,
      category: tx.category || "survival",
      amount: tx.amount.toString(),
      description: tx.description,
      notes: tx.notes,
      date: tx.date,
      shopping_group: tx.shopping_group,
      is_recurring: tx.is_recurring,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}/`);
      toast.success("Deleted!");
      fetchTransactions(currentPage);
    } catch { toast.error("Failed to delete"); }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all([...selectedIds].map((id) => api.delete(`/transactions/${id}/`)));
      toast.success(`${selectedIds.size} transactions deleted!`);
      setShowBulkConfirm(false);
      setSelectedIds(new Set());
      fetchTransactions(currentPage);
    } catch { toast.error("Failed to delete some transactions"); }
  };

  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.size === transactions.length
      ? new Set()
      : new Set(transactions.map((t) => t.id)));

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const pageSummary = {
    income: transactions.filter((tx) => tx.transaction_type === "income").reduce((s, tx) => s + Number(tx.amount), 0),
    expense: transactions.filter((tx) => tx.transaction_type === "expense").reduce((s, tx) => s + Number(tx.amount), 0),
    saving: transactions.filter((tx) => tx.transaction_type === "saving").reduce((s, tx) => s + Number(tx.amount), 0),
  };

  const categoryLabels = CATEGORY_LABELS();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("transactions_title")}</h1>
          <p className="text-gray-500 mt-1">{t("transactions_subtitle")}</p>
        </div>
        <Button onClick={() => { setEditingTx(null); setFormData({ ...EMPTY_FORM }); setShowModal(true); }}>
          <Plus className="w-5 h-5 mr-2" /> {t("add_transaction")}
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: t("total_income"), value: pageSummary.income, Icon: ArrowUpCircle, grad: "from-emerald-500 to-emerald-600" },
          { label: t("total_expenses"), value: pageSummary.expense, Icon: ArrowDownCircle, grad: "from-red-500 to-red-600" },
          { label: t("total_savings"), value: pageSummary.saving, Icon: PiggyBank, grad: "from-blue-500 to-blue-600" },
        ].map(({ label, value, Icon, grad }, i) => (
          <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${grad} rounded-xl p-5 text-white shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-90">{label}</span>
              <Icon className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold">Rp {value.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-1">{t("on_this_page")} ({transactions.length} {t("records")})</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder={t("search")}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="all">{t("all_types")}</option>
            <option value="income">{t("income")}</option>
            <option value="expense">{t("expense")}</option>
            <option value="saving">{t("saving")}</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="all">{t("all_categories")}</option>
            <option value="survival">🏠 {t("survival")}</option>
            <option value="optional">🛍️ {t("optional")}</option>
            <option value="culture">📚 {t("culture")}</option>
            <option value="extra">⚡ {t("extra")}</option>
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
            <span className="text-gray-400 text-sm">–</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          {(searchQuery || filterType !== "all" || filterCategory !== "all" || startDate || endDate) && (
            <button onClick={() => { setSearchQuery(""); setFilterType("all"); setFilterCategory("all"); setStartDate(""); setEndDate(""); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.size} {t("selected_transactions")}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-blue-100 rounded-lg">
                {t("deselect_all")}
              </button>
              <button onClick={() => setShowBulkConfirm(true)}
                className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1">
                <Trash2 className="w-4 h-4" /> {t("delete_selected")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
            {selectedIds.size === transactions.length && transactions.length > 0
              ? <CheckSquare className="w-5 h-5 text-blue-600" />
              : <Square className="w-5 h-5" />}
          </button>
          <span className="text-sm text-gray-500">{totalCount} {t("records")}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">{t("no_transactions")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx, i) => (
              <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedIds.has(tx.id) ? "bg-blue-50" : ""}`}>
                <button onClick={() => toggleSelect(tx.id)} className="text-gray-400 hover:text-blue-600 flex-shrink-0">
                  {selectedIds.has(tx.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                </button>
                {TYPE_ICONS[tx.transaction_type]}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 truncate">{tx.description}</span>
                    {tx.category && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex-shrink-0">
                        {categoryLabels[tx.category]}
                      </span>
                    )}
                    {tx.is_recurring && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full flex-shrink-0">
                        {t("recurring")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                    <span>{new Date(tx.date + "T00:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {tx.shopping_group && <span>· {tx.shopping_group}</span>}
                    {tx.notes && <span className="truncate max-w-xs">· {tx.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-bold ${TYPE_COLORS[tx.transaction_type]}`}>
                    {tx.transaction_type === "income" ? "+" : "-"}Rp {Number(tx.amount).toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(tx)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(tx.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-sm text-gray-500">
              {t("page")} {currentPage} {t("of")} {totalPages} · {totalCount} {t("records")}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors
                      ${currentPage === page ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-white"}`}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bulk Delete Confirm */}
      <AnimatePresence>
        {showBulkConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkConfirm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {t("delete")} {selectedIds.size} {t("delete_transactions_confirm")}
                  </h3>
                  <p className="text-sm text-gray-500">{t("action_cannot_be_undone")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowBulkConfirm(false)} className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                  {t("cancel")}
                </Button>
                <Button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700">
                  {t("delete")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  {editingTx ? t("edit_transaction") : t("add_transaction")}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("type")}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "income", label: t("income") },
                      { val: "expense", label: t("expense") },
                      { val: "saving", label: t("saving") },
                    ].map(({ val, label }) => (
                      <button key={val} type="button"
                        onClick={() => setFormData({ ...formData, transaction_type: val })}
                        className={`py-2 rounded-lg text-sm font-medium border transition-colors
                          ${formData.transaction_type === val
                            ? val === "income" ? "bg-emerald-600 text-white border-emerald-600"
                              : val === "expense" ? "bg-red-600 text-white border-red-600"
                              : "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.transaction_type === "expense" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("category")}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "survival", label: `🏠 ${t("survival")}` },
                        { value: "optional", label: `🛍️ ${t("optional")}` },
                        { value: "culture", label: `📚 ${t("culture")}` },
                        { value: "extra", label: `⚡ ${t("extra")}` },
                      ].map(({ value, label }) => (
                        <button key={value} type="button"
                          onClick={() => setFormData({ ...formData, category: value })}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                            ${formData.category === value
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("amount")}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                    <input type="number" required value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0" step="0.01" min="0" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("description")}</label>
                  <input type="text" required value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder={t("description")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("date")}</label>
                  <input type="date" required value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("notes")}</label>
                  <textarea value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    rows={2} placeholder={t("notes")} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("shopping_group")}</label>
                  <input type="text" value={formData.shopping_group}
                    onChange={(e) => setFormData({ ...formData, shopping_group: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder={t("shopping_group")} />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_recurring}
                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">{t("is_recurring")}</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <Button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300">
                    {t("cancel")}
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingTx ? t("update") : t("add")}
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