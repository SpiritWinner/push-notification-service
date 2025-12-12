import { api } from "./axiosInstance";
import type { HistoryItem } from "../types";

export const fetchHistoryApi = async (): Promise<HistoryItem[]> => {
  const res = await api.get("/api/history");
  return res.data.history || [];
};
