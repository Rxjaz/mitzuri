const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const token = localStorage.getItem("token");

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

    throw new Error(message);
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
};