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
    <div className="m-4 grid grid-cols-2 gap-8">
      <div>
        <div className="mb-4">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Settle Up</h1>
          <p className="text-sm text-gray-600">
            Record payments between group members to clear balances
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="groupSelect"
            className="mb-2 block font-semibold text-gray-700"
          >
            Select Group:
          </label>
          <select
            id="groupSelect"
            value={selectedGroupId}
            onChange={handleGroupChange}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
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

        <div className="mb-4">
          <h2 className="mt-4 mb-2 text-2xl font-semibold text-gray-800">
            Simplified Settlements
          </h2>
          {suggestions && suggestions.length > 0 ? (
            <div className="w-full space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-lg">
                    <span className="font-semibold">
                      {suggestion.from.name}
                    </span>{" "}
                    owes{" "}
                    <span className="font-semibold">{suggestion.to.name}</span>:{" "}
                    <span className="font-bold text-green-600">
                      ₹{suggestion.amount.toFixed(2)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4 w-full rounded-lg border border-gray-300 bg-gray-100 p-5">
              <p className="text-md font-medium text-gray-600">
                All balances are settled!
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="mt-4 mb-2 text-2xl font-semibold text-gray-800">
            Settlements History
          </h2>
          <table className="w-full border-collapse border border-gray-400 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Date</th>
                <th className="border border-gray-300 p-2">Payer</th>
                <th className="border border-gray-300 p-2">Payee</th>
                <th className="border border-gray-300 p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {settlementsData &&
              settlementsData.settlements &&
              settlementsData.settlements.length > 0 ? (
                settlementsData.settlements.map((settlement) => (
                  <tr key={settlement.id}>
                    <td className="border border-gray-300 p-2">
                      {new Date(settlement.date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {settlement.payer.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {settlement.payee.name}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {settlement.amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-gray-300 p-2" colSpan="4">
                    No settlements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div>
          <div className="max-w-md rounded-2xl bg-gray-100 p-8">
            <h1 className="mb-5 text-2xl font-semibold text-gray-800">
              Record Settlement
            </h1>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="paid_by"
                  className="mb-2 text-sm font-semibold text-gray-700"
                >
                  Payer
                </label>
                <select
                  id="paid_by"
                  name="paid_by"
                  value={inputs.paid_by}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
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
                  className="mb-2 text-sm font-semibold text-gray-700"
                >
                  Payee
                </label>
                <select
                  id="paid_to"
                  name="paid_to"
                  value={inputs.paid_to}
                  onChange={handleInputChange}
                  required
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
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
                  className="mb-2 text-sm font-semibold text-gray-700"
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
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="date"
                  className="mb-2 text-sm font-semibold text-gray-700"
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
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="mt-2 cursor-pointer rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
              >
                Record Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettleUp;
