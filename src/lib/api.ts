/**
 * Central API base URL and fetch helper.
 * In development:  uses http://localhost:8000
 * In production:   uses NEXT_PUBLIC_API_URL environment variable
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_URL = API_BASE;
export default API_BASE;

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Ensure the endpoint properly leads with /api unless already present or root
  const cleanEndpoint = endpoint.startsWith("/api")
    ? endpoint
    : `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const url = `${API_BASE}${cleanEndpoint}`;

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return null;
}
