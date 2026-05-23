"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Receipt,
  IndianRupee,
  Calendar,
  Tag,
  ChevronDown,
  X,
  Save,
  Loader2,
  TrendingUp,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import Toast from "@/components/ui/Toast";

type ExpenseCategory =
  | "travel"
  | "food"
  | "accommodation"
  | "internet"
  | "stationery"
  | "other";

interface Expense {
  _id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptNote: string;
}

const CATEGORIES: { value: ExpenseCategory; label: string; color: string; bg: string }[] = [
  { value: "travel",        label: "Travel",        color: "text-blue-700",   bg: "bg-blue-100"   },
  { value: "food",          label: "Food",          color: "text-orange-700", bg: "bg-orange-100" },
  { value: "accommodation", label: "Stay",          color: "text-purple-700", bg: "bg-purple-100" },
  { value: "internet",      label: "Internet",      color: "text-cyan-700",   bg: "bg-cyan-100"   },
  { value: "stationery",    label: "Stationery",    color: "text-pink-700",   bg: "bg-pink-100"   },
  { value: "other",         label: "Other",         color: "text-gray-700",   bg: "bg-gray-100"   },
];

const categoryMeta = (cat: ExpenseCategory) =>
  CATEGORIES.find((c) => c.value === cat) || CATEGORIES[5];

const now = new Date();

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [canDownload, setCanDownload] = useState(false);

  // filter
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    category: "travel" as ExpenseCategory,
    description: "",
    amount: "",
    receiptNote: "",
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/intern/expenses?month=${filterMonth}&year=${filterYear}`
    );
    if (res.ok) setExpenses(await res.json());
    setLoading(false);
  }, [filterMonth, filterYear]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    fetch("/api/intern/profile")
      .then((r) => r.json())
      .then((p) => setCanDownload(p.canDownloadExpenses || false));
  }, []);

  const resetForm = () => {
    setForm({
      date: format(new Date(), "yyyy-MM-dd"),
      category: "travel",
      description: "",
      amount: "",
      receiptNote: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const openEdit = (exp: Expense) => {
    setForm({
      date: format(new Date(exp.date), "yyyy-MM-dd"),
      category: exp.category,
      description: exp.description,
      amount: String(exp.amount),
      receiptNote: exp.receiptNote || "",
    });
    setEditingId(exp._id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) {
      setToast({ message: "Please fill in description and a valid amount.", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date: form.date,
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        receiptNote: form.receiptNote.trim(),
      };
      const url = editingId
        ? `/api/intern/expenses/${editingId}`
        : "/api/intern/expenses";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      setToast({ message: editingId ? "Expense updated!" : "Expense added!", type: "success" });
      resetForm();
      loadExpenses();
    } catch {
      setToast({ message: "Failed to save expense.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/intern/expenses/${id}`, { method: "DELETE" });
    if (res.ok) {
      setToast({ message: "Expense deleted.", type: "success" });
      loadExpenses();
    }
  };

  // Compute totals
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = CATEGORIES.map((cat) => ({
    ...cat,
    total: expenses
      .filter((e) => e.category === cat.value)
      .reduce((s, e) => s + e.amount, 0),
  })).filter((c) => c.total > 0);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold text-sdw-navy flex items-center gap-2">
            <Receipt size={22} className="text-sdw-teal" />
            My Expenses
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Track your daily work-related expenses</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canDownload && (
            <a
              href={`/api/intern/expenses-report?month=${filterMonth}&year=${filterYear}`}
              className="flex items-center gap-2 border border-sdw-teal text-sdw-teal px-4 py-2 rounded-lg text-sm font-medium hover:bg-sdw-teal hover:text-white transition-colors"
            >
              <Download size={16} />
              Download CSV
            </a>
          )}
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-sdw-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sdw-teal/90"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Month/Year filter */}
      <div className="bg-white rounded-lg border p-4 flex items-center gap-3 flex-wrap">
        <Calendar size={16} className="text-gray-400" />
        <span className="text-sm text-gray-500 font-medium">Showing:</span>
        <div className="relative">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="border rounded-lg px-3 py-1.5 text-sm pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-1.5 text-sm pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary cards */}
      {!loading && expenses.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-sdw-navy text-white rounded-lg p-4 col-span-2 lg:col-span-1">
            <p className="text-xs text-white/60 mb-1">Total this month</p>
            <p className="text-2xl font-bold flex items-center gap-1">
              <IndianRupee size={18} />
              {total.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-white/50 mt-1">{expenses.length} entries</p>
          </div>
          {/* By Category */}
          {byCategory.slice(0, 3).map((cat) => (
            <div key={cat.value} className="bg-white rounded-lg border p-4">
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${cat.bg} ${cat.color} mb-2`}>
                {cat.label}
              </span>
              <p className="text-lg font-semibold text-sdw-navy flex items-center gap-0.5">
                <IndianRupee size={14} />
                {cat.total.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sdw-navy">
              {editingId ? "Edit Expense" : "Add New Expense"}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
              />
            </div>
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as ExpenseCategory }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="e.g. Ola cab to office"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
              />
            </div>
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount (₹)</label>
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
                />
              </div>
            </div>
            {/* Receipt Note */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Receipt / Note <span className="text-gray-300">(optional)</span>
              </label>
              <input
                type="text"
                value={form.receiptNote}
                onChange={(e) => setForm((p) => ({ ...p, receiptNote: e.target.value }))}
                placeholder="e.g. Receipt #123"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sdw-teal/50"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-sdw-teal text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-sdw-teal/90 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : editingId ? "Update" : "Add Expense"}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expenses table */}
      <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <FileText size={16} className="text-sdw-teal" />
          <span className="text-sm font-semibold text-sdw-navy">
            {months[filterMonth - 1]} {filterYear}
          </span>
          {!loading && (
            <span className="ml-auto text-xs text-gray-400">
              {expenses.length} record{expenses.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-sdw-teal" size={28} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <Receipt size={32} className="opacity-30" />
            <p className="text-sm">No expenses this month. Click "Add Expense" to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs">Description</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs hidden sm:table-cell">Note</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map((exp) => {
                  const meta = categoryMeta(exp.category);
                  return (
                    <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {format(new Date(exp.date), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${meta.bg} ${meta.color}`}>
                          <Tag size={10} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sdw-navy font-medium">{exp.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-sdw-teal whitespace-nowrap">
                        ₹{exp.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                        {exp.receiptNote || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(exp)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp._id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Footer total row */}
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-sdw-navy text-right">
                    <span className="flex items-center justify-end gap-1">
                      <TrendingUp size={14} className="text-sdw-teal" />
                      Total
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-sdw-navy whitespace-nowrap">
                    ₹{total.toLocaleString("en-IN")}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {!canDownload && expenses.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          💡 Ask your mentor to enable expense report downloads for your account.
        </p>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
