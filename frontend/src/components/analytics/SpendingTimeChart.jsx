import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatDateToLocalYMD } from "../../utils/dateFilters";
import { Skeleton } from "../Skeleton";

export const SpendingTimeChart = ({ expenses, isLoading }) => {
  if (isLoading) {
    return (
      <div className="relative flex h-64 flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <h2 className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
          Spending Over Time
        </h2>
        <div className="mt-2 h-full w-full flex-1">
          <Skeleton className="h-full w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="relative flex h-64 flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
        <h2 className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
          Spending Over Time
        </h2>
        <div className="flex h-full items-center justify-center font-body-lg text-body-lg text-on-surface-variant opacity-50">
          No expenses
        </div>
      </div>
    );
  }

  // Find date range
  const dates = expenses.map((e) => new Date(e.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);

  // Group weekly if the range is greater than 45 days, else group daily
  const isWeekly = daysDiff > 45;

  const grouped = {};
  expenses.forEach((ex) => {
    const d = new Date(ex.date);
    let key;
    if (isWeekly) {
      // Group by ISO week (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      key = formatDateToLocalYMD(monday);
    } else {
      key = formatDateToLocalYMD(d);
    }

    if (!grouped[key]) {
      grouped[key] = 0;
    }
    grouped[key] += Number(ex.amount);
  });

  const data = Object.keys(grouped)
    .sort()
    .map((key) => ({
      date: key,
      amount: grouped[key],
    }));

  const formatDate = (dateStr) => {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="relative flex h-64 flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
        Spending Over Time
      </h2>
      <div className="mt-2 h-full w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 19, left: -28, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#c7c4d8"
              vertical={false}
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: "#464555" }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              tick={{
                fontSize: 12,
                fill: "#464555",
                fontFamily: "Geist Mono, monospace",
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `₹${val}`}
              width={80}
            />
            <Tooltip
              labelFormatter={(label) =>
                isWeekly ? `Week of ${formatDate(label)}` : formatDate(label)
              }
              formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Spend"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #c7c4d8",
                fontSize: "14px",
              }}
              itemStyle={{ fontFamily: "Geist Mono, monospace" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3525cd"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3525cd", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
