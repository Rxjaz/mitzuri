import { apiClient } from "./apiClient";

type User = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
};

type LoginResponse = {
  user: User;
  token: string;
};

export const login = async (
  email: string,
  password: string
): Promise<User> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  localStorage.setItem("token", response.token);

  return response.user;
};

export const getMe = async (): Promise<User> => {
  return apiClient.get<User>("/auth/me");
};

export const logout = () => {
  localStorage.removeItem("token");
};