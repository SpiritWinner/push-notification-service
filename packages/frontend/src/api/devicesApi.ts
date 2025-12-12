import axios from "axios";
import { API_BASE } from "./axiosInstance";
import type { Device } from "../types";

export const fetchDevicesApi = async (): Promise<Device[]> => {
  const res = await axios.get(`${API_BASE}/api/users`);
  const users = res.data.users || [];

  return users.map((u: any) =>
    typeof u === "string" ? { user_id: u } : u
  );
};
