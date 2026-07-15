"use client";

import { useActionState } from "react";
import { guardarSupuestos, type AdminResult } from "@/app/(protected)/admin/actions";

export type SupuestosRow = {
  plusvalia_anual: number; plazo_anios: number; adr: number; ocupacion: number;
  comision: number; fee_renta: number; mantenimiento: number;
};

const INIT: AdminResult = { ok: false, msg: "" };
const v = (x: number | null | undefined) => (x == null ? "" : String(x));

export function SupuestosForm({ c }: { c: SupuestosRow }) {
  const [state, action, pending] = useActionState(guardarSupuestos, INIT);
  return (
    <form action={action} className="panel" style={{ marginBottom: 24 }}>
      <p className="note" style={{ marginBottom: 12 }}>Defaults verificados: 0.08 · 5 · 450 · 0.45 · 0.06 · 0.20 · 0.10. Los porcentajes van como fracción (0.08 = 8%).</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <div className="field"><label>Plusvalía anual (0–1)</label><input name="plusvalia_anual" type="number" step="0.001" defaultValue={v(c.plusvalia_anual)} /></div>
        <div className="field"><label>Plazo (años)</label><input name="plazo_anios" type="number" defaultValue={v(c.plazo_anios)} /></div>
        <div className="field"><label>ADR (USD)</label><input name="adr" type="number" step="0.01" defaultValue={v(c.adr)} /></div>
        <div className="field"><label>Ocupación (0–1)</label><input name="ocupacion" type="number" step="0.001" defaultValue={v(c.ocupacion)} /></div>
        <div className="field"><label>Comisión (0–1)</label><input name="comision" type="number" step="0.001" defaultValue={v(c.comision)} /></div>
        <div className="field"><label>Fee renta (0–1)</label><input name="fee_renta" type="number" step="0.001" defaultValue={v(c.fee_renta)} /></div>
        <div className="field"><label>Mantenimiento (0–1)</label><input name="mantenimiento" type="number" step="0.001" defaultValue={v(c.mantenimiento)} /></div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn sm" disabled={pending}>{pending ? "Guardando…" : "Guardar supuestos"}</button>
        {state.msg && <span className="mono" style={{ fontSize: 11, color: state.ok ? "#63735A" : "#a1483c" }}>{state.msg}</span>}
      </div>
    </form>
  );
}
