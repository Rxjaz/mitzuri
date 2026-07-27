const TOKEN_KEY = "mitzuri.token";

//evento emitido cuando la API responde 401 con un token que ya no sirve
export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const emitUnauthorized = () => {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
};
