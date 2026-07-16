"use client";

import { useEffect, useState } from "react";
import type { ProposalModel, AnexoModel } from "@/lib/catalogos";
import { Documento } from "./Documento";
import { Anexo } from "./Anexo";

export function ReDescarga({
  propuesta, anexo, cliente, fecha, folio,
}: {
  propuesta: ProposalModel | null;
  anexo: AnexoModel | null;
  cliente: string;
  fecha: string;
  folio: number;
}) {
  const [printTarget, setPrintTarget] = useState<"propuesta" | "anexo" | null>(null);
  // v10: modo de impresión explícito (html[data-print]) + título por documento
  // (nombre de archivo sugerido al guardar el PDF).
  useEffect(() => {
    if (!printTarget) return;
    const prev = document.title;
    const doc = printTarget === "anexo" ? "Anexo" : "Propuesta";
    const partes = [doc, propuesta?.etapa.nombre, propuesta?.unidad.etiqueta].filter(Boolean);
    document.title = `The Cliff Club · ${partes.join(" · ")}`;
    document.documentElement.dataset.print = printTarget;
    window.print();
    delete document.documentElement.dataset.print;
    document.title = prev;
    setPrintTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printTarget]);

  const cli = cliente || "__________________";
  const fec = fecha || "__ / __ / ____";

  if (!propuesta) {
    return <p className="lead">Esta cotización no tiene un documento congelado (se guardó antes de esta versión). Vuelve a generarla desde el Cotizador.</p>;
  }

  return (
    <>
      <div className="genbar">
        <button className="btn sm" onClick={() => setPrintTarget("propuesta")}>Descargar Propuesta (PDF)</button>
        {anexo && <button className="btn ghost sm" onClick={() => setPrintTarget("anexo")}>Descargar Anexo (PDF)</button>}
        <span className="mono" style={{ fontSize: 11, color: "var(--warm)" }}>Cifras congeladas del snapshot · #{folio}</span>
      </div>

      <div id="doc-propuesta" className="docwrap">
        <Documento model={propuesta} cliente={cli} fecha={fec} />
      </div>
      {anexo && (
        <div id="doc-anexo" className="docwrap" style={{ marginTop: 20 }}>
          <Anexo model={anexo} cliente={cli} fecha={fec} />
        </div>
      )}
    </>
  );
}
