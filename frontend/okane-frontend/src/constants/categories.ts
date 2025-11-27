export const KAKEIBO_CATEGORIES = {
  survival: {
    name: "Survival",
    description: "Needs - Essential expenses for living",
    color: "#10b981",
    icon: "🏠",
  },
  optional: {
    name: "Optional",
    description: "Wants - Non-essential but desired items",
    color: "#f59e0b",
    icon: "🛍️",
  },
  culture: {
    name: "Culture",
    description: "Personal Development - Education, hobbies, self-improvement",
    color: "#8b5cf6",
    icon: "📚",
  },
  extra: {
    name: "Extra",
    description: "Unexpected - Unplanned or emergency expenses",
    color: "#ef4444",
    icon: "⚡",
  },
} as const;

export const TRANSACTION_TYPES = {
  income: { name: "Income", color: "#10b981", icon: "💰" },
  expense: { name: "Expense", color: "#ef4444", icon: "💸" },
  saving: { name: "Saving", color: "#3b82f6", icon: "🏦" },
} as const;

export const FIXED_EXPENSE_TYPES = {
  basic: { name: "Basic Fixed Expense", icon: "🏠" },
  subscription: { name: "Subscription", icon: "📱" },
  debt: { name: "Debt Payment", icon: "💳" },
  loan: { name: "Loan Payment", icon: "🏦" },
} as const;
