"use client";

import { useState } from "react";
import { ETAPAS_SELECT, TIPOS_SELECT, type EtapaKey, type TipoKey, type ProposalModel } from "@/lib/catalogos";
import { computeProposal, guardarCotizacion } from "@/app/(protected)/cotizador/actions";
import { Documento } from "./Documento";

const CLIENTE_PH = "__________________";
const FECHA_PH = "__ / __ / ____";

export function Cotizador({ initialModel }: { initialModel: ProposalModel }) {
  const [eKey, setEKey] = useState<EtapaKey>(initialModel.eKey);
  const [tKey, setTKey] = useState<TipoKey>(initialModel.tKey);
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");
  const [model, setModel] = useState<ProposalModel>(initialModel);
  const [computing, setComputing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  async function reload(nextE: EtapaKey, nextT: TipoKey) {
    setComputing(true);
    try {
      setModel(await computeProposal(nextE, nextT));
    } finally {
      setComputing(false);
    }
  }

  function onEtapa(v: EtapaKey) {
    setEKey(v);
    reload(v, tKey);
  }
  function onTipo(v: TipoKey) {
    setTKey(v);
    reload(eKey, v);
  }

  function showToast(msg: string) {
    setToast(msg);
    window.clearTimeout((showToast as unknown as { _t?: number })._t);
    (showToast as unknown as { _t?: number })._t = window.setTimeout(() => setToast(""), 3600);
  }

  async function guardar() {
    setSaving(true);
    try {
      const res = await guardarCotizacion(eKey, tKey, cliente, fecha);
      if (res.ok) showToast(`Cotización #${res.folio} guardada en el CRM para ${cliente.trim()}.`);
      else showToast(res.error || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="view">Cotizador</h1>
      <p className="lead">Elige etapa y tipología, escribe el nombre del cliente y descarga el PDF. Guarda la cotización para llevarla en el CRM.</p>

      <div className="cot-controls">
        <div className="field">
          <label htmlFor="c-etapa">Etapa</label>
          <select id="c-etapa" value={eKey} onChange={(e) => onEtapa(e.target.value as EtapaKey)}>
            {ETAPAS_SELECT.map((o) => (
              <option key={o.key} value={o.key} disabled={o.disabled}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="c-tipo">Tipología</label>
          <select id="c-tipo" value={tKey} onChange={(e) => onTipo(e.target.value as TipoKey)}>
            {TIPOS_SELECT.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
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
