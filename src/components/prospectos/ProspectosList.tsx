"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ESTADOS_PROSPECTO } from "@/lib/catalogos";
import { actualizarProspecto, eliminarProspecto } from "@/app/(protected)/prospectos/actions";

export type ProspectoRow = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  origen: string | null;
  estado: string;
  notas: string | null;
  created_at: string;
  nCotizaciones: number;
};

export function ProspectosList({ rows }: { rows: ProspectoRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ProspectoRow | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((p) => {
      if (estado && p.estado !== estado) return false;
      if (!s) return true;
      return [p.nombre, p.email, p.telefono, p.origen].some((v) => (v ?? "").toLowerCase().includes(s));
    });
  }, [rows, q, estado]);

  async function changeEstado(id: string, nuevo: string) {
    setBusyId(id);
    await actualizarProspecto(id, { estado: nuevo });
    router.refresh();
    setBusyId(null);
  }

  async function doDelete() {
    if (!confirm) return;
    setBusyId(confirm.id);
    await eliminarProspecto(confirm.id);
    setConfirm(null);
    router.refresh();
    setBusyId(null);
  }

  return (
    <>
      <div className="toolbar" style={{ gap: 10, justifyContent: "flex-start", flexWrap: "wrap" }}>
        <input placeholder="Buscar nombre, correo, teléfono…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320 }} />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS_PROSPECTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="mono" style={{ fontSize: 11, color: "var(--warm)" }}>{filtered.length} de {rows.length}</span>
      </div>

      <table className="data">
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Origen</th><th>Estado</th><th>Cotiz.</th><th></th></tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={7} style={{ color: "var(--warm)" }}>Sin prospectos.</td></tr>
          ) : (
            filtered.map((p) => (
              <tr key={p.id} style={busyId === p.id ? { opacity: 0.5 } : undefined}>
                <td><Link href={`/prospectos/${p.id}`}><b>{p.nombre}</b></Link></td>
                <td>{p.email || "—"}</td>
                <td>{p.telefono || "—"}</td>
                <td>{p.origen || "—"}</td>
                <td>
                  <select value={p.estado} onChange={(e) => changeEstado(p.id, e.target.value)} style={{ fontSize: 11, padding: "4px 6px", minWidth: 150 }}>
                    {Object.entries(ESTADOS_PROSPECTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="mono">{p.nCotizaciones}</td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn ghost sm" onClick={() => setConfirm(p)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {confirm && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setConfirm(null)}>
          <div className="modal">
            <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, margin: "0 0 12px" }}>Eliminar prospecto</h2>
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>
              Vas a eliminar a <b>{confirm.nombre}</b>.
              {confirm.nCotizaciones > 0 && (
                <> Tiene <b>{confirm.nCotizaciones}</b> cotización{confirm.nCotizaciones === 1 ? "" : "es"} que también se eliminarán en cascada.</>
              )}
            </p>
            <p className="mono" style={{ fontSize: 11, color: "#a1483c", margin: "10px 0 16px" }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn ghost sm" onClick={() => setConfirm(null)}>Cancelar</button>
              <button className="btn sm" style={{ background: "#a1483c" }} onClick={doDelete} disabled={busyId === confirm.id}>
                {busyId === confirm.id ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
