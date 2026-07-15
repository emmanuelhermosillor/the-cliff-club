"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS_PROSPECTO } from "@/lib/catalogos";
import { crearProspecto } from "@/app/(protected)/prospectos/actions";

export function NuevoProspecto() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [f, setF] = useState({ nombre: "", email: "", telefono: "", origen: "", estado: "nuevo", notas: "" });

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }));
  }
  function close() {
    setOpen(false);
    setErr("");
    setF({ nombre: "", email: "", telefono: "", origen: "", estado: "nuevo", notas: "" });
  }

  async function save() {
    setErr("");
    setSaving(true);
    try {
      const res = await crearProspecto(f);
      if (!res.ok) {
        setErr(res.error || "No se pudo guardar.");
        return;
      }
      close();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button className="btn sm" onClick={() => setOpen(true)}>+ Nuevo prospecto</button>
      {open && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="modal">
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, margin: "0 0 14px" }}>Nuevo prospecto</h2>
            <div className="field"><label>Nombre</label><input value={f.nombre} onChange={(e) => set("nombre", e.target.value)} /></div>
            <div className="grid2">
              <div className="field"><label>Correo</label><input value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="field"><label>Teléfono</label><input value={f.telefono} onChange={(e) => set("telefono", e.target.value)} /></div>
            </div>
            <div className="grid2">
              <div className="field"><label>Origen</label><input placeholder="Referido, campaña, broker…" value={f.origen} onChange={(e) => set("origen", e.target.value)} /></div>
              <div className="field">
                <label>Estado</label>
                <select value={f.estado} onChange={(e) => set("estado", e.target.value)}>
                  {Object.entries(ESTADOS_PROSPECTO).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field"><label>Notas</label><textarea rows={2} value={f.notas} onChange={(e) => set("notas", e.target.value)} /></div>
            {err && <div className="err">{err}</div>}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button className="btn ghost sm" onClick={close}>Cancelar</button>
              <button className="btn sm" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
