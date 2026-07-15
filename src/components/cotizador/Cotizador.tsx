"use client";

import { useState } from "react";
import type { EtapaOption, UnidadOption, ProposalModel, UnidadInput } from "@/lib/catalogos";
import { computeProposal, guardarCotizacion } from "@/app/(protected)/cotizador/actions";
import { Documento } from "./Documento";

const CLIENTE_PH = "__________________";
const FECHA_PH = "__ / __ / ____";
const LIBRE = "__LIBRE__";

const REC_OPTS = ["1 recámara", "2 recámaras", "3 recámaras", "4 recámaras"];

export function Cotizador({
  etapas,
  unidades,
  initialModel,
}: {
  etapas: EtapaOption[];
  unidades: UnidadOption[];
  initialModel: ProposalModel;
}) {
  const [etapaClave, setEtapaClave] = useState(initialModel.etapaClave);
  const [unidadSel, setUnidadSel] = useState<string>(initialModel.unidadClave); // clave o LIBRE
  const [m2Manual, setM2Manual] = useState("");
  const [recManual, setRecManual] = useState(REC_OPTS[0]);
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");
  const [model, setModel] = useState<ProposalModel>(initialModel);
  const [computing, setComputing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const esLibre = unidadSel === LIBRE;

  function unidadInput(sel: string, m2: string, rec: string): UnidadInput | null {
    if (sel === LIBRE) {
      const v = Number(m2);
      if (!Number.isFinite(v) || v <= 0) return null;
      return { tipo: "libre", m2: v, recamaras: rec };
    }
    return { tipo: "catalogo", clave: sel };
  }

  async function reload(nextEtapa: string, sel: string, m2: string, rec: string) {
    const ui = unidadInput(sel, m2, rec);
    if (!ui) return; // libre sin m² válido: no recalcula todavía
    setComputing(true);
    try {
      setModel(await computeProposal(nextEtapa, ui));
    } finally {
      setComputing(false);
    }
  }

  function onEtapa(v: string) {
    setEtapaClave(v);
    reload(v, unidadSel, m2Manual, recManual);
  }
  function onUnidad(v: string) {
    setUnidadSel(v);
    reload(etapaClave, v, m2Manual, recManual);
  }
  function onM2(v: string) {
    setM2Manual(v);
    reload(etapaClave, unidadSel, v, recManual);
  }
  function onRec(v: string) {
    setRecManual(v);
    reload(etapaClave, unidadSel, m2Manual, v);
  }

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(""), 3800);
  }

  async function guardar() {
    const ui = unidadInput(unidadSel, m2Manual, recManual);
    if (!ui) {
      showToast("Escribe los m² de la unidad libre antes de guardar.");
      return;
    }
    setSaving(true);
    try {
      const res = await guardarCotizacion(etapaClave, ui, cliente, fecha);
      if (res.ok) showToast(`Cotización #${res.folio} guardada en el CRM para ${cliente.trim()}.`);
      else showToast(res.error || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="view">Cotizador</h1>
      <p className="lead">Elige etapa y unidad, escribe el nombre del cliente y descarga el PDF. Guarda la cotización para llevarla en el CRM.</p>

      <div className="cot-controls">
        <div className="field">
          <label htmlFor="c-etapa">Etapa</label>
          <select id="c-etapa" value={etapaClave} onChange={(e) => onEtapa(e.target.value)}>
            {etapas.map((o) => (
              <option key={o.clave} value={o.clave}>{o.nombre}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="c-unidad">Unidad</label>
          <select id="c-unidad" value={unidadSel} onChange={(e) => onUnidad(e.target.value)}>
            {unidades.map((o) => (
              <option key={o.clave} value={o.clave}>{o.recamaras ? `${o.recamaras} · ${o.etiqueta}` : o.etiqueta}</option>
            ))}
            <option value={LIBRE}>Unidad libre (m² manual)</option>
          </select>
        </div>
        {esLibre && (
          <>
            <div className="field">
              <label htmlFor="c-m2">m² totales</label>
              <input id="c-m2" type="number" min="1" step="0.01" placeholder="Ej. 150.5" value={m2Manual} onChange={(e) => onM2(e.target.value)} style={{ minWidth: 110 }} />
            </div>
            <div className="field">
              <label htmlFor="c-rec">Recámaras</label>
              <select id="c-rec" value={recManual} onChange={(e) => onRec(e.target.value)}>
                {REC_OPTS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
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
        <button className="btn ghost sm" style={{ color: "#fff", borderColor: "#55524d" }} onClick={() => window.print()}>
          Exportar PDF
        </button>
        <button className="btn sm" onClick={guardar} disabled={saving}>
          {saving ? "Guardando…" : "Guardar en CRM"}
        </button>
      </div>

      <div className="docwrap" style={computing ? { opacity: 0.55, transition: "opacity .15s" } : undefined}>
        <Documento model={model} cliente={cliente.trim() || CLIENTE_PH} fecha={fecha.trim() || FECHA_PH} />
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
