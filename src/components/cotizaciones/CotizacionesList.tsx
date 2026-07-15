"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type CotRow = {
  id: string;
  folio: number;
  estado: string;
  valor_total: number | null;
  created_at: string;
  etapaNombre: string;
  unidad: string;
  prospecto: string;
};

const money = (n: number | null) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));

export function CotizacionesList({ rows }: { rows: CotRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((c) =>
      [String(c.folio), c.prospecto, c.etapaNombre, c.unidad, c.estado].some((v) => (v ?? "").toLowerCase().includes(s)),
    );
  }, [rows, q]);

  return (
    <>
      <div className="toolbar" style={{ justifyContent: "flex-start", gap: 10 }}>
        <input placeholder="Buscar folio, prospecto, etapa, estado…" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 340 }} />
        <span className="mono" style={{ fontSize: 11, color: "var(--warm)" }}>{filtered.length} de {rows.length}</span>
      </div>
      <table className="data">
        <thead><tr><th>Folio</th><th>Prospecto</th><th>Etapa / unidad</th><th>Valor</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={7} style={{ color: "var(--warm)" }}>Sin cotizaciones.</td></tr>
          ) : filtered.map((c) => (
            <tr key={c.id}>
              <td className="mono">#{c.folio}</td>
              <td><b>{c.prospecto || "—"}</b></td>
              <td>{c.etapaNombre} · {c.unidad}</td>
              <td>{money(c.valor_total)}</td>
              <td><span className="tag">{c.estado}</span></td>
              <td className="mono" style={{ fontSize: 11 }}>{(c.created_at || "").slice(0, 10)}</td>
              <td style={{ textAlign: "right" }}><Link className="btn ghost sm" href={`/cotizaciones/${c.id}`}>Ver / descargar</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
