export const formatDateToLocalYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const calculatePresetDates = (preset) => {
  const today = new Date();
  if (preset === "all") {
    return { fromDate: "", toDate: "" };
  } else if (preset === "today") {
    const formatted = formatDateToLocalYMD(today);
    return { fromDate: formatted, toDate: formatted };
  } else if (preset === "this-week") {
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    return {
      fromDate: formatDateToLocalYMD(sunday),
      toDate: formatDateToLocalYMD(today),
    };
  } else if (preset === "this-month") {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      fromDate: formatDateToLocalYMD(firstDay),
      toDate: formatDateToLocalYMD(today),
    };
  } else if (preset === "last-30-days") {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      fromDate: formatDateToLocalYMD(thirtyDaysAgo),
      toDate: formatDateToLocalYMD(today),
    };
  } else if (preset === "this-year") {
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    return {
      fromDate: formatDateToLocalYMD(firstDayOfYear),
      toDate: formatDateToLocalYMD(today),
    };
  }
  return { fromDate: "", toDate: "" };
};
