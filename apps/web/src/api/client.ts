// ─────────────────────────────────────────────────────────────────────────────
// API CLIENT — Mobile + Desktop compatible
// withCredentials sends cookies for desktop
// Authorization header sends token for mobile Safari + Brave
// The backend protect middleware accepts either — whichever arrives wins
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const apiClient = axios.create({
  baseURL: `${BASE_URL}`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      // Avoid redirect loop on the login page itself
      if (!window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  },
);

export default apiClient;
