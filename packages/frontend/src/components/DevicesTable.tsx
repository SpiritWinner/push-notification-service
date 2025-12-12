import type { Device } from "../types";

interface Props {
  devices: Device[];
  loading: boolean;
}

export default function DevicesTable({ devices, loading }: Props) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-gray-500">
        <tr>
          <th className="px-2 py-2">User ID</th>
          <th className="px-2 py-2">Платформа</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={2} className="p-4">Загрузка...</td></tr>
        ) : devices.length === 0 ? (
          <tr><td colSpan={2} className="p-4">Нет девайсов</td></tr>
        ) : (
          devices.map((d) => (
            <tr key={d.user_id} className="border-t">
              <td className="px-2 py-2">{d.user_id}</td>
              <td className="px-2 py-2">{d.platform || "-"}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
