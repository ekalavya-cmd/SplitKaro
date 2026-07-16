import { useState, useEffect } from "react";
import useDebounce from "./useDebounce";

export const useExpenseFilters = (expenses) => {
  const [filterDescription, setFilterDescription] = useState("");
  const [filterSplitType, setFilterSplitType] = useState("all");
  const [filterPaidBy, setFilterPaidBy] = useState("all");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterDatePreset, setFilterDatePreset] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [isAdvancedFiltersExpanded, setIsAdvancedFiltersExpanded] = useState(false);

  const handleDatePresetChange = (preset) => {
    setFilterDatePreset(preset);
    const today = new Date();

    if (preset === "all") {
      setFilterFromDate("");
      setFilterToDate("");
    } else if (preset === "today") {
      const formatted = formatDateToLocalYMD(today);
      setFilterFromDate(formatted);
      setFilterToDate(formatted);
    } else if (preset === "this-week") {
      // Start of week: Sunday
      const dayOfWeek = today.getDay();
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - dayOfWeek);
      setFilterFromDate(formatDateToLocalYMD(sunday));
      setFilterToDate(formatDateToLocalYMD(today));
    } else if (preset === "this-month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilterFromDate(formatDateToLocalYMD(firstDay));
      setFilterToDate(formatDateToLocalYMD(today));
    } else if (preset === "last-30-days") {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setFilterFromDate(formatDateToLocalYMD(thirtyDaysAgo));
      setFilterToDate(formatDateToLocalYMD(today));
    } else if (preset === "this-year") {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      setFilterFromDate(formatDateToLocalYMD(firstDayOfYear));
      setFilterToDate(formatDateToLocalYMD(today));
    }
  };

  const handleResetFilters = () => {
    setFilterDescription("");
    setFilterSplitType("all");
    setFilterPaidBy("all");
    setFilterFromDate("");
    setFilterToDate("");
    setFilterDatePreset("all");
    setFilterMinAmount("");
    setFilterMaxAmount("");
  };

  const formatDateToLocalYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const debouncedDescription = useDebounce(filterDescription, 300);

  const isAmountRangeInvalid =
    filterMinAmount !== "" &&
    filterMaxAmount !== "" &&
    parseFloat(filterMinAmount) > parseFloat(filterMaxAmount);

  const activeAdvancedFiltersCount =
    (filterDatePreset !== "all" ? 1 : 0) +
    (filterMinAmount !== "" ? 1 : 0) +
    (filterMaxAmount !== "" ? 1 : 0);

  const filteredExpenses = (expenses || []).filter((expense) => {
    const descriptionMatch = expense.description
      .toLowerCase()
      .includes(debouncedDescription.toLowerCase());
    const splitTypeMatch =
      filterSplitType === "all" || expense.splitType === filterSplitType;
    const paidByMatch =
      filterPaidBy === "all" || String(expense.paidBy) === filterPaidBy;

    // Parse expense date to local YYYY-MM-DD
    const expDateString = formatDateToLocalYMD(new Date(expense.date));
    const matchesFromDate =
      filterFromDate === "" || expDateString >= filterFromDate;
    const matchesToDate = filterToDate === "" || expDateString <= filterToDate;

    // Ignore min/max amount filter when range is invalid
    const matchesMinAmount =
      isAmountRangeInvalid ||
      filterMinAmount === "" ||
      Number(expense.amount) >= parseFloat(filterMinAmount);
    const matchesMaxAmount =
      isAmountRangeInvalid ||
      filterMaxAmount === "" ||
      Number(expense.amount) <= parseFloat(filterMaxAmount);

    return (
      descriptionMatch &&
      splitTypeMatch &&
      paidByMatch &&
      matchesFromDate &&
      matchesToDate &&
      matchesMinAmount &&
      matchesMaxAmount
    );
  });

  return {
    filteredExpenses,
    filterProps: {
      filterDescription,
      setFilterDescription,
      filterSplitType,
      setFilterSplitType,
      filterPaidBy,
      setFilterPaidBy,
      filterFromDate,
      setFilterFromDate,
      filterToDate,
      setFilterToDate,
      filterDatePreset,
      setFilterDatePreset,
      filterMinAmount,
      setFilterMinAmount,
      filterMaxAmount,
      setFilterMaxAmount,
      isAdvancedFiltersExpanded,
      setIsAdvancedFiltersExpanded,
      handleDatePresetChange,
      handleResetFilters,
      isAmountRangeInvalid,
      activeAdvancedFiltersCount,
    },
  };
};
