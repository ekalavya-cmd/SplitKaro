import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExpenses,
  getGroups,
  getGroup,
  deleteExpense,
} from "../services/splitKaroService";

const Expenses = () => {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expandedExpenseIds, setExpandedExpenseIds] = useState({});

  const navigate = useNavigate();

  const toggleExpenseExpand = (id) => {
    setExpandedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setSplitTypeColor = (splitType) => {
    switch (splitType) {
      case "equal":
        return "bg-canvas-soft text-body px-md py-xs rounded-full text-caption font-semibold";
      case "exact":
        return "bg-primary-pale text-positive-deep px-md py-xs rounded-full text-caption font-semibold";
      default:
        return "bg-accent-orange/20 text-ink px-md py-xs rounded-full text-caption font-semibold";
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getGroups();
        if (data && data.length > 0) {
          setGroups(data);
          setSelectedGroupId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setGroups([]);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!selectedGroupId) {
        setExpenses([]);
        return;
      }

      try {
        const data = await getExpenses(selectedGroupId);
        if (data && data.expenses) {
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setExpenses([]);
      }
    };

    fetchExpenses();
  }, [selectedGroupId]);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!selectedGroupId) {
        setGroup(null);
        return;
      }

      try {
        const data = await getGroup(selectedGroupId);
        if (data) {
          setGroup(data);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setGroup(null);
      }
    };

    fetchGroup();
  }, [selectedGroupId]);

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      const updatedExpenses = await getExpenses(selectedGroupId);
      if (
        updatedExpenses &&
        updatedExpenses.expenses &&
        updatedExpenses.expenses.length > 0
      ) {
        setExpenses(updatedExpenses.expenses);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  return (
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md border-b border-canvas-soft pb-lg">
        <div>
          <h1 className="text-display-sm text-ink font-bold">Expenses</h1>
        </div>
      </div>

      <div className="bg-canvas border border-canvas-soft rounded-xl p-xl shadow-sm max-w-md w-full">
        <label
          htmlFor="groupSelect"
          className="text-body-sm-strong text-ink block mb-sm"
        >
          Select Group:
        </label>
        <select
          id="groupSelect"
          value={selectedGroupId}
          onChange={handleGroupChange}
          className="w-full bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="" disabled>
            Select a group
          </option>
          {Array.isArray(groups) && groups.length > 0 ? (
            groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))
          ) : (
            <option disabled>No groups available</option>
          )}
        </select>
      </div>

      <div className="space-y-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md">
          <h2 className="text-display-xs text-ink font-semibold">
            {group ? group.name : "Select a group to view expenses"}
          </h2>

          <button
            type="button"
            onClick={() => navigate(`/add-expense/${selectedGroupId}`)}
            className="cursor-pointer bg-primary text-on-primary hover:bg-primary-active rounded-xl py-md px-xl text-button-md font-semibold transition-colors self-start md:self-auto shadow-sm"
          >
            Add Expense
          </button>
        </div>

        <div className="bg-canvas border border-canvas-soft rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-canvas-soft border-b border-canvas-soft">
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Date</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Description</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Paid By</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Amount</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Split Type</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Splits</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-soft">
                {expenses && expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <tr 
                        onClick={() => toggleExpenseExpand(expense.id)}
                        className="hover:bg-canvas-soft/20 transition-colors cursor-pointer select-none"
                      >
                        <td className="py-lg px-xl text-body-sm text-ink font-medium whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-ink font-semibold">
                          {expense.description}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-body">
                          {expense.payer.name}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-ink font-bold">
                          ₹{expense.amount}
                        </td>
                        <td className="py-lg px-xl text-body-sm">
                          <span className={`${setSplitTypeColor(expense.splitType)}`}>
                            {expense.splitType}
                          </span>
                        </td>
                        <td className="py-lg px-xl text-body-sm text-mute">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpenseExpand(expense.id);
                            }}
                            className="cursor-pointer bg-canvas-soft text-body hover:bg-canvas-soft/80 px-md py-xs rounded-full text-caption font-semibold flex items-center gap-xs"
                          >
                            <span>{expense.splits ? expense.splits.length : 0} shares</span>
                            <span className="text-[10px] text-mute">
                              {expandedExpenseIds[expense.id] ? "▲" : "▼"}
                            </span>
                          </button>
                        </td>
                        <td className="py-lg px-xl text-body-sm" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="cursor-pointer text-negative hover:underline text-body-sm-strong transition-colors"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this expense?",
                                )
                              ) {
                                handleDeleteExpense(expense.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      {expandedExpenseIds[expense.id] && (
                        <tr className="bg-canvas-soft/10">
                          <td colSpan="7" className="p-xl border-t border-b border-canvas-soft">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl">
                              <div className="space-y-sm">
                                <h4 className="text-body-sm-strong text-mute uppercase tracking-wider">Payment Summary</h4>
                                <div className="bg-canvas border border-canvas-soft rounded-xl p-md space-y-xs shadow-sm">
                                  <div className="flex items-center gap-sm">
                                    <span className="w-6 h-6 rounded-full bg-primary-pale text-positive-deep flex items-center justify-center font-bold text-caption">
                                      {expense.payer.name.substring(0, 2).toUpperCase()}
                                    </span>
                                    <p className="text-body-md text-ink">
                                      <span className="font-semibold">{expense.payer.name}</span> paid <span className="font-bold">₹{expense.amount}</span>
                                    </p>
                                  </div>
                                  <div className="pt-xs border-t border-canvas-soft text-caption text-mute flex items-center justify-between">
                                    <span>Split Type: <span className="font-semibold text-ink uppercase text-[10px] bg-canvas-soft px-sm py-xxs rounded-full">{expense.splitType}</span></span>
                                    <span>Date: {new Date(expense.date).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-sm">
                                <h4 className="text-body-sm-strong text-mute uppercase tracking-wider">Individual Shares</h4>
                                <div className="bg-canvas border border-canvas-soft rounded-xl p-md space-y-sm shadow-sm">
                                  {expense.splits && expense.splits.length > 0 ? (
                                    <div className="divide-y divide-canvas-soft">
                                      {expense.splits.map((split) => {
                                        const isPayer = split.memberId === expense.paidBy;
                                        const amountStr = `₹${parseFloat(split.amountOwed).toFixed(2)}`;
                                        return (
                                          <div key={split.id} className="flex items-center justify-between py-xs first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-xs">
                                              <span className="w-5 h-5 rounded-full bg-canvas-soft text-body flex items-center justify-center font-bold text-[10px]">
                                                {split.member.name.substring(0, 2).toUpperCase()}
                                              </span>
                                              <span className="text-body-sm text-ink font-medium">
                                                {split.member.name} {isPayer && <span className="text-[10px] text-mute font-normal">(Payer)</span>}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-xs">
                                              {isPayer ? (
                                                <span className="text-caption text-mute italic mr-xs">own share</span>
                                              ) : (
                                                <span className="text-[10px] text-mute mr-xs">owes {expense.payer.name}</span>
                                              )}
                                              <span className={isPayer ? "bg-canvas-soft text-body px-md py-xs rounded-full text-caption font-semibold" : "bg-primary-pale text-positive-deep px-md py-xs rounded-full text-caption font-semibold"}>
                                                {amountStr}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-body-sm text-mute">No split details available</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-xl px-xl text-body-md text-mute text-center"
                    >
                      {selectedGroupId
                        ? expenses.length > 0
                          ? "No expenses match the selected filters"
                          : "No expenses for this group"
                        : "Select a group to view expenses"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
