import { useEffect, useState } from "react";
import Login from "../components/Login";
import DevicesTable from "../components/DevicesTable";
import NotificationSender from "../components/NotificationSender";
import HistoryTable from "../components/HistoryTable";

import type { Device, HistoryItem } from "../types";
import { fetchDevicesApi } from "../api/devicesApi";
import { fetchHistoryApi } from "../api/historyApi";
import { sendToSingleUser, broadcastAllUsers } from "../api/notificationsApi";

export default function AdminApp() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [loggedIn, setLoggedIn] = useState(!!token);

  const [devices, setDevices] = useState<Device[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [filter, setFilter] = useState("");
  const filtered = devices.filter((d) =>
    JSON.stringify(d).toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    if (loggedIn) {
      loadDevices();
      loadHistory();
    }
  }, [loggedIn]);

  const loadDevices = async () => {
    setLoadingDevices(true);
    const res = await fetchDevicesApi();
    setDevices(res);
    setLoadingDevices(false);
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      setHistory(await fetchHistoryApi());
    } catch {
      setHistory([]);
    }
    setLoadingHistory(false);
  };

  const login = (t: string) => {
    localStorage.setItem("admin_token", t);
    setToken(t);
    setLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setLoggedIn(false);
  };

  const sendSingle = async (id: string, title: string, body: string) => {
    await sendToSingleUser(id, title, body);
    await loadHistory();
  };

  const sendSegment = async (ids: string[], title: string, body: string) => {
    for (const id of ids) {
        await sendSingle(id, title, body);
    }
  };

  const sendAllAdmin = async (title: string, body: string) => {
    await broadcastAllUsers(title, body);
    await loadHistory();
  };

  if (!loggedIn) return <Login onLogin={login} />;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="mb-6">
        <div className="md:hidden space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <button 
              onClick={logout} 
              className="px-3 py-1.5 bg-red-500 text-white rounded text-sm"
            >
              Выйти
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={loadDevices} 
              className="flex-1 min-w-[120px] px-3 py-2 bg-white border rounded text-sm"
            >
              Обновить девайсы
            </button>
            <button 
              onClick={loadHistory} 
              className="flex-1 min-w-[120px] px-3 py-2 bg-white border rounded text-sm"
            >
              Обновить историю
            </button>
          </div>
        </div>

        <div className="hidden md:flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={loadDevices} 
              className="px-4 py-2 bg-white border rounded hover:bg-gray-50 transition-colors"
            >
              Обновить девайсы
            </button>
            <button 
              onClick={loadHistory} 
              className="px-4 py-2 bg-white border rounded hover:bg-gray-50 transition-colors"
            >
              Обновить историю
            </button>
            <button 
              onClick={logout} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* devs list */}
        <section className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-medium text-lg">Девайсы ({filtered.length})</h2>
            
            <input
              className="border border-gray-300 p-2 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Фильтр..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>

          <DevicesTable devices={filtered} loading={loadingDevices} />
        </section>

        {/* sender */}
        <aside className="lg:col-span-2 bg-white p-4 md:p-5 rounded-lg shadow-sm sticky top-6 h-fit">
          <NotificationSender
            devices={devices}
            filtered={filtered}
            onSendAllAdmin={sendAllAdmin}
            onSendSegment={sendSegment}
            onSendSingle={sendSingle}
          />
        </aside>
      </main>

      <section className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="font-medium mb-3">История</h2>
        <HistoryTable history={history} loading={loadingHistory} />
      </section>
    </div>
  );
}
