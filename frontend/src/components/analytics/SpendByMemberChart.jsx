import React from "react";

export const SpendByMemberChart = ({ expenses, members }) => {
  // Initialize spend per member including all group members
  const memberSpends = members.reduce((acc, member) => {
    acc[member.id] = {
      name: member.name,
      amount: 0,
    };
    return acc;
  }, {});

  expenses.forEach((expense) => {
    if (memberSpends[expense.paidBy]) {
      memberSpends[expense.paidBy].amount += Number(expense.amount);
    }
  });

  const spendList = Object.values(memberSpends).sort((a, b) => b.amount - a.amount);
  const maxSpend = Math.max(...spendList.map((s) => s.amount), 1); // prevent division by zero

  return (
    <div className="flex h-64 flex-col relative rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm p-4">
      <h2 className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-4">
        Spend by Member
      </h2>
      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
        {spendList.length === 0 ? (
          <div className="flex h-full items-center justify-center text-label-sm text-on-surface-variant opacity-50">
            No members
          </div>
        ) : (
          spendList.map((member, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between font-label-sm text-label-sm text-on-surface">
                <span>{member.name}</span>
                <span className="font-mono-data text-mono-data text-on-surface-variant">
                  ₹{member.amount.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(member.amount / maxSpend) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
