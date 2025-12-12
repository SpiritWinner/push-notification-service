import React, { useState } from "react";

interface Props {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setError("Введите пароль");
    onLogin(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Вход в админку</h2>

        <label className="text-xs text-gray-600">Пароль</label>
        <input
          className="w-full border p-2 rounded mb-3"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-red-600">{error}</div>}

        <button className="w-full bg-blue-600 text-white py-2 rounded">Войти</button>
      </form>
    </div>
  );
}
