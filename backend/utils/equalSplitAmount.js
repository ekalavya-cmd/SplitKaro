function splitAmount(totalAmount, membersCount) {
  const baseShare = Math.floor(totalAmount / membersCount);
  const remainder = totalAmount - baseShare * membersCount;

  return Array.from(
    { length: membersCount },
    (_, index) => baseShare + (index < remainder ? 1 : 0),
  );
}

module.exports = { splitAmount };
