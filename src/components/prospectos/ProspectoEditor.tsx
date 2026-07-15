"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS_PROSPECTO } from "@/lib/catalogos";
import { actualizarProspecto } from "@/app/(protected)/prospectos/actions";

export type ProspectoData = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  origen: string | null;
  estado: string;
  notas: string | null;
};

export function ProspectoEditor({ p }: { p: ProspectoData }) {
  const router = useRouter();
  const [f, setF] = useState({
    nombre: p.nombre, email: p.email ?? "", telefono: p.telefono ?? "",
    origen: p.origen ?? "", estado: p.estado, notas: p.notas ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set<K extends keyof typeof f>(k: K, v: string) { setF((prev) => ({ ...prev, [k]: v })); }

  async function save() {
    setSaving(true); setMsg("");
    const res = await actualizarProspecto(p.id, f);
    setSaving(false);
    setMsg(res.ok ? "Guardado." : res.error || "Error");
    if (res.ok) router.refresh();
  }

  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div className="grid2">
        <div className="field"><label>Nombre</label><input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></div>
        <div className="field"><label>Estado</label>
          <select value={f.estado} onChange={(e) => set("estado", e.target.value)}>
            {Object.entries(ESTADOS_PROSPECTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="field"><label>Correo</label><input value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="field"><label>Teléfono</label><input value={f.telefono} onChange={(e) => set("telefono", e.target.value)} /></div>
        <div className="field"><label>Origen</label><input value={f.origen} onChange={(e) => set("origen", e.target.value)} /></div>
      </div>
      <div className="field"><label>Notas</label><textarea rows={2} value={f.notas} onChange={(e) => set("notas", e.target.value)} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn sm" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button>
        {msg && <span className="mono" style={{ fontSize: 11, color: msg === "Guardado." ? "#63735A" : "#a1483c" }}>{msg}</span>}
      </div>
    </div>
  );
}
