import React, { useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroup } from "../services/group.service";
import {
  getSettlementSuggestions,
  getSettlements,
  createSettlement,
  deleteSettlement,
} from "../services/settlement.service";
import { useSettlementFilters } from "../hooks/useSettlementFilters";
import { SettlementFilters } from "../components/SettlementFilters";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBlock } from "../components/ErrorBlock";
import { Skeleton } from "../components/Skeleton";
import { usePageQueryState } from "../hooks/usePageQueryState";

const clearInputs = {
  paid_by: "",
  paid_to: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
};

const SettleUp = () => {
  const { selectedGroupId } = useOutletContext();
  const queryClient = useQueryClient();
  const location = useLocation();

  const groupQuery = useQuery({
    queryKey: ["groups", selectedGroupId],
    queryFn: () => getGroup(selectedGroupId),
    enabled: !!selectedGroupId,
  });
  const group = groupQuery.data;

  const suggestionsQuery = useQuery({
    queryKey: ["groups", selectedGroupId, "settlements", "suggest"],
    queryFn: () => getSettlementSuggestions(selectedGroupId),
    enabled: !!selectedGroupId,
  });
  const suggestions = suggestionsQuery.data || [];

  const settlementsQuery = useQuery({
    queryKey: ["groups", selectedGroupId, "settlements"],
    queryFn: () => getSettlements(selectedGroupId),
    enabled: !!selectedGroupId,
  });
  const settlementsData = settlementsQuery.data || { settlements: [] };

  const { isError, errors, refetchAll } = usePageQueryState([
    groupQuery,
    suggestionsQuery,
    settlementsQuery,
  ]);

  const { filteredSettlements, filterProps } = useSettlementFilters(
    settlementsData.settlements,
  );

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
    const month = date.toLocaleString("en-US", { month: "short" });
    // const year = date.getFullYear();
    return `${month} ${day}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const createSettlementMutation = useMutation({
    mutationFn: ({ groupId, inputs }) => createSettlement(groupId, inputs),
    onSuccess: (data, variables) => {
      alert("Settlement recorded successfully!");
      queryClient.invalidateQueries({
        queryKey: ["groups", variables.groupId, "balances"],
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", variables.groupId, "settlements", "suggest"],
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", variables.groupId, "settlements"],
      });
      setInputs(clearInputs);
    },
    onError: (error) => {
      console.error("Error recording settlement:", error);
      alert("Failed to record settlement. Please try again.");
    },
  });

  const deleteSettlementMutation = useMutation({
    mutationFn: ({ settlementId }) => deleteSettlement(settlementId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["groups", variables.groupId, "balances"],
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", variables.groupId, "settlements", "suggest"],
      });
      queryClient.invalidateQueries({
        queryKey: ["groups", variables.groupId, "settlements"],
      });
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedGroupId) {
      alert("Please select a group first.");
      return;
    }
    createSettlementMutation.mutate({ groupId: selectedGroupId, inputs });
  };

  if (isError) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6">
        <ErrorBlock
          error={{
            message:
              errors[0]?.message +
              (errors.length > 1
                ? ` (and ${errors.length - 1} other error${errors.length > 2 ? "s" : ""})`
                : ""),
          }}
          refetch={refetchAll}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left Column */}
      <div className="flex flex-col gap-8 lg:col-span-7">
        <div className="border-b border-outline-variant pb-6">
          <h1 className="mb-2 font-headline-lg text-headline-lg font-bold text-on-surface">
            Settle Up
          </h1>
          <p className="text-label-md font-label-md text-on-surface-variant">
            Record payments between group members to clear balances
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Simplified Settlements
          </h2>
          <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
            {suggestionsQuery.isLoading ? (
              <div className="flex min-h-19 items-center justify-between border-b border-outline-variant p-4 last:border-b-0">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-16 rounded-DEFAULT" />
              </div>
            ) : suggestions && suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-outline-variant p-4 transition-colors last:border-b-0 hover:bg-surface-container-low"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-body-md text-body-md text-on-surface">
                      <span className="font-medium text-on-surface">
                        {suggestion.from.name}
                      </span>{" "}
                      pays{" "}
                      <span className="font-medium text-on-surface">
                        {suggestion.to.name}
                      </span>
                    </p>
                    <p className="font-mono-data font-medium text-secondary">
                      ₹{suggestion.amount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        paid_by: suggestion.from.id,
                        paid_to: suggestion.to.id,
                        amount: suggestion.amount.toFixed(2),
                      }))
                    }
                    className="rounded-DEFAULT border border-primary bg-transparent px-3 py-1.5 font-label-sm text-label-sm font-semibold tracking-wide text-primary transition-all hover:bg-primary/5 hover:shadow-md"
                  >
                    Settle
                  </button>
                </div>
              ))
            ) : (
              <div className="flex min-h-19 items-center justify-center text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  All balances are settled!
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Settlements History
          </h2>

          <SettlementFilters
            filterProps={filterProps}
            members={group ? group.members : []}
          />

          <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="w-24 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Date
                    </th>
                    <th className="w-32 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Payer
                    </th>
                    <th className="w-32 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Payee
                    </th>
                    <th className="w-32 px-4 py-3 text-right font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {settlementsQuery.isLoading ? (
                    Array.from({ length: 1 }).map((_, i) => (
                      <tr key={i} className="h-row-height-compact">
                        <td className="px-4 py-8">
                          <Skeleton className="h-4 w-12" />
                        </td>
                        <td className="px-4 py-8">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-4 py-8">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-4 py-8 text-right">
                          <Skeleton className="ml-auto h-4 w-16" />
                        </td>
                      </tr>
                    ))
                  ) : filteredSettlements && filteredSettlements.length > 0 ? (
                    filteredSettlements.map((settlement) => (
                      <tr
                        key={settlement.id}
                        className="h-row-height-compact transition-colors hover:bg-surface-container-low/50"
                      >
                        <td className="px-4 py-2 font-mono-data text-sm whitespace-nowrap text-on-surface-variant">
                          {formatDateToDisplay(settlement.date)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] text-on-secondary-container">
                              {settlement.payer.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="truncate font-body-md font-medium text-on-surface">
                              {settlement.payer.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] text-on-secondary-container">
                              {settlement.payee.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="truncate font-body-md font-medium text-on-surface">
                              {settlement.payee.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-mono-data font-medium text-on-surface">
                          ₹{settlement.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="h-20 px-4 text-center text-body-md text-on-surface-variant"
                        colSpan="4"
                      >
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

      {/* Right Column: Record Settlement Form */}
      <div className="relative lg:col-span-5">
        <div className="sticky top-24 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="mb-6 font-headline-md text-headline-md font-bold text-on-surface">
            Record Settlement
          </h2>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="paid_by"
                className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
              >
                Payer
              </label>
              <select
                id="paid_by"
                name="paid_by"
                value={inputs.paid_by}
                onChange={handleInputChange}
                required
                className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="" disabled>
                  Select Payer
                </option>
                {groupQuery.isLoading ? (
                  <option value="" disabled>
                    Loading...
                  </option>
                ) : group && group.members && group.members.length > 0 ? (
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
                className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
              >
                Payee
              </label>
              <select
                id="paid_to"
                name="paid_to"
                value={inputs.paid_to}
                onChange={handleInputChange}
                required
                className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="" disabled>
                  Select Payee
                </option>
                {groupQuery.isLoading ? (
                  <option value="" disabled>
                    Loading...
                  </option>
                ) : group && group.members && group.members.length > 0 ? (
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
                className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
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
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="date"
                className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
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
                className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={createSettlementMutation.isPending}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-DEFAULT bg-primary px-4 font-label-sm text-label-sm font-semibold tracking-wide text-on-primary transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createSettlementMutation.isPending
                ? "Recording..."
                : "Record Payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettleUp;
