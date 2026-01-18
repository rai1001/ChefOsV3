/* istanbul ignore file */
"use client";

import { useState } from "react";

type RoleOption = {
  value: "admin" | "planner" | "purchasing" | "chef" | "viewer";
  label: string;
};

const roleOptions: RoleOption[] = [
  { value: "admin", label: "Admin" },
  { value: "planner", label: "Planner" },
  { value: "purchasing", label: "Compras" },
  { value: "chef", label: "Cocina" },
  { value: "viewer", label: "Viewer" }
];

export const InviteUserForm = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleOption["value"]>("planner");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), role })
    });

    const payload = (await response.json()) as { error?: string; message?: string };
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "No se pudo enviar la invitacion");
      return;
    }

    setEmail("");
    setRole("planner");
    setSuccess(payload.message ?? "Invitacion enviada");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Invitar usuario</p>
          <p className="text-xs text-slate-500">
            Se envia un enlace de acceso al correo indicado.
          </p>
        </div>
        <button
          type="submit"
          disabled={!email.trim() || loading}
          className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Enviando..." : "Invitar"}
        </button>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-slate-700">
          Email
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@hotel.com"
            required
          />
        </label>
        <label className="text-sm text-slate-700">
          Rol
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleOption["value"])}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">Error: {error}</p>}
      {success && <p className="mt-2 text-xs text-emerald-700">{success}</p>}
    </form>
  );
};
