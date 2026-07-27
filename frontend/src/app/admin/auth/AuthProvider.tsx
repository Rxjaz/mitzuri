import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authService from "../../../services/auth.service";
import { clearToken, UNAUTHORIZED_EVENT } from "../../../services/token.storage";
import type { User } from "../../../types/auth";
import { AuthContext, type AuthStatus, type AuthContextValue } from "./auth.context";

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  //al cargar la app: si hay token guardado se valida contra /auth/me.
  //asi el admin sigue logueado tras recargar o cerrar el navegador.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      if (!authService.hasStoredSession()) {
        setStatus("anonymous");
        return;
      }

      try {
        const me = await authService.getMe();

        if (cancelled) return;

        setUser(me);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;

        //token expirado, invalido o usuario desactivado
        clearToken();
        setUser(null);
        setStatus("anonymous");
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  //si cualquier request responde 401, la sesion se cierra sola
  useEffect(() => {
    const handleUnauthorized = () => {
      clearToken();
      setUser(null);
      setStatus("anonymous");
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedUser = await authService.login(email, password);

    setUser(loggedUser);
    setStatus("authenticated");

    return loggedUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();

    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      login,
      logout,
    }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
