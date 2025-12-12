import { useState } from "react";
import type { Device, SendResult } from "../types";

interface Props {
  devices: Device[];
  filtered: Device[];
  onSendSingle: (id: string, title: string, body: string) => Promise<void>;
  onSendSegment: (ids: string[], title: string, body: string) => Promise<void>;
  onSendAllAdmin: (title: string, body: string) => Promise<void>;
}

export default function NotificationSender({
  devices,
  filtered,
  onSendSingle,
  onSendSegment,
  onSendAllAdmin
}: Props) {
  const [selected, setSelected] = useState("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendResult, setSendResult] = useState<SendResult | string | null>(null);

    const send = async () => {
        if (!title.trim() || !body.trim()) {
            setSendResult({ ok: false, error: "Заполните поля" });
            return;
        }

        if (selected === "all") {
            await onSendAllAdmin(title, body);
            return;
        }

        if (selected === "segment") {
            const ids = filtered.map((i) => i.user_id);
            await onSendSegment(ids, title, body);
            return;
        }

        await onSendSingle(selected, title, body);
    };

  return (
    <div>
      <select className="w-full border p-2 rounded mb-2" value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="all">Всем пользователям</option>
        <option value="segment">Сегмент (фильтр)</option>
        <option disabled>────────────</option>
        {devices.map((d) => (
          <option key={d.user_id} value={d.user_id}>
            {d.user_id}
          </option>
        ))}
      </select>

      <input
        className="w-full border p-2 rounded mb-2"
        placeholder="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2 rounded mb-2 resize-none"
        rows={4}
        placeholder="Текст"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <button onClick={send} className="w-full bg-blue-600 text-white py-2 rounded">
        Отправить
      </button>

      <div className="text-xs mt-2">
        {sendResult && <pre>{JSON.stringify(sendResult, null, 2)}</pre>}
      </div>
    </div>
  );
}
