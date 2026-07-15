"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { actualizarPerfil } from "@/app/(protected)/perfil/actions";

export function PerfilEditor({ p }: { p: { nombre: string; telefono: string; puesto: string; whatsapp: string; email: string; rol: string } }) {
  const router = useRouter();
  const [f, setF] = useState({ nombre: p.nombre, telefono: p.telefono, puesto: p.puesto, whatsapp: p.whatsapp });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  function set<K extends keyof typeof f>(k: K, v: string) { setF((prev) => ({ ...prev, [k]: v })); }
  async function save() {
    setSaving(true); setMsg("");
    const res = await actualizarPerfil(f);
    setSaving(false);
    setMsg(res.ok ? "Guardado ✓" : res.error || "Error");
    if (res.ok) router.refresh();
  }

  return (
    <div className="panel" style={{ maxWidth: 620 }}>
      <div className="grid2">
        <div className="field"><label>Nombre visible</label><input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></div>
        <div className="field"><label>Puesto</label><input value={f.puesto} onChange={(e) => set("puesto", e.target.value)} placeholder="Asesor patrimonial" /></div>
        <div className="field"><label>Teléfono</label><input value={f.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="+52 …" /></div>
        <div className="field"><label>WhatsApp (opcional)</label><input value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+52 …" /></div>
      </div>
      <div className="field"><label>Correo (de tu cuenta)</label><input value={p.email} readOnly style={{ background: "#EDEBE4" }} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn sm" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar perfil"}</button>
        {msg && <span className="ok-flash" style={{ color: msg.includes("✓") ? "#4c6b4c" : "#a1483c" }}>{msg}</span>}
      </div>
    </div>
  );
}
