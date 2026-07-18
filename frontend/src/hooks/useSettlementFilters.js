import { useState } from "react";
import { calculatePresetDates } from "../utils/dateFilters";

export const useSettlementFilters = (settlements) => {
  const [filterPaidBy, setFilterPaidBy] = useState("all");
  const [filterPaidTo, setFilterPaidTo] = useState("all");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterDatePreset, setFilterDatePreset] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [isAdvancedFiltersExpanded, setIsAdvancedFiltersExpanded] = useState(false);

  const handleDatePresetChange = (preset) => {
    setFilterDatePreset(preset);
    const { fromDate, toDate } = calculatePresetDates(preset);
    setFilterFromDate(fromDate);
    setFilterToDate(toDate);
  };

  const handleResetFilters = () => {
    setFilterPaidBy("all");
    setFilterPaidTo("all");
    setFilterFromDate("");
    setFilterToDate("");
    setFilterDatePreset("all");
    setFilterMinAmount("");
    setFilterMaxAmount("");
  };

  const isAmountRangeInvalid =
    filterMinAmount !== "" &&
    filterMaxAmount !== "" &&
    parseFloat(filterMinAmount) > parseFloat(filterMaxAmount);

  // Count how many advanced filters are currently active
  const activeAdvancedFiltersCount = [
    filterDatePreset !== "all",
    filterFromDate !== "",
    filterToDate !== "",
    filterMinAmount !== "",
    filterMaxAmount !== "",
  ].filter(Boolean).length;

  const filteredSettlements = Array.isArray(settlements)
    ? settlements.filter((settlement) => {
        // Paid By filter
        const matchesPaidBy =
          filterPaidBy === "all" ||
          String(settlement.paidBy) === String(filterPaidBy);

        // Paid To filter
        const matchesPaidTo =
          filterPaidTo === "all" ||
          String(settlement.paidTo) === String(filterPaidTo);

        // Date range filters — derive YYYY-MM-DD from the settlement date
        const rawDate = settlement.date;
        const dateObj = new Date(rawDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const settlDateString = `${year}-${month}-${day}`;

        const matchesFromDate =
          filterFromDate === "" || settlDateString >= filterFromDate;
        const matchesToDate =
          filterToDate === "" || settlDateString <= filterToDate;

        // Amount filters — ignore both if the range is invalid
        const matchesMinAmount =
          isAmountRangeInvalid ||
          filterMinAmount === "" ||
          Number(settlement.amount) >= parseFloat(filterMinAmount);
        const matchesMaxAmount =
          isAmountRangeInvalid ||
          filterMaxAmount === "" ||
          Number(settlement.amount) <= parseFloat(filterMaxAmount);

        return (
          matchesPaidBy &&
          matchesPaidTo &&
          matchesFromDate &&
          matchesToDate &&
          matchesMinAmount &&
          matchesMaxAmount
        );
      })
    : [];

  const filterProps = {
    filterPaidBy,
    setFilterPaidBy,
    filterPaidTo,
    setFilterPaidTo,
    filterFromDate,
    setFilterFromDate,
    filterToDate,
    setFilterToDate,
    filterDatePreset,
    setFilterDatePreset,
    handleDatePresetChange,
    filterMinAmount,
    setFilterMinAmount,
    filterMaxAmount,
    setFilterMaxAmount,
    isAmountRangeInvalid,
    isAdvancedFiltersExpanded,
    setIsAdvancedFiltersExpanded,
    activeAdvancedFiltersCount,
    handleResetFilters,
  };

  return { filteredSettlements, filterProps };
};
