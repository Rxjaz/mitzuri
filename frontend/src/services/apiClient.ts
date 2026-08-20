import { emitUnauthorized, getToken } from "./token.storage";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  //con FormData el header lo pone el navegador, porque incluye el `boundary`
  //que separa las partes del multipart. Fijarlo a mano rompe la subida
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> || {}),
  };

  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "error" in data
        ? (data as { error: string }).error
        : "Request failed";

    //token expirado o invalido: avisar para que la sesion se cierre sola
    if (response.status === 401 && token) {
      emitUnauthorized();
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}

//helpers
export const apiClient = {
  get: <T = unknown>(path: string) =>
    request<T>(path, { method: "GET" }),

  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body as Record<string, unknown>) : undefined,
    }),

  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body as Record<string, unknown>) : undefined,
    }),

  delete: <T = unknown>(path: string) =>
    request<T>(path, {
      method: "DELETE"
    }),

  //el FormData se manda tal cual: nada de JSON.stringify
  upload: <T = unknown>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
};
