"use client";

import { useActionState } from "react";
import { guardarUnidad, type AdminResult } from "@/app/(protected)/admin/actions";

export type UnidadRow = {
  clave: string;
  etiqueta: string | null;
  recamaras: string | null;
  banos: string | null;
  m2_interior: number | null;
  m2_terraza: number | null;
  m2_bodega: number | null;
  m2_total: number | null;
  sqft_total: number | null;
  orden: number;
  activa: boolean;
};

const INIT: AdminResult = { ok: false, msg: "" };
const v = (x: number | null | undefined) => (x == null ? "" : String(x));

export function UnidadForm({ unidad }: { unidad: UnidadRow | null }) {
  const [state, action, pending] = useActionState(guardarUnidad, INIT);
  const nueva = unidad == null;

  return (
    <form action={action} className="panel" style={{ marginBottom: 16, borderStyle: nueva ? "dashed" : "solid" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 20, margin: 0 }}>
          {nueva ? "Nueva unidad" : `${unidad!.etiqueta ?? unidad!.clave}`}
        </h3>
        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: 0, textTransform: "none", letterSpacing: 0, color: "var(--ink)" }}>
          <input type="checkbox" name="activa" defaultChecked={unidad?.activa ?? true} style={{ width: "auto" }} /> Activa
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        <div className="field">
          <label>Clave</label>
          {nueva ? <input name="clave" placeholder="Ej. B405" /> : <input name="clave" defaultValue={unidad!.clave} readOnly style={{ background: "var(--nacar, #EDEBE4)" }} />}
        </div>
        <div className="field"><label>Etiqueta</label><input name="etiqueta" defaultValue={unidad?.etiqueta ?? ""} placeholder="B 405" /></div>
        <div className="field"><label>Orden</label><input name="orden" type="number" defaultValue={unidad?.orden ?? 0} /></div>
        <div className="field"><label>Recámaras</label><input name="recamaras" defaultValue={unidad?.recamaras ?? ""} placeholder="2 recámaras" /></div>
        <div className="field"><label>Baños</label><input name="banos" defaultValue={unidad?.banos ?? ""} placeholder="2.5 baños" /></div>
        <div className="field"><label>m² total *</label><input name="m2_total" type="number" step="0.01" defaultValue={v(unidad?.m2_total)} /></div>
        <div className="field"><label>m² interior</label><input name="m2_interior" type="number" step="0.01" defaultValue={v(unidad?.m2_interior)} /></div>
        <div className="field"><label>m² terraza</label><input name="m2_terraza" type="number" step="0.01" defaultValue={v(unidad?.m2_terraza)} /></div>
        <div className="field"><label>m² bodega</label><input name="m2_bodega" type="number" step="0.01" defaultValue={v(unidad?.m2_bodega)} /></div>
        <div className="field"><label>sqft total</label><input name="sqft_total" type="number" step="0.01" defaultValue={v(unidad?.sqft_total)} /></div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn sm" disabled={pending}>{pending ? "Guardando…" : nueva ? "Agregar unidad" : "Guardar unidad"}</button>
        {state.msg && <span className="mono" style={{ fontSize: 11, color: state.ok ? "#63735A" : "#a1483c" }}>{state.msg}</span>}
      </div>
    </form>
  );
}
