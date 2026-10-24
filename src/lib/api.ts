/**
 * Central API base URL and fetch helper.
 * When NEXT_PUBLIC_API_URL is empty, uses internal Next.js API routes (relative path ""),
 * allowing frontend and backend to run 100% unified on Netlify or localhost without external servers.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const API_URL = API_BASE;
export default API_BASE;

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Ensure the endpoint properly leads with /api unless already present
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
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errorBody = await res.json();
      errorDetail = errorBody.detail || errorDetail;
    } catch {
      // not JSON
    }
    throw new Error(errorDetail);
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }
  return null;
}
