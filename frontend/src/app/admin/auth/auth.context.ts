import { createContext } from "react";
import type { User } from "../../../types/auth";

//loading: todavia no se sabe si hay sesion (se esta validando el token)
//authenticated: hay usuario real confirmado por el backend
//anonymous: no hay sesion valida
export type AuthStatus = "loading" | "authenticated" | "anonymous";

export type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
