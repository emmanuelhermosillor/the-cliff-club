"use client";

import { useEffect, useState } from "react";
import type { EtapaOption, UnidadOption, ProposalModel, AnexoModel, UnidadInput } from "@/lib/catalogos";
import { computeProposal, computeAnexo, guardarCotizacion } from "@/app/(protected)/cotizador/actions";
import { Documento } from "./Documento";
import { Anexo } from "./Anexo";

const CLIENTE_PH = "__________________";
const FECHA_PH = "__ / __ / ____";
const LIBRE = "__LIBRE__";
const REC_OPTS = ["1 recámara", "2 recámaras", "3 recámaras", "4 recámaras"];

// Normaliza la fecha a DD/MM/AAAA (acepta "15072026", "15/07/2026", "15 07 2026").
function formatFecha(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const d = s.replace(/\D/g, "");
  if (d.length === 8) return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  return s;
}

export function Cotizador({ etapas, unidades }: { etapas: EtapaOption[]; unidades: UnidadOption[] }) {
  const [etapaClave, setEtapaClave] = useState(etapas[0]?.clave ?? "");
  const [unidadSel, setUnidadSel] = useState<string>(unidades[0]?.clave ?? LIBRE);
  const [m2Manual, setM2Manual] = useState("");
  const [recManual, setRecManual] = useState(REC_OPTS[0]);
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");

  const [model, setModel] = useState<ProposalModel | null>(null);
  const [anexo, setAnexo] = useState<AnexoModel | null>(null);
  const [showDoc, setShowDoc] = useState(false);
  const [showAnexo, setShowAnexo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [printTarget, setPrintTarget] = useState<"propuesta" | "anexo" | null>(null);

  const esLibre = unidadSel === LIBRE;

  function unidadInput(): UnidadInput | null {
    if (esLibre) {
      const v = Number(m2Manual);
      if (!Number.isFinite(v) || v <= 0) return null;
      return { tipo: "libre", m2: v, recamaras: recManual };
    }
    return { tipo: "catalogo", clave: unidadSel };
  }

  // Resumen en vivo: recalcula el modelo al cambiar la selección.
  useEffect(() => {
    const ui = unidadInput();
    if (!ui) { setModel(null); return; }
    let alive = true;
    setBusy(true);
    computeProposal(etapaClave, ui)
      .then((m) => { if (alive) setModel(m); })
      .catch(() => { if (alive) setModel(null); })
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapaClave, unidadSel, m2Manual, recManual]);

  useEffect(() => {
    if (printTarget) { window.print(); setPrintTarget(null); }
  }, [printTarget]);

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(""), 3800);
  }

  function generarPropuesta() {
    if (!model) { showToast("Elige una unidad (o m² de unidad libre) para generar."); return; }
    setShowDoc(true);
    setTimeout(() => document.getElementById("doc-propuesta")?.scrollIntoView({ behavior: "smooth" }), 60);
  }

  async function generarAnexo() {
    const ui = unidadInput();
    if (!ui) { showToast("Elige una unidad para generar el Anexo."); return; }
    setBusy(true);
    try {
      const a = await computeAnexo(etapaClave, ui, formatFecha(fecha) || FECHA_PH);
      setAnexo(a);
      setShowAnexo(true);
      setTimeout(() => document.getElementById("doc-anexo")?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch {
      showToast("No se pudo generar el Anexo.");
    } finally {
      setBusy(false);
    }
  }

  async function guardar() {
    const ui = unidadInput();
    if (!ui) { showToast("Elige una unidad antes de guardar."); return; }
    setSaving(true);
    try {
      const res = await guardarCotizacion(etapaClave, ui, cliente, formatFecha(fecha));
      if (res.ok) showToast(`Cotización #${res.folio} guardada en el CRM para ${cliente.trim()}.`);
      else showToast(res.error || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  const cli = cliente.trim() || CLIENTE_PH;
  const fecFmt = formatFecha(fecha);
  const fec = fecFmt || FECHA_PH;

  return (
    <>
      <h1 className="view">Cotizador</h1>
      <p className="lead">Elige etapa y unidad disponible, revisa el resumen y genera la propuesta de inversión y su Anexo.</p>

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
            <div className="field">
              <label htmlFor="c-m2">m² totales</label>
              <input id="c-m2" type="number" min="1" step="0.01" placeholder="Ej. 194.13" value={m2Manual} onChange={(e) => setM2Manual(e.target.value)} style={{ minWidth: 110 }} />
            </div>
            <div className="field">
              <label htmlFor="c-rec">Recámaras</label>
              <select id="c-rec" value={recManual} onChange={(e) => setRecManual(e.target.value)}>
                {REC_OPTS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="field">
          <label htmlFor="c-cliente">Nombre del cliente</label>
          <input id="c-cliente" placeholder="Nombre y apellido" value={cliente} onChange={(e) => setCliente(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="c-fecha">Fecha</label>
          <input id="c-fecha" placeholder="dd / mm / aaaa" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      {/* resumen en vivo */}
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
          <div className="rz"><span className="rzl">Elige una unidad disponible o captura los m² de una unidad libre.</span></div>
        )}
      </div>

      <div className="genbar">
        <button className="btn" onClick={generarPropuesta} disabled={busy || !model}>Generar propuesta</button>
        <button className="btn ghost" onClick={generarAnexo} disabled={busy || !model}>Generar Anexo</button>
        {showDoc && <button className="btn ghost sm" onClick={() => setPrintTarget("propuesta")}>Descargar PDF</button>}
        {showAnexo && <button className="btn ghost sm" onClick={() => setPrintTarget("anexo")}>Descargar Anexo PDF</button>}
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
