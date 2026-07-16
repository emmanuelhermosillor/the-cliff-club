/* eslint-disable @next/next/no-img-element */
import type { AnexoModel } from "@/lib/catalogos";

function Khead({ children }: { children: React.ReactNode }) {
  return (<><div className="khead">{children}</div><div className="hair" /></>);
}
function Tile({ lbl, val, tone }: { lbl: string; val: string; tone?: "blue" | "tan" | "teal" }) {
  return (
    <div className={`stat ${tone ?? "blue"}`}>
      <div className="lbl">{lbl}</div>
      <div className="val" style={{ fontSize: 22 }}>{val}</div>
    </div>
  );
}

// Pines de comparables: las posiciones reales las confirma Gerardo — NO se muestran
// posiciones inventadas (feedback v8). TODO: colocar pines 1–7 + The Cliff Club al recibirlas.

export function Anexo({ model, cliente, fecha }: { model: AnexoModel; cliente: string; fecha: string }) {
  const M = model;
  return (
    <div className="doc">
      {/* Portada — banda azul + ficha */}
      <section className="page anexo-portada">
        <div className="band">
          <img src="/brand/wordmark_shell.svg" alt="The Cliff Club Residences" />
          <div className="aob">The Art of Being</div>
        </div>
        <div className="apright">
          <div className="ap-field"><div className="l">Desarrollo</div><div className="v">The Cliff Club Residences</div></div>
          <div className="ap-field"><div className="l">Ubicación</div><div className="v">At Quivira · Los Cabos · B.C.S.</div></div>
          <div className="ap-field"><div className="l">Tema</div><div className="v">Anexo · {M.etapaNombre}</div></div>
          <div className="ap-field"><div className="l">Unidad de Negocio</div><div className="v">Comercialización</div></div>
          <div className="ap-field"><div className="l">Fecha</div><div className="v">{fecha}</div></div>
          {M.esProyeccion && <div className="note" style={{ marginTop: 6 }}>Escenario en proyección · sujeto a confirmación de Gerardo / Adrián.</div>}
        </div>
      </section>

      {/* Confidencialidad (verbatim, 3 párrafos) */}
      <section className="page">
        <Khead>Confidencialidad</Khead>
        <p className="lead2">
          Este documento ha sido preparado por The Cliff Club Residences para uso exclusivo del destinatario, utilizando información obtenida de fuentes disponibles a Adria y otras fuentes públicas. Las valoraciones contenidas en este documento implican elementos de juicio y análisis subjetivos. Adria no ha verificado de forma independiente la información contenida en este documento, ni hace declaración o garantía, ya sea expresa o implícita, en cuanto a la exactitud, integridad o fiabilidad de la información contenida en este documento. El destinatario no debe considerarlo como un sustituto del ejercicio de su propio juicio.
        </p>
        <p className="lead2">
          Este documento puede contener declaraciones a futuro. Adria no asume obligación de actualizar estas declaraciones a futuro en función de los acontecimientos o circunstancias que se produzcan con posterioridad a la fecha de este documento. Cualquier información u opinión expresada en este documento está sujeta a cambios sin previo aviso. Cualquier estimación o proyección sobre hechos que puedan ocurrir en el futuro (incluyendo proyecciones de ingresos, gastos, ingresos netos y rendimiento de las acciones, títulos o certificados) se basan en el mejor juicio de Adria a partir de la información proporcionada a través de su cliente y otra información disponible públicamente. No hay garantía de que estas estimaciones o proyecciones se cumplirán. Los resultados reales variarán con respecto a las proyecciones y dichas variaciones pueden ser importantes. Nada de lo contenido en este documento es o deberá ser considerado como una promesa o declaración en cuanto al pasado o al futuro. Ni Adria ni sus afiliados, directores, funcionarios, empleados o agentes asumen responsabilidad alguna relacionada o resultante del uso de todo o parte de este documento.
        </p>
        <p className="lead2">
          Este documento se ha preparado únicamente con fines informativos y no debe interpretarse como una solicitud o una oferta de compra o venta de valores u otros instrumentos financieros. El destinatario de este documento no debe interpretar su contenido como un asesoramiento legal, fiscal, contable o de inversión, ni como una recomendación. Este documento no pretende ser exhaustivo ni contener toda la información que el destinatario podría necesitar. Ninguna inversión, desinversión u otra decisión o acción financiera debe basarse únicamente en la información contenida en este documento. Este documento ha sido preparado de forma confidencial únicamente para el uso y beneficio de su destinatario. Se prohíbe la distribución de este documento a cualquier persona que no sea el destinatario o sus asesores profesionales, quienes deberán mantener la confidencialidad de este material y atenerse a las limitaciones aquí expuestas, bajo la responsabilidad del destinatario.
        </p>
        <div className="dfoot">The Cliff Club Residences · The Art of Being</div>
      </section>

      {/* 01 Competitive Set — mapa de Quivira con pines */}
      <section className="page">
        <Khead>01 · Quivira Competitive Set</Khead>
        <div className="anexo-map" style={{ marginBottom: 14 }}>
          <img src="/renders/masterplan.jpg" alt="Quivira · Competitive Set" />
        </div>
        <p className="note" style={{ margin: "0 0 12px" }}>Ubicaciones de los comparables sobre el mapa: pendientes de confirmación (Gerardo).</p>
        <table className="amort2">
          <thead><tr><th>ID</th><th>Desarrollo</th><th>Descripción</th><th className="r">M² Total</th><th className="r">Pr/M² USD</th><th className="r">Valor</th></tr></thead>
          <tbody>
            {M.comps.map((c) => (
              <tr key={c.id}><td className="n">{c.id}</td><td>{c.desarrollo}</td><td>{c.descripcion}</td><td className="r">{c.m2}</td><td className="r">{c.prM2}</td><td className="r">{c.valor}</td></tr>
            ))}
            <tr style={{ fontWeight: 700 }}><td /><td>Avg</td><td /><td className="r">{M.compsAvg.m2}</td><td className="r">{M.compsAvg.prM2}</td><td className="r">{M.compsAvg.valor}</td></tr>
            <tr style={{ background: "var(--card-blue)" }}><td className="n">{M.sujeto.id}</td><td>{M.sujeto.desarrollo}</td><td>{M.sujeto.descripcion}</td><td className="r">{M.sujeto.m2}</td><td className="r">{M.sujeto.prM2}</td><td className="r">{M.sujeto.valor}</td></tr>
          </tbody>
        </table>
        <div className="dfoot">The Cliff Club Residences · Torre B · {M.etapaNombre}</div>
      </section>

      {/* 02 Valor de entrada + 03 Compra-venta */}
      <section className="page">
        <Khead>02 · Valor de Entrada</Khead>
        <div className="stat-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <Tile lbl="Valor Actual" val={`${M.valorActualM2} / m²`} />
          <Tile lbl={`Descuento ${M.etapaNombre}`} val={M.descuento} />
          <Tile lbl="Valor de Entrada" val={`${M.valorEntradaM2} / m²`} tone="teal" />
          <Tile lbl="Plusvalía anual (conservador)" val={M.plusvaliaAnual} />
          <Tile lbl="Plusvalía a 5 años" val={`${M.plusvalia5M2} / m²`} />
          <Tile lbl="Margen proyectado por venta" val={M.margenVenta} tone="tan" />
        </div>
        <Khead>03 · Utilidad por Compra-Venta</Khead>
        <div className="twocol">
          <div>
            <div className="rowgroup">Valor actual / Descuento</div>
            <div className="kv"><span className="k">Área en m²</span><span className="val">{M.areaM2}</span></div>
            <div className="kv"><span className="k">Valor actual por m²</span><span className="val">{M.valorActualM2}</span></div>
            <div className="kv"><span className="k">Valor actual</span><span className="val">{M.valorActual}</span></div>
            <div className="kv"><span className="k">Descuento</span><span className="val">{M.descuento}</span></div>
            <div className="kv"><span className="k">Valor por m²</span><span className="val">{M.valorEntradaM2}</span></div>
            <div className="kv tot"><span className="k">Valor total</span><span className="val">{M.valorTotal}</span></div>
          </div>
          <div>
            <div className="rowgroup">Plusvalía y venta</div>
            <div className="kv"><span className="k">Plusvalía anual @ mercado</span><span className="val">{M.plusvaliaAnual}</span></div>
            <div className="kv"><span className="k">Valor por m² (5 años)</span><span className="val">{M.valorVentaM2}</span></div>
            <div className="kv"><span className="k">Valor de venta</span><span className="val">{M.valorVenta}</span></div>
            <div className="kv"><span className="k">Comisión de venta {M.comisionPct}</span><span className="val">− {M.comision}</span></div>
            <div className="kv"><span className="k">Venta neta</span><span className="val">{M.ventaNeta}</span></div>
            <div className="kv"><span className="k">Costo</span><span className="val">− {M.costo}</span></div>
            <div className="kv tot"><span className="k">Margen final · {M.margenFinalPct}</span><span className="val">{M.margenFinal}</span></div>
          </div>
        </div>
        <div className="dfoot">The Cliff Club Residences · Torre B · {M.etapaNombre}</div>
      </section>

      {/* 04 Renta + 05 Compuesta */}
      <section className="page">
        <Khead>04 · Utilidad por Renta</Khead>
        <div className="twocol">
          <div>
            <div className="rowgroup">Ingresos y gastos</div>
            <div className="kv"><span className="k">Precio de renta diario (ADR)</span><span className="val">{M.adr}</span></div>
            <div className="kv"><span className="k">Ocupación mensual</span><span className="val">{M.ocupacion}</span></div>
            <div className="kv"><span className="k">Valor de renta mensual</span><span className="val">{M.rentaMensual}</span></div>
            <div className="kv"><span className="k">Fee de renta {M.feePct}</span><span className="val">− {M.fee}</span></div>
            <div className="kv"><span className="k">Mantenimiento {M.mantePct}</span><span className="val">− {M.mante}</span></div>
            <div className="kv tot"><span className="k">Renta neta mensual</span><span className="val">{M.rentaNetaMensual}</span></div>
          </div>
          <div>
            <div className="rowgroup">Ingresos anuales</div>
            <div className="kv"><span className="k">Renta neta · Año 01</span><span className="val">{M.rentaAnio1}</span></div>
            <div className="kv"><span className="k">Renta neta · Año 02*</span><span className="val">{M.rentaAnio2}</span></div>
            <div className="kv tot"><span className="k">Ingreso por renta total</span><span className="val">{M.rentaTotal}</span></div>
            <p className="note" style={{ marginTop: 10 }}>* El segundo año contempla 11 meses de operación; en el mes 12 se considera la venta de la unidad. ADR fijo $450 (por tipología: por definir).</p>
          </div>
        </div>
        <Khead>05 · Utilidad Compuesta</Khead>
        <div className="stat-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <Tile lbl="Utilidad por renta" val={M.utilidadRenta} />
          <Tile lbl="Utilidad por venta" val={M.utilidadVenta} />
          <Tile lbl="Utilidad total" val={M.utilidadTotal} tone="tan" />
        </div>
        <div className="dfoot">The Cliff Club Residences · Torre B · {M.etapaNombre}</div>
      </section>

      {/* 06 Flujo + 07 Indicadores */}
      <section className="page">
        <Khead>06 · Proyección de Flujo</Khead>
        <table className="amort2">
          <thead><tr><th>Concepto</th><th className="r">Total</th>{Array.from({ length: M.flujo[0]?.anios.length ?? 5 }, (_, i) => <th key={i} className="r">Año {i + 1}</th>)}</tr></thead>
          <tbody>
            {M.flujo.map((f, i) => (
              <tr key={i} style={i === M.flujo.length - 1 ? { fontWeight: 700, borderTop: "2px solid var(--ink-blue)" } : undefined}>
                <td>{f.concepto}</td><td className="r">{f.total}</td>
                {f.anios.map((a, j) => <td key={j} className="r">{a}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <Khead>07 · Indicadores</Khead>
        <div className="margen-banner">
          <span className="l">Margen proyectado</span><span className="v">{M.margenProyectado}</span>
        </div>
        <div className="stat-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <Tile lbl="Inversión" val={M.inversion} />
          <Tile lbl="Utilidad proyectada" val={M.utilidadProyectada} />
          <Tile lbl="TIR estimada" val={M.tir} tone="teal" />
        </div>
        <p className="note" style={{ marginTop: 8 }}>{M.tirNota}{M.esProyeccion ? " Escenario en proyección — sujeto a confirmación de Gerardo / Adrián." : ""}</p>
        <div className="dfoot">The Cliff Club Residences · Torre B · {M.etapaNombre}</div>
      </section>

      {/* 08 Conclusión */}
      <section className="page">
        <Khead>08 · Conclusión de la oportunidad</Khead>
        <div className="twocol" style={{ gap: 20 }}>
          <div className="acard blue">
            <div className="lbl">01</div>
            <div className="big" style={{ fontSize: 20 }}>{M.conclusion1.titulo}</div>
            <p>{M.conclusion1.texto}</p>
          </div>
          <div className="acard tan">
            <div className="lbl">02</div>
            <div className="big" style={{ fontSize: 20 }}>{M.conclusion2.titulo}</div>
            <p>{M.conclusion2.texto}</p>
          </div>
        </div>
        <p className="lead2" style={{ marginTop: 22 }}>
          Como parte de la visión operativa del desarrollo, se contempla que la administración pueda apoyarse en una agencia especializada para la gestión de rentas vacacionales de aquellas unidades cuyos propietarios decidan incorporarlas a un esquema de renta, sujeto a las políticas, disponibilidad, reglamentos y términos que en su momento se establezcan.
        </p>
        <p className="lead2">
          Asimismo, en caso de que un propietario decida vender su unidad después de un plazo determinado, el equipo comercial del proyecto podrá, de manera independiente y sujeto a acuerdo previo, apoyar en el proceso de colocación de la unidad, considerando los honorarios y condiciones comerciales que se definan entre las partes. Para este tipo de servicios se contempla la posible participación de firmas inmobiliarias especializadas en el segmento residencial premium, tales como The Agency, Engel &amp; Völkers o Sotheby&rsquo;s International Realty.
        </p>
        <div className="dfoot">Preparado para {cliente} · {M.etapaNombre} · {fecha}</div>
      </section>

      {/* Contraportada */}
      <section className="page blue">
        <img className="wm" src="/brand/logo_compuesto_shell.svg" alt="The Cliff Club Residences" style={{ height: "3in", width: "auto" }} />
        <div className="cabos" style={{ marginTop: 22 }}>At Quivira · Los Cabos · B.C.S.</div>
      </section>
    </div>
  );
}
