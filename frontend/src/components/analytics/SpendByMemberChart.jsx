import React from "react";
import { Skeleton } from "../Skeleton";

export const SpendByMemberChart = ({ expenses, members, isLoading }) => {
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

  const spendList = Object.values(memberSpends).sort(
    (a, b) => b.amount - a.amount,
  );
  const maxSpend = Math.max(...spendList.map((s) => s.amount), 1); // prevent division by zero

  return (
    <div className="relative flex h-64 flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="mb-4 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
        Spend by Member
      </h2>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))
        ) : spendList.length === 0 ? (
          <div className="flex h-full items-center justify-center font-body-lg text-body-lg text-on-surface-variant opacity-50">
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
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
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
