import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Using DESIGN.md chart palette tokens
const COLORS = {
  equal: "#3525cd", // primary
  exact: "#7e3000", // tertiary
  percentage: "#89f5e7", // secondary-fixed
};

export const SplitTypeChart = ({ expenses }) => {
  const typeAmounts = {
    equal: 0,
    exact: 0,
    percentage: 0,
  };

  expenses.forEach((ex) => {
    if (typeAmounts[ex.split_type] !== undefined) {
      typeAmounts[ex.split_type] += Number(ex.amount);
    }
  });

  const data = [
    { name: "Equal", value: typeAmounts.equal, color: COLORS.equal },
    { name: "Exact", value: typeAmounts.exact, color: COLORS.exact },
    { name: "Percentage", value: typeAmounts.percentage, color: COLORS.percentage },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex h-64 flex-col relative rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm p-4">
      <h2 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
        Split Type Breakdown
      </h2>
      <div className="flex-1 w-full h-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-label-sm text-on-surface-variant opacity-50">
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
                contentStyle={{ borderRadius: '8px', border: '1px solid #c7c4d8', fontSize: '14px' }}
                itemStyle={{ color: '#191c1d' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
