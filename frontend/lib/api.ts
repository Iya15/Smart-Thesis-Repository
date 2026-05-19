import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true, // Send httpOnly JWT cookie on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — JWT lives in the httpOnly cookie so no manual attachment needed.
// This hook is kept for future use (e.g. request logging, CSRF tokens).
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor — redirect to /login on 401 (expired / missing token).
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Guard against SSR context where window is not available
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
