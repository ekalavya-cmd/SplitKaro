function validateAndParseDate(date) {
  const parsedDate = date ? new Date(date) : new Date();
  if (Number.isNaN(parsedDate.getTime())) {
    throw { status: 400, message: "Invalid date format" };
  }
  return parsedDate;
}

module.exports = { validateAndParseDate };
