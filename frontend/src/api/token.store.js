// Minimal in-memory token store
let token = null;

export const getAccessToken = () => token;

export const setAccessToken = (newToken) => {
  token = newToken;
};

export const clearAccessToken = () => {
  token = null;
};
