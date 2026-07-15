import React from "react";
import { useState, useEffect } from "react";
import {
  getGroups,
  getGroup,
  getSettlementSuggestions,
  getSettlements,
  createSettlement,
} from "../services/splitKaroService";

const clearInputs = {
  paid_by: "",
  paid_to: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
};

const SettleUp = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [settlementsData, setSettlementsData] = useState({ settlements: [] });
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [group, setGroup] = useState(null);
  const [inputs, setInputs] = useState(clearInputs);

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addRecord();
    setInputs(clearInputs);
  };

  const addRecord = async () => {
    if (!selectedGroupId) {
      alert("Please select a group first.");
      return;
    }
    try {
      await createSettlement(selectedGroupId, inputs);
      alert("Settlement recorded successfully!");
      const updatedSuggestions =
        await getSettlementSuggestions(selectedGroupId);
      if (updatedSuggestions && updatedSuggestions.length > 0) {
        setSuggestions(updatedSuggestions);
      } else {
        setSuggestions([]);
      }
      const updatedSettlements = await getSettlements(selectedGroupId);
      if (updatedSettlements && updatedSettlements.settlements) {
        setSettlementsData(updatedSettlements);
      } else {
        setSettlementsData({ settlements: [] });
      }
    } catch (error) {
      console.error("Error recording settlement:", error);
      alert("Failed to record settlement. Please try again.");
    }
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
    const fetchSettlementSuggestions = async () => {
      if (!selectedGroupId) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await getSettlementSuggestions(selectedGroupId);
        if (data && data.length > 0) {
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Error fetching settlement suggestions:", error);
        setSuggestions([]);
      }
    };

    fetchSettlementSuggestions();
  }, [selectedGroupId]);

  useEffect(() => {
    const fetchSettlements = async () => {
      if (!selectedGroupId) {
        setSettlementsData({ settlements: [] });
        return;
      }
      try {
        const data = await getSettlements(selectedGroupId);
        if (data && data.settlements && data.settlements.length > 0) {
          setSettlementsData(data);
        }
      } catch (error) {
        console.error("Error fetching settlements:", error);
        setSettlementsData({ settlements: [] });
      }
    };

    fetchSettlements();
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="border-b border-canvas-soft pb-4">
          <h1 className="text-display-sm text-ink font-bold mb-1">Settle Up</h1>
          <p className="text-body-sm text-mute">
            Record payments between group members to clear balances
          </p>
        </div>

        <div className="bg-canvas border border-canvas-soft rounded-xl p-6 shadow-sm">
          <label
            htmlFor="groupSelect"
            className="text-body-sm-strong text-ink block mb-2"
          >
            Select Group:
          </label>
          <select
            id="groupSelect"
            value={selectedGroupId}
            onChange={handleGroupChange}
            className="w-full bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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

        <div className="space-y-3">
          <h2 className="text-display-xs text-ink font-semibold">
            Simplified Settlements
          </h2>
          {suggestions && suggestions.length > 0 ? (
            <div className="w-full space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-canvas-soft bg-canvas p-4 shadow-sm"
                >
                  <p className="text-body-md text-ink">
                    <span className="font-semibold">
                      {suggestion.from.name}
                    </span>{" "}
                    owes{" "}
                    <span className="font-semibold">{suggestion.to.name}</span>:{" "}
                    <span className="font-semibold text-positive-deep bg-primary-pale px-2 py-0.5 rounded-full text-body-sm-strong inline-block">
                      ₹{suggestion.amount.toFixed(2)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full rounded-xl border border-canvas-soft bg-canvas p-6 text-center shadow-sm">
              <p className="text-body-md text-mute font-semibold">
                All balances are settled!
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-display-xs text-ink font-semibold">
            Settlements History
          </h2>
          <div className="bg-canvas border border-canvas-soft rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-canvas-soft border-b border-canvas-soft">
                    <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Payer</th>
                    <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Payee</th>
                    <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-soft">
                  {settlementsData &&
                  settlementsData.settlements &&
                  settlementsData.settlements.length > 0 ? (
                    settlementsData.settlements.map((settlement) => (
                      <tr key={settlement.id} className="hover:bg-canvas-soft/20 transition-colors">
                        <td className="py-4 px-6 text-body-sm text-ink font-medium whitespace-nowrap">
                          {new Date(settlement.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-body-sm text-ink font-semibold">
                          {settlement.payer.name}
                        </td>
                        <td className="py-4 px-6 text-body-sm text-body">
                          {settlement.payee.name}
                        </td>
                        <td className="py-4 px-6 text-body-sm text-ink font-bold">
                          ₹{settlement.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 px-6 text-body-md text-mute text-center" colSpan="4">
                        No settlements found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-canvas rounded-xl p-6 shadow-sm border border-canvas-soft w-full h-fit">
        <h1 className="text-display-xs text-ink font-bold mb-4">
          Record Settlement
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <div className="flex flex-col">
            <label
              htmlFor="paid_by"
              className="text-body-sm-strong text-ink mb-1"
            >
              Payer
            </label>
            <select
              id="paid_by"
              name="paid_by"
              value={inputs.paid_by}
              onChange={handleInputChange}
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
            >
              <option value="" disabled>
                Select Payer
              </option>
              {group && group.members && group.members.length > 0 ? (
                group.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No members available
                </option>
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="paid_to"
              className="text-body-sm-strong text-ink mb-1"
            >
              Payee
            </label>
            <select
              id="paid_to"
              name="paid_to"
              value={inputs.paid_to}
              onChange={handleInputChange}
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
            >
              <option value="" disabled>
                Select Payee
              </option>
              {group && group.members && group.members.length > 0 ? (
                group.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No members available
                </option>
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="text-body-sm-strong text-ink mb-1"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={inputs.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              step="0.01"
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="date"
              className="text-body-sm-strong text-ink mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={inputs.date}
              onChange={handleInputChange}
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="cursor-pointer bg-primary text-on-primary hover:bg-primary-active rounded-xl py-3 px-6 text-button-md font-semibold transition-colors mt-4 w-full shadow-sm"
          >
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettleUp;
