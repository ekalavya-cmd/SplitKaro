/**
 * Distributes a penny remainder across an array of integer-cent amounts.
 * Rule: Extra cents (positive or negative) are distributed one-by-one to the
 * first N members in array order.
 */
export function distributeRemainder(amounts, remainder) {
  const result = [...amounts];
  const adjustment = remainder > 0 ? 1 : -1;
  const count = Math.abs(remainder);

  if (count > amounts.length) {
    throw new Error(`Critical invariant violation: Remainder (${remainder}) exceeds the number of members (${amounts.length}) and cannot be safely absorbed.`);
  }

  for (let i = 0; i < count; i++) {
    result[i] += adjustment;
  }
  return result;
}

/**
 * Calculates equal integer-cent splits for a given total and distributes the remainder.
 */
export function splitAmount(totalAmount, membersCount) {
  const baseShare = Math.floor(totalAmount / membersCount);
  const remainder = totalAmount - baseShare * membersCount;

  const baseAmounts = Array(membersCount).fill(baseShare);
  return distributeRemainder(baseAmounts, remainder);
}
