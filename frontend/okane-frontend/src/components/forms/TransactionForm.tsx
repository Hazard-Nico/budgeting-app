"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionInput } from "@/lib/validations";
import { KAKEIBO_CATEGORIES, TRANSACTION_TYPES } from "@/constants/categories";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { motion } from "framer-motion";

interface TransactionFormProps {
  onSubmit: (data: TransactionInput) => void;
  isLoading?: boolean;
  defaultValues?: Partial<TransactionInput>;
}

export default function TransactionForm({
  onSubmit,
  isLoading,
  defaultValues,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues || {
      transaction_type: "expense",
      date: new Date().toISOString().split("T")[0],
      is_recurring: false,
    },
  });

  const transactionType = watch("transaction_type");
  const showCategory = transactionType === "expense";

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Transaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
            <label
              key={key}
              className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                watch("transaction_type") === key
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                value={key}
                {...register("transaction_type")}
                className="sr-only"
              />
              <span className="text-2xl mr-2">{value.icon}</span>
              <span className="font-medium">{value.name}</span>
            </label>
          ))}
        </div>
        {errors.transaction_type && (
          <p className="mt-1 text-sm text-red-600">
            {errors.transaction_type.message}
          </p>
        )}
      </div>

      {/* Category (for expenses) */}
      {showCategory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category (Kakeibo)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(KAKEIBO_CATEGORIES).map(([key, value]) => (
              <label
                key={key}
                className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watch("category") === key
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  value={key}
                  {...register("category")}
                  className="sr-only"
                />
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{value.icon}</span>
                  <span className="font-medium">{value.name}</span>
                </div>
                <span className="text-xs text-gray-600">
                  {value.description}
                </span>
              </label>
            ))}
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </motion.div>
      )}

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        step="0.01"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register("amount", { valueAsNumber: true })}
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="Enter description"
        error={errors.description?.message}
        {...register("description")}
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register("date")}
      />

      {/* Shopping Group (optional) */}
      <Input
        label="Shopping Group (Optional)"
        placeholder="e.g., Groceries, Entertainment"
        {...register("shopping_group")}
      />

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          placeholder="Additional notes..."
          {...register("notes")}
        />
      </div>

      {/* Recurring */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          {...register("is_recurring")}
        />
        <span className="text-sm text-gray-700">Recurring transaction</span>
      </label>

      {/* Submit Button */}
      <Button type="submit" className="w-full" isLoading={isLoading}>
        {defaultValues ? "Update Transaction" : "Add Transaction"}
      </Button>
    </motion.form>
  );
}
