import { useState } from "react";
import { calculatePresetDates } from "../utils/dateFilters";

export const useSettlementFilters = (settlements) => {
  const [filterPaidBy, setFilterPaidBy] = useState("all");
  const [filterPaidTo, setFilterPaidTo] = useState("all");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterDatePreset, setFilterDatePreset] = useState("all");
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
  };

  // Count how many advanced filters are currently active
  const activeAdvancedFiltersCount = [
    filterDatePreset !== "all",
    filterFromDate !== "",
    filterToDate !== "",
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

        return (
          matchesPaidBy &&
          matchesPaidTo &&
          matchesFromDate &&
          matchesToDate
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
    isAdvancedFiltersExpanded,
    setIsAdvancedFiltersExpanded,
    activeAdvancedFiltersCount,
    handleResetFilters,
  };

  return { filteredSettlements, filterProps };
};
