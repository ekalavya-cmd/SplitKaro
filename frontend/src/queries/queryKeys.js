// Normalize groupId to a number at the key-factory boundary.
// `groups[0].id` from the API is a number; `e.target.value` from the
// group <select> is always a string. Without this coercion both types
// would enter the cache simultaneously as distinct keys, making cross-page
// invalidation silently unreliable.
// toNum("1") → 1  |  toNum(1) → 1  |  toNum("") → "" (keeps disabled-query guard working)
const toNum = (id) => (id === "" || id == null ? id : Number(id));

export const queryKeys = {
  groups: {
    all: () => ["groups"],
    detail: (groupId) => ["groups", toNum(groupId)],
  },
  expenses: {
    list: (groupId) => ["groups", toNum(groupId), "expenses"],
  },
  balances: {
    list: (groupId) => ["groups", toNum(groupId), "balances"],
  },
  settlements: {
    list: (groupId) => ["groups", toNum(groupId), "settlements"],
    suggest: (groupId) => ["groups", toNum(groupId), "settlements", "suggest"],
  },
};
