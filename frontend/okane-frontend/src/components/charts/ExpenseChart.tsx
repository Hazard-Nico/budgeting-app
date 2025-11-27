"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { KAKEIBO_CATEGORIES } from "@/constants/categories";
import { motion } from "framer-motion";

interface ExpenseChartProps {
  data: {
    survival: number;
    optional: number;
    culture: number;
    extra: number;
  };
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = [
    {
      name: "Survival",
      value: data.survival,
      color: KAKEIBO_CATEGORIES.survival.color,
    },
    {
      name: "Optional",
      value: data.optional,
      color: KAKEIBO_CATEGORIES.optional.color,
    },
    {
      name: "Culture",
      value: data.culture,
      color: KAKEIBO_CATEGORIES.culture.color,
    },
    { name: "Extra", value: data.extra, color: KAKEIBO_CATEGORIES.extra.color },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No expense data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Expense Distribution (Kakeibo)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Details */}
      <div className="mt-6 space-y-3">
        {Object.entries(KAKEIBO_CATEGORIES).map(([key, category]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {category.icon} {category.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {data[key as keyof typeof data].toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
