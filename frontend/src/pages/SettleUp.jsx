import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getGroups,
  getGroup,
  getSettlementSuggestions,
  getSettlements,
  createSettlement,
} from "../services/splitKaroService";
import { useSettlementFilters } from "../hooks/useSettlementFilters";
import { SettlementFilters } from "../components/SettlementFilters";

const clearInputs = {
  paid_by: "",
  paid_to: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
};

const SettleUp = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [settlementsData, setSettlementsData] = useState({ settlements: [] });
  const { filteredSettlements, filterProps } = useSettlementFilters(
    settlementsData.settlements
  );
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [group, setGroup] = useState(null);

  const location = useLocation();

  const [inputs, setInputs] = useState(() => {
    const state = location.state || {};
    return {
      ...clearInputs,
      paid_by: state.paid_by || "",
      paid_to: state.paid_to || "",
      amount: state.amount || "",
    };
  });

  const formatDateToDisplay = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
      <div className="space-y-xl">
        <div className="border-b border-canvas-soft pb-lg">
          <h1 className="text-display-sm text-ink font-bold mb-xs">Settle Up</h1>
          <p className="text-body-sm text-mute">
            Record payments between group members to clear balances
          </p>
        </div>

        <div className="bg-canvas border border-canvas-soft rounded-xl p-xl shadow-sm">
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
          <h2 className="text-display-xs text-ink font-semibold">
            Simplified Settlements
          </h2>
          {suggestions && suggestions.length > 0 ? (
            <div className="w-full space-y-md">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-canvas-soft bg-canvas p-lg shadow-sm flex items-center justify-between gap-md"
                >
                  <p className="text-body-md text-ink">
                    <span className="font-semibold">
                      {suggestion.from.name}
                    </span>{" "}
                    owes{" "}
                    <span className="font-semibold">{suggestion.to.name}</span>:{" "}
                    <span className="font-semibold text-positive-deep bg-primary-pale px-sm py-xxs rounded-full text-body-sm-strong inline-block">
                      ₹{suggestion.amount.toFixed(2)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setInputs((prev) => ({
                      ...prev,
                      paid_by: suggestion.from.id,
                      paid_to: suggestion.to.id,
                      amount: suggestion.amount.toFixed(2),
                    }))}
                    className="cursor-pointer bg-canvas-soft text-ink hover:bg-canvas-soft/80 rounded-xl py-md px-xl text-button-md font-semibold transition-colors"
                  >
                    Settle
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full rounded-xl border border-canvas-soft bg-canvas p-xl text-center shadow-sm">
              <p className="text-body-md text-mute font-semibold">
                All balances are settled!
              </p>
            </div>
          )}
        </div>

        <div className="space-y-md">
          <h2 className="text-display-xs text-ink font-semibold">
            Settlements History
          </h2>

          <SettlementFilters
            filterProps={filterProps}
            members={group ? group.members : []}
          />

          <div className="bg-canvas border border-canvas-soft rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-canvas-soft border-b border-canvas-soft">
                    <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Date</th>
                    <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Payer</th>
                    <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Payee</th>
                    <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-soft">
                  {filteredSettlements && filteredSettlements.length > 0 ? (
                    filteredSettlements.map((settlement) => (
                      <tr key={settlement.id} className="hover:bg-canvas-soft/20 transition-colors">
                        <td className="py-lg px-xl text-body-sm text-ink font-medium whitespace-nowrap">
                          {formatDateToDisplay(settlement.date)}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-ink font-semibold">
                          {settlement.payer.name}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-body">
                          {settlement.payee.name}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-ink font-bold">
                          ₹{settlement.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-xl px-xl text-body-md text-mute text-center" colSpan="4">
                        {settlementsData.settlements.length > 0
                          ? "No settlements match the selected filters"
                          : "No settlements found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-canvas rounded-xl p-xl shadow-sm border border-canvas-soft w-full h-fit">
        <h1 className="text-display-xs text-ink font-bold mb-lg">
          Record Settlement
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-md">
          <div className="flex flex-col">
            <label
              htmlFor="paid_by"
              className="text-body-sm-strong text-ink mb-xs"
            >
              Payer
            </label>
            <select
              id="paid_by"
              name="paid_by"
              value={inputs.paid_by}
              onChange={handleInputChange}
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
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
              className="text-body-sm-strong text-ink mb-xs"
            >
              Payee
            </label>
            <select
              id="paid_to"
              name="paid_to"
              value={inputs.paid_to}
              onChange={handleInputChange}
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
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
              className="text-body-sm-strong text-ink mb-xs"
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
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="date"
              className="text-body-sm-strong text-ink mb-xs"
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
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="cursor-pointer bg-primary text-on-primary hover:bg-primary-active rounded-xl py-md px-xl text-button-md font-semibold transition-colors mt-lg w-full shadow-sm"
          >
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettleUp;
