import { z } from "zod";

// Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password2: z.string(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    language: z.enum(["en", "id"]),
    currency: z.string().default("IDR"),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords don't match",
    path: ["password2"],
  });

// Transaction Schemas
export const transactionSchema = z.object({
  transaction_type: z.enum(["income", "expense", "saving"]),
  category: z.enum(["survival", "optional", "culture", "extra"]).optional(),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional(),
  date: z.string(),
  shopping_group: z.string().optional(),
  is_recurring: z.boolean().default(false),
});

// Budget Schemas
export const monthlyBudgetSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  planned_income: z.number().min(0),
  planned_fixed_expenses: z.number().min(0),
  planned_survival: z.number().min(0),
  planned_optional: z.number().min(0),
  planned_culture: z.number().min(0),
  planned_extra: z.number().min(0),
  planned_savings: z.number().min(0),
  notes: z.string().optional(),
});

// Income Schema
export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.string(),
  is_recurring: z.boolean().default(false),
});

// Fixed Expense Schema
export const fixedExpenseSchema = z.object({
  expense_type: z.enum(["basic", "subscription", "debt", "loan"]),
  name: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  due_date: z.number().min(1).max(31),
  is_active: z.boolean().default(true),
});

// Savings Tracker Schema
export const savingsTrackerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  target_amount: z.number().positive("Target amount must be positive"),
  current_amount: z.number().min(0).default(0),
  target_date: z.string().optional(),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type MonthlyBudgetInput = z.infer<typeof monthlyBudgetSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type FixedExpenseInput = z.infer<typeof fixedExpenseSchema>;
export type SavingsTrackerInput = z.infer<typeof savingsTrackerSchema>;
