const apiBaseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");
const tokenStorageKey = "via-livre.access-token";

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const getAccessToken = () => window.sessionStorage.getItem(tokenStorageKey);

export const saveAccessToken = (token) => {
  window.sessionStorage.setItem(tokenStorageKey, token);
};

export const clearAccessToken = () => {
  window.sessionStorage.removeItem(tokenStorageKey);
};

export const apiRequest = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new ApiError(
      payload.error || "Não foi possível concluir a operação.",
      response.status,
      payload.code,
      payload.details
    );
  }
  return payload;
};

export const authApi = {
  register: (data) => apiRequest("/auth/register", { method: "POST", body: data }),
  login: (data) => apiRequest("/auth/login", { method: "POST", body: data }),
  me: () => apiRequest("/auth/me")
};

export const vehicleApi = {
  list: (availability) => {
    const query = availability === "all" ? "" : `?disponiveis=${availability === "available"}`;
    return apiRequest(`/veiculos${query}`);
  },
  create: (data) => apiRequest("/veiculos", { method: "POST", body: data })
};

export const rentalApi = {
  list: () => apiRequest("/locacoes"),
  create: (data) => apiRequest("/locacoes", { method: "POST", body: data }),
  finalize: (id) => apiRequest(`/locacoes/${id}/finalizar`, { method: "PATCH" })
};
