
import { logout } from "./auth";

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("authToken");
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    logout();
  }

  return response;
}
