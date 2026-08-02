import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Using DESIGN.md chart palette tokens
const COLORS = {
  equal: "#3525cd", // primary
  exact: "#a44100", // tertiary-container
  percentage: "#89f5e7", // secondary-fixed
};

import { Skeleton } from "../Skeleton";

export const SplitTypeChart = ({ expenses, isLoading }) => {
  const typeAmounts = {
    equal: 0,
    exact: 0,
    percentage: 0,
  };

  expenses.forEach((ex) => {
    if (typeAmounts[ex.splitType] !== undefined) {
      typeAmounts[ex.splitType] += Number(ex.amount);
    }
  });

  const data = [
    { name: "Equal", value: typeAmounts.equal, color: COLORS.equal },
    { name: "Exact", value: typeAmounts.exact, color: COLORS.exact },
    {
      name: "Percentage",
      value: typeAmounts.percentage,
      color: COLORS.percentage,
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="relative flex h-64 flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
        Split Type Breakdown
      </h2>
      <div className="h-full w-full flex-1">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 pb-4">
            <Skeleton className="h-35 w-35 rounded-full border-20 border-surface-container-high bg-transparent!" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center font-body-lg text-body-lg text-on-surface-variant opacity-50">
            No expenses
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `₹${Number(value).toFixed(2)}`}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #c7c4d8",
                  fontSize: "14px",
                }}
                itemStyle={{
                  color: "#191c1d",
                  fontFamily: "Geist Mono, monospace",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: "15px" }}
                formatter={(value) => (
                  <span style={{ color: "#191c1d" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
