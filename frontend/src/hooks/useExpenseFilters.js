import { useState } from "react";
import useDebounce from "./useDebounce";
import {
  formatDateToLocalYMD,
  calculatePresetDates,
} from "../utils/dateFilters";

export const useExpenseFilters = (expenses) => {
  const [filterDescription, setFilterDescription] = useState("");
  const [filterSplitType, setFilterSplitType] = useState("all");
  const [filterPaidBy, setFilterPaidBy] = useState("all");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterDatePreset, setFilterDatePreset] = useState("all");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [isAdvancedFiltersExpanded, setIsAdvancedFiltersExpanded] =
    useState(false);

  const handleDatePresetChange = (preset) => {
    setFilterDatePreset(preset);
    const { fromDate, toDate } = calculatePresetDates(preset);
    setFilterFromDate(fromDate);
    setFilterToDate(toDate);
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
