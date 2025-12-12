import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE;

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});
