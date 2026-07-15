"use client";

import { useEffect, useState } from "react";
import type { EtapaOption, UnidadOption, CeldaTablero, ProposalModel, AnexoModel, UnidadInput, PlanOverride, SupuestosAnexo, FaseInput } from "@/lib/catalogos";
import { computeProposal, computeAnexo, guardarCotizacion } from "@/app/(protected)/cotizador/actions";
import { Documento } from "./Documento";
import { Anexo } from "./Anexo";

const CLIENTE_PH = "__________________";
const FECHA_PH = "__ / __ / ____";
const LIBRE = "__LIBRE__";
const REC_OPTS = ["1 recámara", "2 recámaras", "3 recámaras", "4 recámaras"];

function formatFecha(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const d = s.replace(/\D/g, "");
  if (d.length === 8) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  return s;
}
function hoy(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function Cotizador({
  etapas, unidades, inventario, supuestosDefault, prefill,
}: {
  etapas: EtapaOption[];
  unidades: UnidadOption[];
  inventario: CeldaTablero[];
  supuestosDefault: SupuestosAnexo;
  prefill?: { cliente?: string; correo?: string; telefono?: string; origen?: string };
}) {
  const [etapaClave, setEtapaClave] = useState(etapas[0]?.clave ?? "");
  const [unidadSel, setUnidadSel] = useState<string>(unidades[0]?.clave ?? LIBRE);
  const [m2Manual, setM2Manual] = useState("");
  const [recManual, setRecManual] = useState(REC_OPTS[0]);
  const [cliente, setCliente] = useState(prefill?.cliente ?? "");
  const [correo, setCorreo] = useState(prefill?.correo ?? "");
  const [telefono, setTelefono] = useState(prefill?.telefono ?? "");
  const [origen, setOrigen] = useState(prefill?.origen ?? "");
  const [fecha, setFecha] = useState("");

  // Plan de pagos
  const [planMode, setPlanMode] = useState<"base" | "custom">("base");
  const [eng, setEng] = useState("35");
  const [plazo, setPlazo] = useState("24");
  const [contra, setContra] = useState("10");
  const [fasesAdv, setFasesAdv] = useState<FaseInput[] | null>(null);

  // Supuestos del Anexo
  const [supMode, setSupMode] = useState<"default" | "custom">("default");
  const [sup, setSup] = useState({
    plusvalia: String(Math.round(supuestosDefault.plusvaliaAnual * 100)),
    plazoAnios: String(supuestosDefault.plazoAnios),
    adr: String(supuestosDefault.adr),
    ocupacion: String(Math.round(supuestosDefault.ocupacion * 100)),
    comision: String(Math.round(supuestosDefault.comision * 100)),
    fee: String(Math.round(supuestosDefault.feeRenta * 100)),
    mante: String(Math.round(supuestosDefault.mantenimiento * 100)),
  });

  const [model, setModel] = useState<ProposalModel | null>(null);
  const [anexo, setAnexo] = useState<AnexoModel | null>(null);
  const [showDoc, setShowDoc] = useState(false);
  const [showAnexo, setShowAnexo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [printTarget, setPrintTarget] = useState<"propuesta" | "anexo" | null>(null);

  const esLibre = unidadSel === LIBRE;
  const esFR = etapaClave === "FR";

  // Defaults: última etapa usada + fecha de hoy.
  useEffect(() => {
    const last = typeof window !== "undefined" ? window.localStorage.getItem("tcc_last_etapa") : null;
    if (last && etapas.some((e) => e.clave === last)) setEtapaClave(last);
    if (!fecha) setFecha(hoy());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("tcc_last_etapa", etapaClave);
  }, [etapaClave]);

  const engN = Number(eng), contraN = Number(contra), plazoN = Math.round(Number(plazo));
  const interN = 100 - engN - contraN;
  const planInvalido = planMode === "custom" && (!Number.isFinite(engN) || !Number.isFinite(contraN) || !Number.isFinite(plazoN) || engN < 0 || contraN < 0 || engN + contraN > 100 || plazoN < 1);

  function planOverride(): PlanOverride | undefined {
    if (planMode !== "custom" || planInvalido) return undefined;
    const fases = fasesAdv && fasesAdv.length ? fasesAdv.map((f) => ({ c: f.c, pct: Number(f.pct) / 100, mes: Math.round(Number(f.mes)) })) : undefined;
    return { enganchePct: engN / 100, contraPct: contraN / 100, meses: plazoN, fases };
  }
  function supuestosOverride(): SupuestosAnexo | undefined {
    if (supMode !== "custom") return undefined;
    return {
      plusvaliaAnual: Number(sup.plusvalia) / 100, plazoAnios: Math.round(Number(sup.plazoAnios)),
      adr: Number(sup.adr), ocupacion: Number(sup.ocupacion) / 100, comision: Number(sup.comision) / 100,
      feeRenta: Number(sup.fee) / 100, mantenimiento: Number(sup.mante) / 100,
    };
  }
  function unidadInput(): UnidadInput | null {
    if (esLibre) {
      const v = Number(m2Manual);
      if (!Number.isFinite(v) || v <= 0) return null;
      return { tipo: "libre", m2: v, recamaras: recManual };
    }
    return { tipo: "catalogo", clave: unidadSel };
  }

  // Resumen en vivo (recalcula con el plan efectivo).
  useEffect(() => {
    const ui = unidadInput();
    if (!ui || planInvalido) { setModel(null); return; }
    let alive = true;
    setBusy(true);
    computeProposal(etapaClave, ui, planOverride())
      .then((m) => { if (alive) setModel(m); })
      .catch(() => { if (alive) setModel(null); })
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapaClave, unidadSel, m2Manual, recManual, planMode, eng, plazo, contra, fasesAdv]);

  useEffect(() => { if (printTarget) { window.print(); setPrintTarget(null); } }, [printTarget]);

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(""), 3800);
  }

  function generarPropuesta() {
    if (!model) { showToast("Elige una unidad y un plan válido para generar."); return; }
    setShowDoc(true);
    setTimeout(() => document.getElementById("doc-propuesta")?.scrollIntoView({ behavior: "smooth" }), 60);
  }
  async function generarAnexo() {
    const ui = unidadInput();
    if (!ui) { showToast("Elige una unidad para generar el Anexo."); return; }
    setBusy(true);
    try {
      setAnexo(await computeAnexo(etapaClave, ui, formatFecha(fecha) || FECHA_PH, supuestosOverride()));
      setShowAnexo(true);
      setTimeout(() => document.getElementById("doc-anexo")?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch { showToast("No se pudo generar el Anexo."); } finally { setBusy(false); }
  }
  async function guardar() {
    const ui = unidadInput();
    if (!ui) { showToast("Elige una unidad antes de guardar."); return; }
    setSaving(true);
    try {
      const res = await guardarCotizacion(etapaClave, ui, { cliente, correo, telefono, origen }, formatFecha(fecha), planOverride(), supuestosOverride());
      showToast(res.ok ? `Guardado ✓ · Cotización #${res.folio} para ${cliente.trim()}` : res.error || "No se pudo guardar.");
    } finally { setSaving(false); }
  }
  function compartirWhatsApp() {
    const tel = telefono.replace(/\D/g, "");
    const asesor = model?.asesor.nombre ?? "";
    const msg = `Hola ${cliente.trim() || ""}, te comparto tu propuesta de inversión de The Cliff Club Residences${model ? ` — ${model.etapa.nombre}, ${model.unidad.etiqueta}, valor ${model.valorTotal}` : ""}. Quedo a tus órdenes para cualquier duda.${asesor ? `\n\n${asesor}` : ""}`;
    const url = tel ? `https://wa.me/${tel}?text=${encodeURIComponent(msg)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const cli = cliente.trim() || CLIENTE_PH;
  const fec = formatFecha(fecha) || FECHA_PH;

  function selectCell(c: CeldaTablero) {
    if (c.disponibilidad !== "disponible") return;
    setUnidadSel(c.clave);
  }
  const pisos = [...new Set(inventario.map((c) => c.piso))].sort((a, b) => b - a);

  return (
    <>
      <h1 className="view">Cotizador</h1>
      <p className="lead">Elige etapa y unidad, ajusta el plan si hace falta y genera la propuesta de inversión y su Anexo.</p>

      {esFR && <div className="fr-banner">Founders Reserve · <b>margen en proyección</b> — sujeto a confirmación de Gerardo / Adrián.</div>}

      <div className="cot-controls">
        <div className="field">
          <label htmlFor="c-etapa">Etapa</label>
          <select id="c-etapa" value={etapaClave} onChange={(e) => setEtapaClave(e.target.value)}>
            {etapas.map((o) => <option key={o.clave} value={o.clave}>{o.nombre}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="c-unidad">Unidad disponible</label>
          <select id="c-unidad" value={unidadSel} onChange={(e) => setUnidadSel(e.target.value)}>
            {unidades.map((o) => <option key={o.clave} value={o.clave}>{o.etiqueta} · {o.recamaras} · {o.modelo}</option>)}
            <option value={LIBRE}>Unidad libre (m² manual)</option>
          </select>
        </div>
        {esLibre && (
          <>
            <div className="field"><label htmlFor="c-m2">m² totales</label><input id="c-m2" type="number" min="1" step="0.01" placeholder="Ej. 194.13" value={m2Manual} onChange={(e) => setM2Manual(e.target.value)} style={{ minWidth: 110 }} /></div>
            <div className="field"><label htmlFor="c-rec">Recámaras</label><select id="c-rec" value={recManual} onChange={(e) => setRecManual(e.target.value)}>{REC_OPTS.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
          </>
        )}
        <div className="field"><label htmlFor="c-cliente">Nombre del cliente</label><input id="c-cliente" placeholder="Nombre y apellido" value={cliente} onChange={(e) => setCliente(e.target.value)} /></div>
        <div className="field"><label htmlFor="c-correo">Correo</label><input id="c-correo" type="email" placeholder="correo@dominio.com" value={correo} onChange={(e) => setCorreo(e.target.value)} /></div>
        <div className="field"><label htmlFor="c-tel">Teléfono</label><input id="c-tel" placeholder="+52 …" value={telefono} onChange={(e) => setTelefono(e.target.value)} /></div>
        <div className="field"><label htmlFor="c-origen">Origen</label><input id="c-origen" placeholder="Referido, campaña…" value={origen} onChange={(e) => setOrigen(e.target.value)} /></div>
        <div className="field"><label htmlFor="c-fecha">Fecha</label><input id="c-fecha" placeholder="dd / mm / aaaa" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
      </div>

      {/* Tablero-selector de unidad (D1) */}
      {!esLibre && (
        <details className="fold">
          <summary>Elegir desde el tablero de disponibilidad</summary>
          <div className="foldbody">
            <div className="bsel">
              {pisos.map((p) => (
                <div className="brow" key={p}>
                  {inventario.filter((c) => c.piso === p).sort((a, b) => a.clave.localeCompare(b.clave)).map((c) => (
                    <div key={c.clave} onClick={() => selectCell(c)}
                      className={`bcell ${c.disponibilidad}${c.clave === unidadSel ? " sel" : ""}${c.disponibilidad === "disponible" ? " can" : ""}`}>
                      {c.etiqueta.replace("B ", "B")}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="note" style={{ marginTop: 8 }}>Clic en una celda disponible para seleccionarla. Apartadas/vendidas no seleccionables.</p>
          </div>
        </details>
      )}

      {/* Plan de pagos (B) */}
      <details className="fold">
        <summary>Plan de pagos · {planMode === "base" ? "Base" : "Personalizado"}</summary>
        <div className="foldbody">
          <div className="segmented" style={{ marginBottom: 14 }}>
            <button className={planMode === "base" ? "on" : ""} onClick={() => setPlanMode("base")}>Base</button>
            <button className={planMode === "custom" ? "on" : ""} onClick={() => setPlanMode("custom")}>Personalizado</button>
          </div>
          {planMode === "custom" && (
            <>
              <div className="plan-grid">
                <div className="field"><label>Enganche %</label><input type="number" value={eng} onChange={(e) => setEng(e.target.value)} /></div>
                <div className="field"><label>Plazo (mensualidades)</label><input type="number" value={plazo} onChange={(e) => setPlazo(e.target.value)} /></div>
                <div className="field"><label>Contra entrega %</label><input type="number" value={contra} onChange={(e) => setContra(e.target.value)} /></div>
                <div className="field"><label>Intermedios % (auto)</label><input value={Number.isFinite(interN) ? `${interN}%` : "—"} readOnly style={{ background: "#EDEBE4" }} /></div>
              </div>
              {planInvalido && <p className="plan-warn">Revisa los valores: enganche + contra no puede pasar de 100% y el plazo debe ser ≥ 1.</p>}
              {model && !planInvalido && <p className="note" style={{ marginTop: 8 }}>Mensualidad: <b>{model.mensual}</b>/mes · {model.intermediosPct} en {plazoN} meses.</p>}
              <details className="fold" style={{ marginTop: 12 }}>
                <summary>Avanzado · desglose del enganche por fases</summary>
                <div className="foldbody">
                  <p className="note" style={{ marginBottom: 8 }}>Suma de fases = {eng}% (enganche). Concepto · % · mes.</p>
                  {(fasesAdv ?? [{ c: "Enganche", pct: engN, mes: 0 }]).map((f, i) => (
                    <div key={i} className="plan-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr auto", marginBottom: 8 }}>
                      <input value={f.c} onChange={(e) => { const a = [...(fasesAdv ?? [{ c: "Enganche", pct: engN, mes: 0 }])]; a[i] = { ...a[i], c: e.target.value }; setFasesAdv(a); }} />
                      <input type="number" value={f.pct} onChange={(e) => { const a = [...(fasesAdv ?? [{ c: "Enganche", pct: engN, mes: 0 }])]; a[i] = { ...a[i], pct: Number(e.target.value) }; setFasesAdv(a); }} />
                      <input type="number" value={f.mes} onChange={(e) => { const a = [...(fasesAdv ?? [{ c: "Enganche", pct: engN, mes: 0 }])]; a[i] = { ...a[i], mes: Number(e.target.value) }; setFasesAdv(a); }} />
                      <button className="btn ghost sm" onClick={() => { const a = [...(fasesAdv ?? [])]; a.splice(i, 1); setFasesAdv(a.length ? a : null); }}>×</button>
                    </div>
                  ))}
                  <button className="btn ghost sm" onClick={() => setFasesAdv([...(fasesAdv ?? [{ c: "Enganche", pct: engN, mes: 0 }]), { c: "Fase", pct: 0, mes: 1 }])}>+ Fase</button>
                </div>
              </details>
            </>
          )}
          {planMode === "custom" && <button className="btn ghost sm" style={{ marginTop: 12 }} onClick={() => { setPlanMode("base"); setFasesAdv(null); }}>Volver a Base</button>}
        </div>
      </details>

      {/* Supuestos del Anexo (C) */}
      <details className="fold">
        <summary>Supuestos del Anexo · {supMode === "default" ? "Globales" : "Ajustados"}</summary>
        <div className="foldbody">
          <div className="segmented" style={{ marginBottom: 14 }}>
            <button className={supMode === "default" ? "on" : ""} onClick={() => setSupMode("default")}>Globales</button>
            <button className={supMode === "custom" ? "on" : ""} onClick={() => setSupMode("custom")}>Ajustar para esta oferta</button>
          </div>
          {supMode === "custom" && (
            <div className="plan-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              <div className="field"><label>Plusvalía anual %</label><input type="number" value={sup.plusvalia} onChange={(e) => setSup({ ...sup, plusvalia: e.target.value })} /></div>
              <div className="field"><label>Plazo (años)</label><input type="number" value={sup.plazoAnios} onChange={(e) => setSup({ ...sup, plazoAnios: e.target.value })} /></div>
              <div className="field"><label>ADR (USD)</label><input type="number" value={sup.adr} onChange={(e) => setSup({ ...sup, adr: e.target.value })} /></div>
              <div className="field"><label>Ocupación %</label><input type="number" value={sup.ocupacion} onChange={(e) => setSup({ ...sup, ocupacion: e.target.value })} /></div>
              <div className="field"><label>Comisión %</label><input type="number" value={sup.comision} onChange={(e) => setSup({ ...sup, comision: e.target.value })} /></div>
              <div className="field"><label>Fee renta %</label><input type="number" value={sup.fee} onChange={(e) => setSup({ ...sup, fee: e.target.value })} /></div>
              <div className="field"><label>Mantenimiento %</label><input type="number" value={sup.mante} onChange={(e) => setSup({ ...sup, mante: e.target.value })} /></div>
            </div>
          )}
          {supMode === "default" && <p className="note">Usa los supuestos globales (editables por admin). Ajusta aquí solo para una oferta puntual.</p>}
        </div>
      </details>

      <div className="resumen">
        {model ? (
          <>
            <div className="rz"><span className="rzl">Valor total</span><span className="rzv big">{model.valorTotal}</span></div>
            <div className="rz"><span className="rzl">Precio m² final · −{model.etapa.dcto}</span><span className="rzv">{model.precioPreferente}</span></div>
            <div className="rz"><span className="rzl">Enganche · {model.enganchePct}</span><span className="rzv">{model.engancheTotal}</span></div>
            <div className="rz"><span className="rzl">Intermedios · {model.intermediosPct}</span><span className="rzv">{model.mensual}/mes</span></div>
            <div className="rz"><span className="rzl">Contra entrega · {model.contraPct}</span><span className="rzv">{model.contraMonto}</span></div>
            <div className="rz"><span className="rzl">Margen {model.etapa.margenEstado === "proyeccion" ? "(proyección)" : ""}</span><span className="rzv">{model.etapa.margen}</span></div>
          </>
        ) : (
          <div className="rz"><span className="rzl">{planInvalido ? "Corrige el plan de pagos para ver el resumen." : "Elige una unidad disponible o captura los m² de una unidad libre."}</span></div>
        )}
      </div>

      <div className="genbar">
        <button className="btn" onClick={generarPropuesta} disabled={busy || !model}>Generar propuesta</button>
        <button className="btn ghost" onClick={generarAnexo} disabled={busy || !model}>Generar Anexo</button>
        {showDoc && <button className="btn ghost sm" onClick={() => setPrintTarget("propuesta")}>Descargar PDF</button>}
        {showAnexo && <button className="btn ghost sm" onClick={() => setPrintTarget("anexo")}>Descargar Anexo PDF</button>}
        <button className="btn ghost sm" onClick={compartirWhatsApp} disabled={!model}>Compartir por WhatsApp</button>
        <button className="btn sm" onClick={guardar} disabled={saving || !model}>{saving ? "Guardando…" : "Guardar en CRM"}</button>
      </div>

      {showDoc && model && (
        <div id="doc-propuesta" className={`docwrap${printTarget === "propuesta" ? " printdoc" : ""}`}>
          <Documento model={model} cliente={cli} fecha={fec} />
        </div>
      )}
      {showAnexo && anexo && (
        <div id="doc-anexo" className={`docwrap${printTarget === "anexo" ? " printdoc" : ""}`} style={{ marginTop: 20 }}>
          <Anexo model={anexo} cliente={cli} fecha={fec} />
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
