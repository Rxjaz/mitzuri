import { apiClient } from "./apiClient";
import { clearToken, getToken, setToken } from "./token.storage";
import type { LoginResponse, User } from "../types/auth";

export const login = async (
  email: string,
  password: string
): Promise<User> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  setToken(response.token);

  return response.user;
};

export const getMe = async (): Promise<User> => {
  return apiClient.get<User>("/auth/me");
};

export const logout = async (): Promise<void> => {
  //el backend hoy no invalida el JWT, pero se avisa igual para no
  //depender de ese detalle desde el frontend
  if (getToken()) {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      //si el token ya no sirve, se cierra la sesion local igual
    }
  }

  clearToken();
};

export const hasStoredSession = (): boolean => {
  return getToken() !== null;
};
