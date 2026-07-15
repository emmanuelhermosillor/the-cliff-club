"use client";

import { useActionState } from "react";
import { guardarEtapa, type AdminResult } from "@/app/(protected)/admin/actions";
import { MARGEN_ESTADOS } from "@/lib/catalogos";

export type EtapaRow = {
  clave: string;
  nombre: string;
  tagline: string | null;
  descripcion: string | null;
  orden: number;
  modelo: string;
  es_comprador: boolean;
  descuento: number | null;
  precio_base_m2: number | null;
  precio_entrada_m2: number | null;
  enganche_pct: number | null;
  intermedios_pct: number | null;
  intermedios_meses: number | null;
  contra_pct: number | null;
  fases_enganche: unknown;
  gracia_meses: unknown;
  margen: number | null;
  margen_estado: string;
  activa: boolean;
};

const INIT: AdminResult = { ok: false, msg: "" };
const v = (x: number | null | undefined) => (x == null ? "" : String(x));

export function EtapaForm({ etapa }: { etapa: EtapaRow }) {
  const [state, action, pending] = useActionState(guardarEtapa, INIT);

  return (
    <form action={action} className="panel" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 22, margin: 0 }}>
          {etapa.nombre} <span className="mono" style={{ fontSize: 11, color: "var(--warm)" }}>· {etapa.clave} · {etapa.modelo}{etapa.es_comprador ? "" : " · no-comprador"}</span>
        </h3>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, textTransform: "none", letterSpacing: 0, color: "var(--ink)" }}>
          <input type="checkbox" name="activa" defaultChecked={etapa.activa} style={{ width: "auto" }} /> Activa
        </label>
      </div>
      <input type="hidden" name="clave" value={etapa.clave} />

      <div className="grid2">
        <div className="field"><label>Nombre</label><input name="nombre" defaultValue={etapa.nombre} /></div>
        <div className="field"><label>Orden</label><input name="orden" type="number" defaultValue={etapa.orden} /></div>
      </div>
      <div className="field"><label>Tagline</label><input name="tagline" defaultValue={etapa.tagline ?? ""} /></div>
      <div className="field"><label>Descripción</label><textarea name="descripcion" rows={2} defaultValue={etapa.descripcion ?? ""} /></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <div className="field"><label>Descuento (0–1)</label><input name="descuento" type="number" step="0.001" defaultValue={v(etapa.descuento)} /></div>
        <div className="field"><label>Precio base m²</label><input name="precio_base_m2" type="number" step="0.01" defaultValue={v(etapa.precio_base_m2)} /></div>
        <div className="field"><label>Precio entrada m²</label><input name="precio_entrada_m2" type="number" step="0.01" defaultValue={v(etapa.precio_entrada_m2)} /></div>
        <div className="field"><label>Enganche (0–1)</label><input name="enganche_pct" type="number" step="0.001" defaultValue={v(etapa.enganche_pct)} /></div>
        <div className="field"><label>Intermedios (0–1)</label><input name="intermedios_pct" type="number" step="0.001" defaultValue={v(etapa.intermedios_pct)} /></div>
        <div className="field"><label>Intermedios meses</label><input name="intermedios_meses" type="number" defaultValue={v(etapa.intermedios_meses)} /></div>
        <div className="field"><label>Contra entrega (0–1)</label><input name="contra_pct" type="number" step="0.001" defaultValue={v(etapa.contra_pct)} /></div>
        <div className="field"><label>Margen (utilidad/inv, ej. 1.06)</label><input name="margen" type="number" step="0.001" defaultValue={v(etapa.margen)} /></div>
        <div className="field">
          <label>Estado del margen</label>
          <select name="margen_estado" defaultValue={etapa.margen_estado}>
            {Object.entries(MARGEN_ESTADOS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid2">
        <div className="field">
          <label>Fases enganche (JSON)</label>
          <textarea name="fases_enganche" rows={4} className="mono" style={{ fontSize: 11 }} defaultValue={JSON.stringify(etapa.fases_enganche ?? [], null, 0)} />
        </div>
        <div className="field">
          <label>Gracia meses (JSON)</label>
          <textarea name="gracia_meses" rows={4} className="mono" style={{ fontSize: 11 }} defaultValue={JSON.stringify(etapa.gracia_meses ?? [], null, 0)} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn sm" disabled={pending}>{pending ? "Guardando…" : "Guardar etapa"}</button>
        {state.msg && <span className="mono" style={{ fontSize: 11, color: state.ok ? "var(--salvia-dark, #63735A)" : "#a1483c" }}>{state.msg}</span>}
      </div>
    </form>
  );
}
