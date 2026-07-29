import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const SpendingTimeChart = ({ expenses }) => {
  if (expenses.length === 0) {
    return (
      <div className="flex h-64 flex-col relative rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm p-4">
        <h2 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
          Spending Over Time
        </h2>
        <div className="flex h-full items-center justify-center text-label-sm text-on-surface-variant opacity-50">
          No expenses
        </div>
      </div>
    );
  }

  // Find date range
  const dates = expenses.map(e => new Date(`${e.date}T00:00:00`).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);

  // Group weekly if the range is greater than 45 days, else group daily
  const isWeekly = daysDiff > 45;

  const grouped = {};
  expenses.forEach(ex => {
    const d = new Date(`${ex.date}T00:00:00`);
    let key;
    if (isWeekly) {
      // Group by ISO week (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
      const monday = new Date(d.setDate(diff));
      key = monday.toISOString().split('T')[0];
    } else {
      key = ex.date;
    }
    
    if (!grouped[key]) {
      grouped[key] = 0;
    }
    grouped[key] += Number(ex.amount);
  });

  const data = Object.keys(grouped).sort().map(key => ({
    date: key,
    amount: grouped[key]
  }));

  const formatDate = (dateStr) => {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-64 flex-col relative rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm p-4">
      <h2 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
        Spending Over Time
      </h2>
      <div className="flex-1 w-full h-full -ml-4 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate} 
              tick={{ fontSize: 12, fill: '#464555' }} 
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#464555' }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `₹${val}`}
              width={60}
            />
            <Tooltip 
              labelFormatter={(label) => isWeekly ? `Week of ${formatDate(label)}` : formatDate(label)}
              formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Spend"]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #c7c4d8', fontSize: '14px' }}
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
