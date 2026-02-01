import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Plus,
  X,
  Trash2,
} from "lucide-react";

export default function StudentFinanceTracker() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [note, setNote] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const expenseCategories = [
    { name: "Food & Drinks", icon: "🍔", color: "#FF6B6B", bgColor: "#FFE5E5" },
    { name: "Transport", icon: "🚗", color: "#4ECDC4", bgColor: "#E0F7F6" },
    { name: "Shopping", icon: "🛍️", color: "#FFD93D", bgColor: "#FFF9E0" },
    { name: "Entertainment", icon: "🎮", color: "#A78BFA", bgColor: "#F3EFFF" },
    { name: "Bills", icon: "📄", color: "#FF8787", bgColor: "#FFE8E8" },
    { name: "Education", icon: "📚", color: "#6C63FF", bgColor: "#E8E6FF" },
    { name: "Health", icon: "⚕️", color: "#51CF66", bgColor: "#E3F9E5" },
    { name: "Other", icon: "📌", color: "#868E96", bgColor: "#F1F3F5" },
  ];

  const incomeCategories = [
    { name: "Allowance", icon: "💰", color: "#51CF66", bgColor: "#E3F9E5" },
    { name: "Part-time", icon: "💼", color: "#4ECDC4", bgColor: "#E0F7F6" },
    { name: "Freelance", icon: "💻", color: "#6C63FF", bgColor: "#E8E6FF" },
    { name: "Gift", icon: "🎁", color: "#FF6B6B", bgColor: "#FFE5E5" },
    { name: "Other", icon: "➕", color: "#868E96", bgColor: "#F1F3F5" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("campuscash_data");
    if (stored) {
      const data = JSON.parse(stored);
      setExpenses(data.expenses || []);
      setIncome(data.income || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "campuscash_data",
      JSON.stringify({ expenses, income }),
    );
  }, [expenses, income]);

  const addTransaction = () => {
    if (!amount || !category) return;

    const transaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      note,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };

    if (type === "expense") {
      setExpenses([transaction, ...expenses]);
    } else {
      setIncome([transaction, ...income]);
    }

    setAmount("");
    setCategory("");
    setNote("");
    setShowAddModal(false);
  };

  const deleteTransaction = (id, transactionType) => {
    if (transactionType === "expense") {
      setExpenses(expenses.filter((e) => e.id !== id));
    } else {
      setIncome(income.filter((i) => i.id !== id));
    }
  };

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  const getCategoryTotal = (cat) => {
    return expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getRecentTransactions = () => {
    const all = [
      ...expenses.map((e) => ({ ...e, type: "expense" })),
      ...income.map((i) => ({ ...i, type: "income" })),
    ];
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const generateInvoice = () => {
    const invoiceContent = `
CAMPUSCASH - FINANCIAL SUMMARY
═══════════════════════════════════════════════
Generated: ${new Date().toLocaleString()}

INCOME SUMMARY:
${incomeCategories
  .map((cat) => {
    const total = income
      .filter((i) => i.category === cat.name)
      .reduce((sum, i) => sum + i.amount, 0);
    return total > 0
      ? `${cat.icon} ${cat.name}: KSh ${total.toLocaleString()}`
      : "";
  })
  .filter(Boolean)
  .join("\n")}

Total Income: KSh ${totalIncome.toLocaleString()}

EXPENSE SUMMARY:
${expenseCategories
  .map((cat) => {
    const total = getCategoryTotal(cat.name);
    return total > 0
      ? `${cat.icon} ${cat.name}: KSh ${total.toLocaleString()}`
      : "";
  })
  .filter(Boolean)
  .join("\n")}

Total Expenses: KSh ${totalExpenses.toLocaleString()}

═══════════════════════════════════════════════
NET BALANCE: KSh ${balance.toLocaleString()}
═══════════════════════════════════════════════

Recent Transactions:
${getRecentTransactions()
  .slice(0, 10)
  .map(
    (t) =>
      `• ${formatDate(t.date)} - ${t.category}: ${t.type === "expense" ? "-" : "+"}KSh ${t.amount.toLocaleString()}${t.note ? ` (${t.note})` : ""}`,
  )
  .join("\n")}
    `.trim();

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campuscash-summary-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              CampusCash
            </h1>
            <p className="text-gray-600">Your financial companion 🎓</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateInvoice}
              className="bg-white text-gray-700 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all border border-gray-200"
            >
              <Download size={20} />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={20} />
              Add
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Income
              </span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Total Income
            </p>
            <h3 className="text-3xl font-bold text-gray-900">
              KSh {totalIncome.toLocaleString()}
            </h3>
          </div>

          <div className="stat-card bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-2xl">
                <TrendingDown className="text-red-600" size={24} />
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                Expenses
              </span>
            </div>
            <p className="text-gray-600 text-sm font-medium mb-1">
              Total Expenses
            </p>
            <h3 className="text-3xl font-bold text-gray-900">
              KSh {totalExpenses.toLocaleString()}
            </h3>
          </div>

          <div className="stat-card bg-gradient-to-br from-violet-600 to-cyan-600 rounded-3xl p-6 shadow-lg text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur p-3 rounded-2xl">
                <Wallet className="text-white" size={24} />
              </div>
              <span className="text-xs font-semibold bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                Balance
              </span>
            </div>
            <p className="text-white/80 text-sm font-medium mb-1">Available</p>
            <h3 className="text-3xl font-bold">
              KSh {balance.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Spending by Category
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {expenseCategories.map((cat) => {
              const total = getCategoryTotal(cat.name);
              const percentage =
                totalExpenses > 0
                  ? ((total / totalExpenses) * 100).toFixed(1)
                  : 0;

              return (
                <div
                  key={cat.name}
                  className="p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{cat.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: cat.color,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-2">
                    KSh {total.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Transactions
            </h3>
          </div>

          {getRecentTransactions().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-600 font-medium mb-2">
                No transactions yet
              </p>
              <p className="text-gray-500 text-sm">
                Start tracking your finances today!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {getRecentTransactions().map((transaction) => {
                const isExpense = transaction.type === "expense";
                const categories = isExpense
                  ? expenseCategories
                  : incomeCategories;
                const cat = categories.find(
                  (c) => c.name === transaction.category,
                );

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group animate-slide-up"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: cat?.bgColor }}
                      >
                        {cat?.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.category}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.date)}
                          </p>
                          {transaction.note && (
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-sm text-gray-500">
                                {transaction.note}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${isExpense ? "text-red-600" : "text-green-600"}`}
                        >
                          {isExpense ? "-" : "+"} KSh{" "}
                          {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          deleteTransaction(transaction.id, transaction.type)
                        }
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-slide-up">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Add Transaction
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Type Selector */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setType("expense")}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                  type === "expense"
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => setType("income")}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                  type === "income"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Income
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    KSh
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 pl-16 py-4 text-2xl font-bold text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {(type === "expense"
                    ? expenseCategories
                    : incomeCategories
                  ).map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`p-4 rounded-2xl flex items-center gap-3 transition-all border-2 ${
                        category === cat.name
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-semibold text-sm text-gray-900">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Lunch at cafeteria"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                onClick={addTransaction}
                disabled={!amount || !category}
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Add {type === "expense" ? "Expense" : "Income"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
