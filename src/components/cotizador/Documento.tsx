/* eslint-disable @next/next/no-img-element */
import type { ProposalModel } from "@/lib/catalogos";

const PLANOS: Record<string, string> = {
  "1": "/renders/plano_1rec.jpeg",
  "2": "/renders/plano_2rec.jpeg",
  "3": "/renders/plano_3rec.jpg",
  "4": "/renders/plano_4rec.jpg",
};

export function Documento({
  model,
  cliente,
  fecha,
}: {
  model: ProposalModel;
  cliente: string;
  fecha: string;
}) {
  const E = model.etapa;
  const T = model.tipo;

  // Tablero de piso Torre B (ilustrativo; disponibilidad real pendiente).
  const board: { id: string; sel: boolean }[] = [];
  for (let p = 1; p <= 5; p++) {
    for (let col = 1; col <= 6; col++) {
      const id = `B${p}0${col}`;
      board.push({ id, sel: id === T.unidadCompacta });
    }
  }

  return (
    <div className="doc">
      {/* ===== 1 · PORTADA (render a sangre + logo + etapa) ===== */}
      <section className="sheet cover bleed">
        <img className="bleed-img" src="/renders/s01_portada.png" alt="The Cliff Club Residences" />
        <div className="veil" />
        <div className="cover-inner">
          <img className="cover-logo" src="/brand/logo_wordmark.png" alt="The Cliff Club Residences" />
          <div className="metaline">At Quivira · Los Cabos · B.C.S.</div>
          <div className="cover-bottom">
            <h2 className="title" style={{ color: "#fff" }}>{E.nombre}</h2>
            <div className="sub">{E.tag}</div>
            <div className="metaline">Preparada para · {cliente}</div>
            <div className="metaline" style={{ marginTop: ".15in" }}>Expedición · {fecha}</div>
          </div>
        </div>
      </section>

      {/* ===== 2 · CONFIDENCIALIDAD ===== */}
      <section className="sheet">
        <div className="kick warm">Confidencialidad</div>
        <h2 className="title" style={{ fontSize: "30px" }}>Un documento privado.</h2>
        <p className="small" style={{ fontSize: "9.5px", lineHeight: 1.6 }}>
          Este documento ha sido preparado por The Cliff Club Residences para uso exclusivo del destinatario, utilizando información obtenida de fuentes disponibles a Adria y otras fuentes públicas. Adria no ha verificado de forma independiente la información contenida, ni hace declaración o garantía sobre su exactitud, integridad o fiabilidad; el destinatario no debe considerarlo un sustituto de su propio juicio.
          <br /><br />
          Cualquier estimación o proyección sobre hechos futuros (ingresos, gastos, rendimiento) se basa en el mejor juicio de Adria; no hay garantía de que se cumplan y los resultados reales pueden variar de forma importante. Nada aquí constituye una promesa o declaración. Ni Adria ni sus afiliados asumen responsabilidad alguna resultante del uso de este documento.
          <br /><br />
          Este documento se preparó con fines informativos y no debe interpretarse como oferta de compra o venta de valores, ni como asesoramiento legal, fiscal, contable o de inversión. Es confidencial, para uso exclusivo de su destinatario; se prohíbe su distribución a terceros que no sean el destinatario o sus asesores profesionales.
        </p>
        <div className="foot">
          <span className="wordmark" style={{ letterSpacing: ".14em" }}>The Cliff Club Residences</span>
          <span>The Art of Being</span>
        </div>
      </section>

      {/* ===== 3 · INTRODUCCIÓN ===== */}
      <section className="sheet">
        <div className="kick">Introducción</div>
        <h2 className="title" style={{ fontSize: "30px" }}>Estimado(a) {cliente}:</h2>
        <p>
          Por medio del presente documento, nos permitimos poner a su consideración una propuesta de adquisición dentro de The Cliff Club Residences at Quivira, un desarrollo residencial privado en Cabo San Lucas, Baja California Sur, dentro de uno de los enclaves más exclusivos del destino. Esta propuesta forma parte de una etapa privada de comercialización temprana, previa al lanzamiento en mercado abierto.
        </p>
        <div className="two" style={{ marginTop: "8px" }}>
          <div>
            <div className="kick warm">Proyecto &amp; Grupo Desarrollador</div>
            <p style={{ fontSize: "11px" }}>
              134 departamentos full ownership, con áreas comunes, alberca, spa, gimnasio, terrazas, jardines y restaurantes. BAS Group: más de 40 años de trayectoria, de donde surgen Adria Capital y Grubsa.
            </p>
          </div>
          <div className="imgph" style={{ minHeight: "1.8in" }}>
            <img src="/renders/s03_introduccion.png" alt="The Cliff Club Residences at Quivira" />
          </div>
        </div>
        <div className="card2" style={{ background: "var(--mist)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", fontFamily: "var(--mono)", fontSize: "9.5px", letterSpacing: ".06em", textTransform: "uppercase", color: "#40555f" }}>
            <div><b style={{ fontFamily: "var(--display)", fontSize: "20px", textTransform: "none" }}>Quivira</b><br />Comunidad</div>
            <div><b style={{ fontFamily: "var(--display)", fontSize: "20px" }}>8</b><br />Torres</div>
            <div><b style={{ fontFamily: "var(--display)", fontSize: "20px" }}>134</b><br />Unidades</div>
            <div><b style={{ fontFamily: "var(--display)", fontSize: "20px" }}>8+</b><br />Amenidades</div>
            <div><b style={{ fontFamily: "var(--display)", fontSize: "20px" }}>2</b><br />Centros de consumo</div>
            <div><b style={{ fontFamily: "var(--display)", fontSize: "16px", textTransform: "none" }}>Turístico &amp; Residencial</b><br />Uso</div>
          </div>
        </div>
        <div className="foot"><span>The Cliff Club Residences</span><span>At Quivira · Los Cabos</span></div>
      </section>

      {/* ===== 4 · LA OPORTUNIDAD (grid de 3 fotos) ===== */}
      <section className="sheet">
        <div className="kick">Etapa privada · Antes del lanzamiento</div>
        <h2 className="title">{E.nombre}</h2>
        <p style={{ maxWidth: "5in" }}>{E.desc}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", margin: "12px 0" }}>
          <div className="imgph" style={{ minHeight: "1.7in" }}><img src="/renders/s04_oportunidad_a.jpeg" alt="Amenidad" /></div>
          <div className="imgph" style={{ minHeight: "1.7in" }}><img src="/renders/s04_oportunidad_b.png" alt="Amenidad" /></div>
          <div className="imgph" style={{ minHeight: "1.7in" }}><img src="/renders/s04_oportunidad_c.jpeg" alt="Amenidad" /></div>
        </div>
        <div className="card2" style={{ background: "var(--sand)", textAlign: "center" }}>
          <div className="mono" style={{ fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: "#6a655c" }}>Escasez</div>
          <p style={{ fontSize: "15px", fontFamily: "var(--display)", margin: "6px 0 0" }}>Ciento treinta y cuatro residencias en total. Torre B abre primero, a un número contado.</p>
        </div>
        <div style={{ marginTop: "auto" }}>
          <div className="row"><span className="lbl">El metro, en mercado</span><span className="big" style={{ color: "var(--warm)" }}>{model.precioMercado}</span></div>
          <div className="row"><span className="lbl">Para esta etapa · −{E.dcto}</span><span className="big" style={{ color: "var(--blue)" }}>{E.m2f}</span></div>
          <p className="small">Cifras ilustrativas. Sujeto a disponibilidad. No constituyen garantía de rendimiento.</p>
        </div>
        <div className="foot"><span>{E.nombre}</span><span>Torre B · Sujeto a disponibilidad</span></div>
      </section>

      {/* ===== 5 · PROPUESTA DE VENTA ===== */}
      <section className="sheet">
        <div className="kick">Propuesta de venta</div>
        <h2 className="title" style={{ fontSize: "28px" }}>Residencia {T.u} · Torre B</h2>
        <h3 style={{ fontFamily: "var(--text)", fontWeight: 400, fontSize: "15px", color: "#5a564f", margin: 0 }}>{T.rec} · {model.areas.totM} m² ({model.areas.totS} sqft)</h3>
        <div className="imgph" style={{ minHeight: "2in", margin: "12px 0" }}><img src="/renders/s05_propuesta.jpeg" alt="Residencia Torre B" /></div>
        <div className="two">
          <div className="card2">
            <div className="kick warm" style={{ marginBottom: "6px" }}>Oportunidad {E.nombre}</div>
            <div className="row"><span className="lbl">Valor por m² (mercado)</span><span>{model.precioMercado}</span></div>
            <div className="row"><span className="lbl">Subtotal</span><span>{model.subtotal}</span></div>
            <div className="row"><span className="lbl">Descuento</span><span>−{E.dcto}</span></div>
            <div className="row"><span className="lbl">Valor por m² final</span><span>{E.m2f}</span></div>
            <div className="row"><span className="lbl">Valor total</span><span className="val">{model.tot}</span></div>
          </div>
          <div className="card2" style={{ background: "var(--mist)" }}>
            <div className="kick warm" style={{ marginBottom: "6px" }}>Condiciones de pago</div>
            <div className="row"><span className="lbl">Enganche · {model.engPct}</span><span>{model.engTot}</span></div>
            <div className="row"><span className="lbl">Intermedios · 55% (24m)</span><span>{model.men}/mes</span></div>
            <div className="row"><span className="lbl">Contra entrega · {model.contraPct}</span><span>{model.contraMonto}</span></div>
            <div className="row"><span className="lbl">Total</span><span className="val">{model.tot}</span></div>
            <p className="small" style={{ marginTop: "6px" }}>USD. Entrega estimada: junio 2029.</p>
          </div>
        </div>
        <div className="foot"><span>{E.nombre}</span><span>Propuesta de venta</span></div>
      </section>

      {/* ===== 6 · AMORTIZACIÓN ===== */}
      <section className="sheet">
        <div className="kick">Amortización de pagos</div>
        <h2 className="title" style={{ fontSize: "26px" }}>Calendario a 36 meses</h2>
        <table className="amort">
          <thead>
            <tr><th className="l">Mes</th><th className="l">Nº</th><th className="l">Fecha</th><th className="l">Concepto</th><th>Monto</th><th>%</th></tr>
          </thead>
          <tbody>
            {model.amortRows.map((r, i) => (
              <tr key={i} className={r.zero ? "gray" : ""}>
                <td className="l">{r.mes}</td>
                <td className="l">{r.num}</td>
                <td className="l">{r.fecha}</td>
                <td className="l">{r.concepto}</td>
                <td>{r.monto}</td>
                <td>{r.pct}</td>
              </tr>
            ))}
            <tr className="tot"><td className="l" colSpan={4}>Total</td><td>{model.tot}</td><td>100%</td></tr>
          </tbody>
        </table>
        <div className="foot"><span>{E.nombre} · {T.u}</span><span>USD</span></div>
      </section>

      {/* ===== 7 · DESCRIPCIÓN DE LOS CONDOMINIOS ===== */}
      <section className="sheet">
        <div className="kick">Descripción de los condominios</div>
        <div className="imgph" style={{ minHeight: "1.4in", margin: "8px 0" }}><img src="/renders/s07_descripcion.png" alt="Interior Torre B" /></div>
        <div>
          <div className="kick warm">01 · Ubicación en el proyecto</div>
          <div className="imgph todo" style={{ minHeight: "1.3in", margin: "6px 0" }}>[ TODO · Master Plan con Torre B señalada — pendiente de Gerardo ]</div>
        </div>
        <div>
          <div className="kick warm">02 · Piso y disponibilidad — Torre B</div>
          <div className="board">
            {board.map((c) => (
              <div key={c.id} className={`cell${c.sel ? " sel" : ""}`}>{c.id}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontFamily: "var(--mono)", fontSize: "8px", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--warm)" }}>
            <span><span style={{ display: "inline-block", width: "9px", height: "9px", borderRadius: "2px", marginRight: "5px", background: "var(--blue)", verticalAlign: "middle" }} />Unidad propuesta ({T.u})</span>
            <span>Disponibilidad sujeta a confirmación</span>
          </div>
        </div>
        <div style={{ marginTop: "12px" }}>
          <div className="kick warm">03 · El condominio</div>
          <div className="two" style={{ marginTop: "6px" }}>
            <table>
              <tbody>
                <tr><td className="l">Unidad</td><td>{T.u}</td></tr>
                <tr><td className="l">Distribución</td><td>{T.rec} · {T.ba}</td></tr>
                <tr><td className="l">Área habitable</td><td>{model.areas.iM} m² · {model.areas.iS} sqft</td></tr>
                <tr><td className="l">Terraza</td><td>{model.areas.tM} m² · {model.areas.tS} sqft</td></tr>
                <tr><td className="l">Bodega</td><td>{model.areas.bM} m² · {model.areas.bS} sqft</td></tr>
                <tr><td className="l"><b>Área total</b></td><td><b>{model.areas.totM} m² · {model.areas.totS} sqft</b></td></tr>
              </tbody>
            </table>
            <div className="imgph" style={{ minHeight: "2.4in" }}><img src={PLANOS[model.tKey]} alt={`Plano ${T.rec}`} /></div>
          </div>
        </div>
        <p className="small" style={{ marginTop: "8px" }}>El desarrollador se reserva el derecho de ajustes menores en distribución y diseño, sin aviso. La unidad específica se confirma al manifestar interés, conforme al inventario disponible.</p>
        <div className="foot"><span>{E.nombre} · {T.u}</span><span>Descripción</span></div>
      </section>

      {/* ===== 8 · ACUERDOS Y PRINCIPALES CONDICIONES ===== */}
      <section className="sheet">
        <div className="kick">Acuerdos y principales condiciones</div>
        <div className="imgph" style={{ minHeight: "1.5in", margin: "12px 0" }}><img src="/renders/s08_acuerdos.png" alt="The Cliff Club Residences" /></div>
        <div className="two">
          <div className="card2">
            <div className="kick warm">Entrada preferente</div>
            <p style={{ fontSize: "12px", margin: "6px 0 0" }}>Precio preferente <b>{E.m2f}/m²</b> frente al valor de mercado de {model.precioMercado}/m² — <b>{E.dcto} de descuento</b>.</p>
          </div>
          <div className="card2" style={{ background: "var(--moss)" }}>
            <div className="kick warm">Potencial de rentabilidad</div>
            <p style={{ fontSize: "12px", margin: "6px 0 0" }}>Utilidad total proyectada de <b>Usd ${model.ut}</b>, margen estimado de <b>{E.margen}</b> sobre la inversión inicial de ${model.inv}.</p>
          </div>
        </div>
        <p className="small">Detalle de supuestos en el documento Anexo. No constituye promesa ni garantía de rendimiento.</p>
        <p style={{ marginTop: "8px" }}><b>Vigencia.</b> 15 días naturales desde la fecha de expedición. Se formaliza con la firma de la Carta de Intención y el pago del depósito de apartado.</p>
        <div className="card2" style={{ background: "var(--sand)" }}>
          <div className="kick warm" style={{ marginBottom: "6px" }}>Datos para el depósito</div>
          <div style={{ fontSize: "10.5px", lineHeight: 1.7 }}>
            <b>Beneficiario:</b> {model.banco.ben} · <b>RFC:</b> {model.banco.rfc}<br />
            <b>Banco:</b> {model.banco.banco} · <b>Cuenta:</b> {model.banco.cuenta} · <b>CLABE:</b> {model.banco.clabe}<br />
            <b>SWIFT/BIC:</b> {model.banco.swift} · <b>Intermediario:</b> {model.banco.inter} · <b>ABA:</b> {model.banco.aba}
          </div>
        </div>
        <div className="foot"><span>{E.nombre} · {T.u}</span><span>Acuerdos y condiciones</span></div>
      </section>

      {/* ===== 9 · TÉRMINOS Y CONDICIONES ===== */}
      <section className="sheet">
        <div className="kick">Términos y condiciones</div>
        <p className="small" style={{ fontSize: "9.5px", lineHeight: 1.65, marginTop: "10px" }}>
          El Vendedor es el desarrollador del Proyecto conocido como Adria Capital Proyecto B A001, S.A.P.I. de C.V. El Proyecto está ubicado en la Comunidad Turística Quivira (&ldquo;Quivira Los Cabos&rdquo;), contará con Régimen de Condominio y su Reglamento de Condóminos. La unidad privativa {T.u} será parte del señalado régimen condominal y se destinará exclusivamente a uso residencial.
          <br /><br />
          Las Partes acuerdan que el precio total de adquisición será de Usd {model.tot} ({model.letra} con 00/100 dólares de los Estados Unidos de América). Una vez realizado el apartado, este tendrá una vigencia de 30 días naturales (&ldquo;Periodo de Reserva&rdquo;), durante el cual se definirán los términos que quedarán en el Contrato de Promesa de Compraventa. La presente Carta de Intención es en beneficio único del potencial comprador y sus derechos no podrán cederse a terceros.
          <br /><br />
          Habiendo leído, entendido y aceptado ambas partes los términos aquí establecidos, manifiestan su plena conformidad, obligándose a cumplirlos en todas sus partes.
        </p>
        <div className="two" style={{ marginTop: "auto", gap: "30px" }}>
          <div style={{ textAlign: "center", borderTop: "1px solid var(--ink)", paddingTop: "6px" }}><span className="mono" style={{ fontSize: "9px" }}>EL COMPRADOR · {cliente}</span></div>
          <div style={{ textAlign: "center", borderTop: "1px solid var(--ink)", paddingTop: "6px" }}><span className="mono" style={{ fontSize: "9px" }}>EL VENDEDOR · ADRIÁN BASTIDAS CÁRDENAS, ADRIA CAPITAL</span></div>
        </div>
        <div className="foot"><span>Fecha de firma · {fecha}</span><span>{E.nombre}</span></div>
      </section>

      {/* ===== 10 · CONTRAPORTADA ===== */}
      <section className="sheet cover plain">
        <img className="cover-logo" src="/brand/logo_monograma.png" alt="The Cliff Club Residences — The Art of Being" style={{ width: "3.4in", filter: "brightness(0) invert(1)" }} />
        <div className="metaline">At Quivira · Los Cabos · B.C.S.</div>
        <div className="metaline" style={{ marginTop: ".5in" }}>Contacto · Etapa privada</div>
      </section>
    </div>
  );
}
