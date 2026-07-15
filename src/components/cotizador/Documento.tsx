/* eslint-disable @next/next/no-img-element */
import type { ProposalModel, CeldaTablero } from "@/lib/catalogos";

function Khead({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="khead">{children}</div>
      <div className="hair" />
    </>
  );
}

function boardRows(tablero: CeldaTablero[]): CeldaTablero[][] {
  const pisos = [...new Set(tablero.map((c) => c.piso))].sort((a, b) => b - a);
  return pisos.map((p) => tablero.filter((c) => c.piso === p).sort((a, b) => a.clave.localeCompare(b.clave)));
}

export function Documento({ model, cliente, fecha }: { model: ProposalModel; cliente: string; fecha: string }) {
  const E = model.etapa;
  const U = model.unidad;
  const A = model.areas;
  const left = model.amortRows.slice(0, 18);
  const right = model.amortRows.slice(18, 36);
  const rows = boardRows(model.tablero);

  return (
    <div className="doc">
      {/* ===== 1 · PORTADA ===== */}
      <section className="page bleed">
        <img className="bimg" src="/renders/s01_portada.png" alt="The Cliff Club Residences" />
        <div className="bveil" />
        <div className="binner">
          <div>
            <img className="cover-logo" src="/brand/logo_wordmark.png" alt="The Cliff Club Residences" />
            <div className="cover-cabos">At Quivira · Los Cabos · B.C.S.</div>
          </div>
          <div className="cover-bottom">
            <div className="cover-kick">Etapa privada · Propuesta de inversión</div>
            <div className="cover-etapa">{E.nombre}</div>
            <div className="cover-tag">{E.tag}</div>
            <div className="cover-meta">
              <span>Preparada para · {cliente}</span>
              <span>Expedición · {fecha}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2 · CONFIDENCIALIDAD ===== */}
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

      {/* ===== 3 · INTRODUCCIÓN ===== */}
      <section className="page">
        <Khead>Introducción</Khead>
        <p style={{ fontFamily: "var(--display)", fontSize: 22, color: "var(--ink-blue)", margin: "0 0 10px" }}>
          Estimado(a) <span className="hl">{cliente}</span>:
        </p>
        <p className="lead2">
          Por medio del presente documento, nos permitimos poner a su consideración una propuesta de adquisición dentro de The Cliff Club Residences at Quivira, un desarrollo residencial privado ubicado en Cabo San Lucas, Baja California Sur, dentro de uno de los enclaves más exclusivos del destino. Esta propuesta forma parte de una etapa privada de comercialización temprana, dirigida a un grupo selecto de compradores previo al lanzamiento del proyecto en mercado abierto.
        </p>
        <div className="imgwide" style={{ height: "2.3in", margin: "6px 0 18px" }}>
          <img src="/renders/s03_introduccion.png" alt="The Cliff Club Residences" />
        </div>
        <div className="colhead">Proyecto &amp; Grupo Desarrollador</div>
        <p className="lead2" style={{ marginTop: 4 }}>
          El proyecto consta de 134 departamentos full ownership, y contempla departamentos, áreas comunes, alberca, spa, gimnasio, terrazas, jardines, restaurantes, entre otras amenidades. BAS Group es un grupo mexicano con más de 40 años de trayectoria y experiencia en la industria inmobiliaria. Su actividad se desarrolla a través de diversas líneas de negocio, de donde surgen Adria Capital, Grupo Administrador de Inversiones Inmobiliarias, y Grubsa, Grupo Desarrollador de Proyectos Inmobiliarios.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "12px 0 18px" }}>
          {["BAS Group", "Adria Capital", "Grubsa"].map((c) => (
            <div key={c} className="acard tan" style={{ textAlign: "center", padding: "16px 10px" }}>
              <div style={{ fontFamily: "var(--display)", fontSize: 16, color: "var(--ink-blue)" }}>{c}</div>
            </div>
          ))}
        </div>
        <div className="twocol">
          <div>
            <div className="colhead">Generales del proyecto</div>
            <div className="kv"><span className="k">Comunidad</span><span className="val" style={{ fontFamily: "var(--display)", fontSize: 16 }}>Quivira</span></div>
            <div className="kv"><span className="k">Uso</span><span className="val" style={{ fontFamily: "var(--display)", fontSize: 16 }}>Turístico &amp; Residencial</span></div>
            <div className="kv"><span className="k">Torres</span><span className="val">8</span></div>
            <div className="kv"><span className="k">Unidades</span><span className="val">134</span></div>
            <div className="kv"><span className="k">Amenidades</span><span className="val">8+</span></div>
            <div className="kv"><span className="k">Centros de consumo</span><span className="val">2</span></div>
          </div>
          <div>
            <div className="colhead">Master Plan</div>
            <div className="uploadbox" style={{ minHeight: "2.2in" }}><b>Master Plan</b>pendiente de Gerardo</div>
          </div>
        </div>
        <div className="dfoot">The Cliff Club Residences · At Quivira · Los Cabos</div>
      </section>

      {/* ===== 4 · LA OPORTUNIDAD ===== */}
      <section className="page">
        <div className="khead">Etapa privada · Antes del lanzamiento</div>
        <h2 className="dtitle" style={{ marginTop: 10 }}>La oportunidad — <span className="hl">{E.nombre}</span></h2>
        <p className="dsub">{E.desc}</p>
        <div className="acard" style={{ background: "#efece5", marginTop: 18 }}>
          <p style={{ fontFamily: "var(--display)", fontSize: 18, color: "var(--ink-blue)", margin: 0 }}>134 residencias en total. Torre B abre primero, a un número contado.</p>
          <p className="lead2" style={{ margin: "6px 0 0" }}>Disponibilidad de esta etapa · <b>{model.unidadesDisponibles}</b> residencias.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "18px 0" }}>
          <div className="imgwide" style={{ height: "1.7in" }}><img src="/renders/s04_oportunidad_a.jpeg" alt="Amenidad" /></div>
          <div className="imgwide" style={{ height: "1.7in" }}><img src="/renders/s04_oportunidad_b.png" alt="Amenidad" /></div>
          <div className="imgwide" style={{ height: "1.7in" }}><img src="/renders/s04_oportunidad_c.jpeg" alt="Amenidad" /></div>
        </div>
        <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <div className="stat" style={{ background: "#efece5" }}>
            <div className="val" style={{ fontSize: 30 }}>{model.precioMercado}</div>
            <div className="lbl">El metro, en mercado</div>
          </div>
          <div className="stat tan">
            <div className="val" style={{ fontSize: 34 }}>{model.precioPreferente}</div>
            <div className="lbl">Para esta etapa · −{E.dcto}</div>
          </div>
        </div>
        <div className="note" style={{ marginTop: 12 }}>Sujeto a disponibilidad. Cifras ilustrativas; no constituyen garantía de rendimiento.</div>
      </section>

      {/* ===== 5 · PROPUESTA DE VENTA ===== */}
      <section className="page">
        <Khead>Propuesta de venta</Khead>
        <h2 className="dtitle sm" style={{ marginBottom: 18 }}>Propuesta de venta de los condominios</h2>
        <div className="stat-row">
          <div className="stat blue"><div className="lbl">Moneda</div><div className="val">USD</div></div>
          <div className="stat blue"><div className="lbl">Torre</div><div className="val">{model.torre}</div></div>
          <div className="stat blue"><div className="lbl">Total m² / sqft</div><div className="val" style={{ fontSize: 18 }}>{A.total.m2} / {A.total.sqft}</div></div>
          <div className="stat tan"><div className="lbl">Valor total</div><div className="val" style={{ fontSize: 20 }}>{model.valorTotal}</div></div>
        </div>
        <div className="twocol">
          <div>
            <div className="colhead">Unidades en venta</div>
            <table className="amort2" style={{ marginBottom: 22 }}>
              <thead><tr><th>Unidad</th><th>Rec.</th><th className="r">m²</th><th className="r">sqft</th></tr></thead>
              <tbody><tr><td>{U.etiqueta}</td><td>{U.recamaras}</td><td className="r">{A.total.m2}</td><td className="r">{A.total.sqft}</td></tr></tbody>
            </table>
            <div className="colhead">Oportunidad {E.nombre}</div>
            <div className="kv"><span className="k">Valor por m² (mercado)</span><span className="val">{model.precioMercado}</span></div>
            <div className="kv"><span className="k">Valor por sqft (mercado)</span><span className="val">{model.precioSqftMercado}</span></div>
            <div className="kv"><span className="k">Subtotal</span><span className="val">{model.subtotal}</span></div>
            <div className="kv"><span className="k">Descuento</span><span className="val">− {E.dcto}</span></div>
            <div className="kv"><span className="k">Valor por m² final</span><span className="val">{model.precioPreferente}</span></div>
            <div className="kv"><span className="k">Valor por sqft final</span><span className="val">{model.precioSqftFinal}</span></div>
            <div className="kv tot"><span className="k">Valor total</span><span className="val">{model.valorTotal}</span></div>
          </div>
          <div>
            <div className="colhead">Condiciones de pago</div>
            <div className="kv"><span className="k">Enganche · {model.enganchePct}<small>Desglose por fases de obra</small></span><span className="val">{model.engancheTotal}</span></div>
            <div className="kv"><span className="k">Pagos intermedios · {model.intermediosPct}<small>{model.mensual}/mes · {model.intermediosRango}</small></span><span className="val">{model.intermediosTotal}</span></div>
            <div className="kv"><span className="k">Contra entrega · {model.contraPct}<small>Mes 36</small></span><span className="val">{model.contraMonto}</span></div>
            <div className="kv tot"><span className="k">Total</span><span className="val">{model.valorTotal}</span></div>
            <div className="imgwide" style={{ height: "1.9in", marginTop: 16 }}><img src="/renders/s05_propuesta.jpeg" alt="Torre B" /></div>
          </div>
        </div>
        <div className="note" style={{ marginTop: "auto" }}>Cifras en USD. Sujeto a disponibilidad. Cifras ilustrativas; no constituyen garantía de rendimiento.</div>
      </section>

      {/* ===== 6 · AMORTIZACIÓN ===== */}
      <section className="page">
        <Khead>Amortización de pagos</Khead>
        <h2 className="dtitle sm">Calendario a 36 meses</h2>
        <p className="note" style={{ margin: "6px 0 16px" }}>Montos y porcentajes por etapa y tipología.</p>
        <div className="amort-grid">
          {[left, right].map((col, ci) => (
            <table className="amort2" key={ci}>
              <thead><tr><th>Mes</th><th>Nº</th><th>Fecha</th><th>Concepto</th><th className="r">Monto · %</th></tr></thead>
              <tbody>
                {col.map((r, i) => (
                  <tr key={i} className={r.zero ? "gray" : ""}>
                    <td className="mes">{r.mes}</td>
                    <td className="n">{r.num}</td>
                    <td>{r.fecha}</td>
                    <td>{r.concepto}</td>
                    <td className="r">{r.zero ? "—" : `${r.monto} · ${r.pct}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
        <div className="amort-total"><span className="k">Total</span><span className="v">{model.valorTotal} · 100%</span></div>
        <div className="dfoot">{E.nombre} · {U.etiqueta} · USD</div>
      </section>

      {/* ===== 7 · DESCRIPCIÓN ===== */}
      <section className="page">
        <Khead>Descripción de los condominios</Khead>
        <div className="twocol" style={{ gap: 26 }}>
          <div>
            <div className="colhead">01 · Ubicación en el proyecto</div>
            <div className="uploadbox" style={{ minHeight: "2in", marginBottom: 8 }}><b>Master Plan — Torre {model.torre} señalada</b>pendiente de Gerardo</div>
            <p className="note">Torre {model.torre} señalada sobre el master plan.</p>
          </div>
          <div>
            <div className="colhead">02 · Piso y disponibilidad — Torre {model.torre}</div>
            <div className="board2">
              {rows.map((row, i) => (
                <div className="brow" key={i}>
                  {row.map((c) => (
                    <div key={c.clave} className={`bcell ${c.disponibilidad}${c.selected ? " sel" : ""}`}>{c.etiqueta.replace("B ", "B")}</div>
                  ))}
                </div>
              ))}
            </div>
            <div className="blegend"><span><i className="d" />Disponible</span><span><i className="a" />Apartado</span><span><i className="v" />Vendido</span></div>
            <p className="note" style={{ marginTop: 6 }}>Estados reales. Unidad {U.etiqueta} destacada.</p>
          </div>
        </div>
        <div className="twocol" style={{ marginTop: 18, gap: 26 }}>
          <div>
            <div className="colhead">03 · El condominio — {U.etiqueta}</div>
            <div className="kv"><span className="k">Modelo</span><span className="val">{U.modelo}</span></div>
            <div className="kv"><span className="k">Recámaras</span><span className="val">{U.recamaras}</span></div>
            <div className="kv"><span className="k">Baños</span><span className="val">{U.banos || "—"}</span></div>
            <div className="kv"><span className="k">Estacionamiento</span><span className="val">1</span></div>
            {A.interior && <div className="kv"><span className="k">Interior (m² / sqft)</span><span className="val">{A.interior.m2} / {A.interior.sqft}</span></div>}
            {A.terraza && <div className="kv"><span className="k">Terraza (m² / sqft)</span><span className="val">{A.terraza.m2} / {A.terraza.sqft}</span></div>}
            {A.ph && <div className="kv"><span className="k">Roof / PH (m² / sqft)</span><span className="val">{A.ph.m2} / {A.ph.sqft}</span></div>}
            {A.jardin && <div className="kv"><span className="k">Jardín (m² / sqft)</span><span className="val">{A.jardin.m2} / {A.jardin.sqft}</span></div>}
            {A.bodega && <div className="kv"><span className="k">Bodega (m² / sqft)</span><span className="val">{A.bodega.m2} / {A.bodega.sqft}</span></div>}
            <div className="kv tot"><span className="k">Total</span><span className="val">{A.total.m2} / {A.total.sqft}</span></div>
          </div>
          <div>
            <div className="colhead">Plano del modelo</div>
            {model.planoSrc ? (
              <div className="imgwide" style={{ height: "2.6in" }}><img src={model.planoSrc} alt={`Plano ${U.recamaras}`} /></div>
            ) : (
              <div className="uploadbox" style={{ minHeight: "2.6in" }}><b>Plano del modelo</b>pendiente</div>
            )}
          </div>
        </div>
        <div className="note" style={{ marginTop: "auto" }}>Las superficies y disponibilidad son informativas y están sujetas a reservas. Toda reserva se confirma por escrito por el Vendedor.</div>
      </section>

      {/* ===== 8 · ACUERDOS ===== */}
      <section className="page">
        <Khead>Acuerdos y principales condiciones</Khead>
        <div className="twocol" style={{ gap: 20 }}>
          <div className="acard blue">
            <div className="lbl">Entrada preferente</div>
            <div className="big">Con {E.dcto} de descuento</div>
            <p>Precio preferente {model.precioPreferente}/m² frente a mercado {model.precioMercado}/m².</p>
          </div>
          <div className="acard tan">
            <div className="lbl">Potencial de rentabilidad</div>
            <div className="big">Utilidad proyectada {model.utilidad}</div>
            <p>Margen estimado {E.margen} sobre la inversión inicial {model.inversionInicial}.</p>
          </div>
        </div>
        <p className="note" style={{ margin: "12px 0 20px" }}>Detalle de supuestos en el Anexo. No constituye garantía de rendimiento.</p>
        <div className="colhead">Vigencia</div>
        <p className="lead2" style={{ marginTop: 4 }}>La presente propuesta tiene una vigencia de 15 días naturales. Se formaliza mediante Carta de Intención acompañada del depósito de apartado correspondiente.</p>
        <div className="twocol" style={{ marginTop: 16, gap: 34 }}>
          <div>
            <div className="colhead">Datos del beneficiario</div>
            <div className="kv"><span className="k">Beneficiario</span><span className="val" style={{ textAlign: "right" }}>{model.banco.ben}</span></div>
            <div className="kv"><span className="k">RFC</span><span className="val">{model.banco.rfc}</span></div>
            <div className="kv"><span className="k">Domicilio</span><span className="val" style={{ textAlign: "right", fontSize: 11 }}>{model.banco.dir}</span></div>
          </div>
          <div>
            <div className="colhead">Transferencias nac. e intl.</div>
            <div className="kv"><span className="k">Banco</span><span className="val">{model.banco.banco}</span></div>
            <div className="kv"><span className="k">CLABE</span><span className="val">{model.banco.clabe}</span></div>
            <div className="kv"><span className="k">Cuenta</span><span className="val">{model.banco.cuenta}</span></div>
            <div className="kv"><span className="k">SWIFT / BIC</span><span className="val">{model.banco.swift}</span></div>
            <div className="kv"><span className="k">Banco intermediario</span><span className="val">{model.banco.inter}</span></div>
            <div className="kv"><span className="k">ABA</span><span className="val">{model.banco.aba}</span></div>
          </div>
        </div>
        <div className="imgwide" style={{ height: "1.5in", marginTop: "auto" }}><img src="/renders/s08_acuerdos.png" alt="The Cliff Club Residences" /></div>
      </section>

      {/* ===== 9 · TÉRMINOS ===== */}
      <section className="page">
        <Khead>Términos y condiciones</Khead>
        <p className="lead2">El Vendedor es el desarrollador del Proyecto conocido como Adria Capital Proyecto B A001, S.A.P.I. de C.V. (en adelante, &ldquo;El Proyecto&rdquo;).</p>
        <p className="lead2">El Proyecto está ubicado en el interior de la Comunidad Turística Quivira, también conocida como &ldquo;Quivira Los Cabos&rdquo;. El Proyecto contará con Régimen de Condominio, así como un Reglamento de Condóminos. La unidad privativa enumerada: {U.etiqueta} (&ldquo;Unidades Privativas&rdquo;), de acuerdo con la descripción incluida en la sección &ldquo;Descripción de los Condominios&rdquo;, serán parte del señalado régimen condominal.</p>
        <p className="lead2">Las Unidades Privativas deberán ser destinadas exclusivamente a uso residencial, y deberán ser parte y sujetarse al reglamento que se establezca en el Régimen y/o cualquier Sub-régimen de Condominio para las mismas, así como los Reglamentos de Quivira.</p>
        <p className="lead2">El Comprador Potencial tiene interés en adquirir las Unidades Privativas, de acuerdo con la descripción incluida en la sección &ldquo;Descripción de los Condominios&rdquo;.</p>
        <p className="lead2">Las Partes acuerdan que el precio total de adquisición de las Unidades Privativas será de Usd {model.valorTotal} ({model.valorEnLetra}{" "}con 00/100 dólares de los Estados Unidos de América).</p>
        <p className="lead2">Una vez realizado el apartado, este tendrá una vigencia de 30 (treinta) días naturales, plazo que para todos los efectos legales se denominará el &ldquo;Periodo de Reserva&rdquo;. Durante dicho periodo, las partes definirán los términos y condiciones aplicables a la venta de la o las Unidades Privativas, mismos que quedarán formalmente establecidos en el Contrato de Promesa de Compraventa correspondiente.</p>
        <p className="lead2">La presente Carta de Intención será en beneficio único y exclusivo del potencial comprador y sus derechos no podrán ser cedidos a terceros que no estén relacionados directamente con él.</p>
        <p className="lead2">Con base en lo anterior, y habiendo leído, entendido y aceptado ambas partes los términos y condiciones establecidos en el presente documento, manifiestan su plena conformidad con su contenido, obligándose a cumplirlo en todas y cada una de sus partes. En constancia de lo anterior, las partes proceden a suscribir el presente documento.</p>
        <div className="signrow" style={{ marginTop: "auto" }}>
          <div className="signcol">
            <div className="sigline"><div className="role">El Comprador</div><div className="who">{cliente}</div></div>
            <div className="date">Fecha de firma · {fecha}</div>
          </div>
          <div className="signcol">
            <div className="sigline"><div className="role">El Vendedor</div><div className="who">Adrián Bastidas Cárdenas · Adria Capital</div></div>
          </div>
        </div>
      </section>

      {/* ===== 10 · CONTRAPORTADA ===== */}
      <section className="page blue">
        <img className="wm" src="/brand/logo_monograma.png" alt="The Cliff Club Residences — The Art of Being" style={{ height: "3.4in", width: "auto" }} />
        <div className="cabos" style={{ marginTop: 24 }}>At Quivira · Los Cabos · B.C.S.</div>
        <div className="bline" />
        <div className="cabos">Contacto · {model.canalContacto}</div>
      </section>
    </div>
  );
}
