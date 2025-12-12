import type { HistoryItem } from "../types";

interface Props {
  history: HistoryItem[];
  loading: boolean;
}

export default function HistoryTable({ history, loading }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm hidden md:table">
        <thead className="text-xs text-gray-500">
          <tr>
            <th className="px-2 py-2">ID</th>
            <th className="px-2 py-2">User</th>
            <th className="px-2 py-2">Title</th>
            <th className="px-2 py-2">Body</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} className="p-4 text-center">Загрузка...</td></tr>
          ) : history.length === 0 ? (
            <tr><td colSpan={6} className="p-4 text-center">Пусто</td></tr>
          ) : (
            history.map((h) => (
              <tr key={h.id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-3 text-center">{h.id}</td>
                <td className="px-2 py-3 text-center">{h.user_id}</td>
                <td className="px-2 py-3">{h.title}</td>
                <td className="px-2 py-3 max-w-xs truncate">{h.body}</td>
                <td className="px-2 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    h.status === 'sent' ? 'bg-green-100 text-green-800' :
                    h.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {h.status}
                  </span>
                </td>
                <td className="px-2 py-3 text-center">{new Date(h.sent_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-4 text-center">Загрузка...</div>
        ) : history.length === 0 ? (
          <div className="p-4 text-center">Пусто</div>
        ) : (
          history.map((h) => (
            <div key={h.id} className="bg-white rounded-lg border p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">#{h.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    h.status === 'sent' ? 'bg-green-100 text-green-800' :
                    h.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {h.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  User: {h.user_id}
                </span>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{h.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{h.body}</p>
              </div>
              
              <div className="pt-2 border-t text-xs text-gray-500">
                {new Date(h.sent_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}