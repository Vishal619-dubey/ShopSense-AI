import axios from "axios";

const fallbackApiUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://shopsense-ai-6ge1.onrender.com/api";

const baseURL = (
  import.meta.env.VITE_API_URL || fallbackApiUrl
).replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shopsense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;