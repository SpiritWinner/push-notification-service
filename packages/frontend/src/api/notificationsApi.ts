import axios from "axios";
import { API_BASE } from "./axiosInstance";

export const sendToSingleUser = async (userId: string, title: string, body: string) => {
  const res = await axios.post(
    `${API_BASE}/api/send`,
    { title, body },
    {
      headers: {
        Authorization: "Bearer " + userId,
      },
    }
  );
  return res.data;
};

export const broadcastAllUsers = async (title: string, body: string, segment: string[] | null = null) => {
  const res = await axios.post(
    `${API_BASE}/api/broadcast`,
    { title, body, data: segment ? { userIds: segment } : {} },
    {
      headers: {
        Authorization: "Bearer admin",
      },
    }
  );
  return res.data;
};
