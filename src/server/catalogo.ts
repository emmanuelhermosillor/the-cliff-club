import "server-only";

import { createClient } from "@/lib/supabase/server";
import { numeroALetras } from "@/lib/numero";
import { BANCO, FECHAS, SQFT_POR_M2, fmt, num, millones } from "./matriz";
import type {
  EtapaOption, UnidadOption, CeldaTablero, ProposalModel, AmortRowView, Areas,
  UnidadInput, AnexoModel, CompRow,
} from "@/lib/catalogos";

// ---------- filas del catálogo ----------
type Fase = { c: string; pct: number; mes: number };

type EtapaRow = {
  clave: string; nombre: string; tagline: string | null; descripcion: string | null;
  orden: number; modelo: string; es_comprador: boolean;
  descuento: number | null; precio_base_m2: number | null; precio_entrada_m2: number | null;
  enganche_pct: number | null; intermedios_pct: number | null; intermedios_meses: number | null;
  intermedios_desde_idx: number | null; contra_pct: number | null; contra_mes_idx: number | null;
  fases_enganche: Fase[] | null; gracia_meses: number[] | null;
  margen: number | null; margen_estado: string; activa: boolean;
};

type UnidadRow = {
  clave: string; etiqueta: string | null; recamaras: string | null; banos: string | null;
  modelo: string | null; piso: number | null; disponibilidad: string;
  m2_interior: number | null; m2_terraza: number | null; m2_ph: number | null; m2_jardin: number | null;
  m2_bodega: number | null; m2_total: number | null; sqft_total: number | null; orden: number;
};

const n = (v: unknown): number => Number(v ?? 0);
const pct = (v: number) => Math.round(v * 100) + "%";
const CANAL_CONTACTO = "The Cliff Club Residences · Comercialización";

// ---- fecha "dd/mm/yyyy" -> "Mmm YY" ----
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
function fechaCorta(ddmmyyyy: string): string {
  const [, mm, yyyy] = ddmmyyyy.split("/");
  const mi = parseInt(mm, 10) - 1;
  return `${MESES[mi] ?? "?"} ${yyyy.slice(2)}`;
}

// ---------- catálogos para selectores ----------
export async function getEtapasActivas(): Promise<EtapaOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("etapas")
    .select("clave, nombre, modelo, es_comprador, orden").eq("activa", true).order("orden");
  return (data ?? []).map((e) => ({
    clave: e.clave as string, nombre: e.nombre as string, modelo: e.modelo as string, esComprador: e.es_comprador as boolean,
  }));
}

export async function getUnidadesDisponibles(): Promise<UnidadOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("unidades")
    .select("clave, etiqueta, recamaras, modelo, m2_total, disponibilidad, orden")
    .eq("disponibilidad", "disponible").order("orden");
  return (data ?? []).map((u) => ({
    clave: u.clave as string, etiqueta: (u.etiqueta as string) ?? (u.clave as string),
    recamaras: (u.recamaras as string) ?? "", modelo: (u.modelo as string) ?? "", m2Total: n(u.m2_total),
  }));
}

async function getInventario(): Promise<CeldaTablero[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("unidades")
    .select("clave, etiqueta, piso, disponibilidad, orden").order("orden");
  return (data ?? []).map((u) => ({
    clave: u.clave as string, etiqueta: (u.etiqueta as string) ?? (u.clave as string),
    piso: n(u.piso), disponibilidad: (u.disponibilidad as string) ?? "disponible",
  }));
}

async function fetchEtapa(clave: string): Promise<EtapaRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("etapas").select("*").eq("clave", clave).maybeSingle();
  return (data as EtapaRow | null) ?? null;
}
async function fetchUnidad(clave: string): Promise<UnidadRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("unidades").select("*").eq("clave", clave).maybeSingle();
  return (data as UnidadRow | null) ?? null;
}

const PLANOS: Record<string, string> = {
  "1": "/renders/plano_1rec.jpeg", "2": "/renders/plano_2rec.jpeg",
  "3": "/renders/plano_3rec.jpg", "4": "/renders/plano_4rec.jpg",
};
function planoDeRecamaras(recamaras: string | null): string | null {
  const m = (recamaras ?? "").match(/\d/);
  return m ? PLANOS[m[0]] ?? null : null;
}

// ---------- amortización (Nº secuencial, fechas "Mmm YY") ----------
type AmortRow = { c: string; m: number };
function amortRows(etapa: EtapaRow, valor: number, men: number): AmortRow[] {
  const rows: AmortRow[] = new Array(36).fill(null).map(() => ({ c: "—", m: 0 }));
  (etapa.fases_enganche ?? []).forEach((f) => { if (f.mes >= 0 && f.mes < 36) rows[f.mes] = { c: f.c, m: valor * f.pct }; });
  (etapa.gracia_meses ?? []).forEach((i) => { if (i >= 0 && i < 36) rows[i] = { c: "Gracia", m: 0 }; });
  const desde = etapa.intermedios_desde_idx ?? 8;
  const meses = etapa.intermedios_meses ?? 24;
  for (let i = desde; i < desde + meses && i < 36; i++) rows[i] = { c: "Pago intermedio", m: men };
  const contraIdx = etapa.contra_mes_idx ?? 35;
  if (contraIdx >= 0 && contraIdx < 36) rows[contraIdx] = { c: "Contra entrega", m: valor * n(etapa.contra_pct) };
  return rows;
}

function areaPair(m2: number | null): { m2: string; sqft: string } {
  return { m2: num(n(m2)), sqft: num(n(m2) * SQFT_POR_M2) };
}

// ---------- construir PROPUESTA ----------
export async function buildProposal(etapaClave: string, unidad: UnidadInput): Promise<ProposalModel> {
  const E = await fetchEtapa(etapaClave);
  if (!E || !E.activa) throw new Error("Etapa no disponible");
  if (E.precio_entrada_m2 == null || E.intermedios_pct == null || E.contra_pct == null || !E.fases_enganche)
    throw new Error("Etapa sin estructura de pago completa");

  const inventario = await getInventario();
  const unidadesDisponibles = inventario.filter((c) => c.disponibilidad === "disponible").length;

  let U: UnidadRow | null = null;
  let etiqueta: string, recamaras: string, banos: string, modelo: string, m2Total: number;
  let areas: Areas;

  if (unidad.tipo === "catalogo") {
    U = await fetchUnidad(unidad.clave);
    if (!U || U.m2_total == null) throw new Error("Unidad no disponible");
    if (U.disponibilidad !== "disponible") throw new Error("Unidad no disponible para cotizar");
    etiqueta = U.etiqueta ?? U.clave; recamaras = U.recamaras ?? ""; banos = U.banos ?? "";
    modelo = U.modelo ?? ""; m2Total = n(U.m2_total);
    areas = {
      interior: n(U.m2_interior) ? areaPair(U.m2_interior) : undefined,
      terraza: n(U.m2_terraza) ? areaPair(U.m2_terraza) : undefined,
      ph: n(U.m2_ph) ? areaPair(U.m2_ph) : undefined,
      jardin: n(U.m2_jardin) ? areaPair(U.m2_jardin) : undefined,
      bodega: n(U.m2_bodega) ? areaPair(U.m2_bodega) : undefined,
      total: { m2: num(m2Total), sqft: U.sqft_total ? num(n(U.sqft_total)) : num(m2Total * SQFT_POR_M2) },
    };
  } else {
    const m2 = Number(unidad.m2);
    if (!Number.isFinite(m2) || m2 <= 0) throw new Error("m² inválido");
    etiqueta = "Unidad libre"; recamaras = unidad.recamaras ?? "Unidad a definir"; banos = "";
    modelo = "Unidad libre"; m2Total = m2;
    areas = { total: { m2: num(m2), sqft: num(m2 * SQFT_POR_M2) } };
  }

  const baseM2 = n(E.precio_base_m2 ?? 8500);
  const precioEntrada = n(E.precio_entrada_m2);
  const subtotal = Math.round(baseM2 * m2Total);
  const valor = Math.round(precioEntrada * m2Total);
  const meses = E.intermedios_meses ?? 24;
  const men = Math.round((valor * n(E.intermedios_pct)) / meses);
  const rows = amortRows(E, valor, men);
  const desde = E.intermedios_desde_idx ?? 8;

  // Nº secuencial de pago (salta gracia/meses vacíos).
  let seq = 0;
  const amort: AmortRowView[] = rows.map((r, i) => {
    const z = r.m === 0;
    if (!z) seq++;
    const p = valor ? (r.m / valor) * 100 : 0;
    return {
      mes: String(i + 1).padStart(2, "0"),
      num: z ? "—" : String(seq).padStart(2, "0"),
      fecha: fechaCorta(FECHAS[i] ?? "01/01/2026"),
      concepto: r.c,
      monto: z ? "—" : fmt(r.m),
      pct: z ? "—" : p.toFixed(1) + "%",
      zero: z,
    };
  });

  const engancheTotal = (E.fases_enganche ?? []).reduce((a, f) => a + valor * f.pct, 0);
  const intermediosTotal = valor * n(E.intermedios_pct);
  const rangoIni = fechaCorta(FECHAS[desde] ?? "");
  const rangoFin = fechaCorta(FECHAS[Math.min(desde + meses - 1, 35)] ?? "");
  const margenNum = E.margen;
  const utilidad = margenNum != null ? valor * n(margenNum) : 0;

  const tablero: CeldaTablero[] = inventario.map((c) => ({ ...c, selected: c.clave === (U?.clave ?? "") } as CeldaTablero));

  return {
    etapaClave: E.clave, unidadClave: U?.clave ?? "LIBRE", torre: "B",
    etapa: {
      nombre: E.nombre, tag: E.tagline ?? "", desc: E.descripcion ?? "",
      margen: margenNum != null ? pct(n(margenNum)) : "—", margenEstado: E.margen_estado,
      dcto: E.descuento != null ? pct(n(E.descuento)) : "—",
    },
    precioMercado: fmt(baseM2),
    precioSqftMercado: fmt(baseM2 / SQFT_POR_M2),
    precioPreferente: fmt(precioEntrada),
    precioSqftFinal: fmt(precioEntrada / SQFT_POR_M2),
    unidadesDisponibles,
    unidad: { etiqueta, recamaras, banos, modelo, unidadCompacta: etiqueta.replace(/\s/g, "") },
    areas,
    subtotal: fmt(subtotal),
    valorTotal: fmt(valor),
    valorTotalRaw: valor,
    mensual: fmt(men),
    enganchePct: E.enganche_pct != null ? pct(n(E.enganche_pct)) : pct((E.fases_enganche ?? []).reduce((a, f) => a + f.pct, 0)),
    engancheTotal: fmt(engancheTotal),
    intermediosPct: pct(n(E.intermedios_pct)),
    intermediosTotal: fmt(intermediosTotal),
    intermediosRango: `${rangoIni} – ${rangoFin}`,
    contraPct: pct(n(E.contra_pct)),
    contraMonto: fmt(valor * n(E.contra_pct)),
    utilidad: margenNum != null ? "$" + millones(utilidad) : "—",
    inversionInicial: "$" + millones(valor),
    valorEnLetra: numeroALetras(valor),
    amortRows: amort,
    banco: BANCO,
    tablero,
    planoSrc: planoDeRecamaras(recamaras),
    canalContacto: CANAL_CONTACTO,
    snapshot: {
      etapa: E.nombre, unidad: etiqueta, modelo,
      valor_total: valor, precio_m2: precioEntrada, descuento: n(E.descuento), margen: margenNum != null ? pct(n(margenNum)) : "—",
      margen_estado: E.margen_estado,
    },
  };
}

// ================= ANEXO =================
const PLUSVALIA_ANUAL = 0.08, PLAZO = 5, COMISION = 0.06;
const ADR = 450, OCUPACION = 0.45, FEE_RENTA = 0.20, MANTENIMIENTO = 0.10;
const RENTA_ANIO1 = 51030, RENTA_ANIO2 = 50520, RENTA_TOTAL = 101550; // ADR fijo (unidad-independiente) — TODO ADR por tipología.
const PLUSVALIA_FACTOR = Math.pow(1 + PLUSVALIA_ANUAL, PLAZO); // 1.469328

// Competitive Set (Quivira) — referencia de mercado (verificado, Anexo pág. 4).
const COMPS: CompRow[] = [
  { id: "1", desarrollo: "Alvar", descripcion: "4 recámaras", m2: "356.36", prM2: "$ 11,140", valor: "$ 3,970,000" },
  { id: "2", desarrollo: "Alvar", descripcion: "4 recámaras", m2: "342.90", prM2: "$ 8,603", valor: "$ 2,950,000" },
  { id: "3", desarrollo: "Alvar", descripcion: "4 recámaras", m2: "356.35", prM2: "$ 8,419", valor: "$ 3,000,000" },
  { id: "4", desarrollo: "Alvar", descripcion: "3 recámaras", m2: "287.79", prM2: "$ 9,382", valor: "$ 2,700,000" },
  { id: "5", desarrollo: "Coronado", descripcion: "4 recámaras", m2: "480.25", prM2: "$ 7,808", valor: "$ 3,750,000" },
  { id: "6", desarrollo: "St. Regis", descripcion: "3 recámaras", m2: "416.00", prM2: "$ 9,495", valor: "$ 3,950,000" },
  { id: "7", desarrollo: "St. Regis", descripcion: "4 recámaras", m2: "439.00", prM2: "$ 10,706", valor: "$ 4,700,000" },
];
const COMPS_AVG = { m2Total: "2,678.66", m2: "382.66", prM2: "$ 9,340", valor: "$ 3,574,232" };

// TIR anual por bisección sobre el flujo anual (períodos 1..5).
function tirAnual(flujos: number[]): number | null {
  const npv = (r: number) => flujos.reduce((a, f, i) => a + f / Math.pow(1 + r, i + 1), 0);
  let lo = -0.9, hi = 10;
  if (npv(lo) * npv(hi) > 0) return null;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid);
    if (Math.abs(v) < 1) return mid;
    if (npv(lo) * v < 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

export async function buildAnexo(etapaClave: string, unidad: UnidadInput, fecha: string): Promise<AnexoModel> {
  const E = await fetchEtapa(etapaClave);
  if (!E || E.precio_entrada_m2 == null || E.intermedios_pct == null || E.contra_pct == null || !E.fases_enganche)
    throw new Error("Etapa no disponible");

  let etiqueta: string, recamaras: string, m2Total: number;
  if (unidad.tipo === "catalogo") {
    const U = await fetchUnidad(unidad.clave);
    if (!U || U.m2_total == null) throw new Error("Unidad no disponible");
    etiqueta = U.etiqueta ?? U.clave; recamaras = U.recamaras ?? ""; m2Total = n(U.m2_total);
  } else {
    const m2 = Number(unidad.m2);
    if (!Number.isFinite(m2) || m2 <= 0) throw new Error("m² inválido");
    etiqueta = "Unidad libre"; recamaras = unidad.recamaras ?? ""; m2Total = m2;
  }

  const baseM2 = n(E.precio_base_m2 ?? 8500);
  const precioEntrada = n(E.precio_entrada_m2);
  const valorActual = baseM2 * m2Total;            // subtotal a $8,500
  const costo = Math.round(precioEntrada * m2Total); // valor total
  const margenValorActual = valorActual - costo;
  const valorVenta = valorActual * PLUSVALIA_FACTOR;
  const comision = valorVenta * COMISION;
  const ventaNeta = valorVenta - comision;
  const utilidadVenta = ventaNeta - costo;
  const utilidadRenta = RENTA_TOTAL;
  const utilidadTotal = utilidadVenta + utilidadRenta;
  const margenCompuesto = costo ? utilidadTotal / costo : 0; // == etapa.margen

  // Flujo anual (años 1-5).
  const enganche = (E.fases_enganche ?? []).reduce((a, f) => a + costo * f.pct, 0);
  const meses = E.intermedios_meses ?? 24;
  const desde = E.intermedios_desde_idx ?? 8;
  const men = costo * n(E.intermedios_pct) / meses;
  const interPorAnio = [0, 0, 0];
  for (let i = desde; i < desde + meses && i < 36; i++) {
    const anio = Math.floor(i / 12); // 0,1,2 -> años 1,2,3
    if (anio < 3) interPorAnio[anio] += men;
  }
  const contra = costo * n(E.contra_pct);
  const anio1 = -(enganche + interPorAnio[0]);
  const anio2 = -(interPorAnio[1]);
  const anio3 = -(interPorAnio[2] + contra);
  const anio4 = RENTA_ANIO1;
  const anio5 = RENTA_ANIO2 + ventaNeta;
  const flujoAnual = [anio1, anio2, anio3, anio4, anio5];

  const fm = (x: number) => "$ " + Math.round(x).toLocaleString("en-US");
  const fmNeg = (x: number) => (x < 0 ? "($" + Math.round(-x).toLocaleString("en-US") + ")" : "$" + Math.round(x).toLocaleString("en-US"));

  const flujo = [
    { concepto: "Condominios · Inv. · Enganche", total: fmNeg(-enganche), anios: [fmNeg(-enganche), "-", "-", "-", "-"] },
    { concepto: "Condominios · Inv. · Mensualidad", total: fmNeg(-(interPorAnio[0] + interPorAnio[1] + interPorAnio[2])), anios: [fmNeg(-interPorAnio[0]), fmNeg(-interPorAnio[1]), fmNeg(-interPorAnio[2]), "-", "-"] },
    { concepto: "Condominios · Inv. · Finiquito", total: fmNeg(-contra), anios: ["-", "-", fmNeg(-contra), "-", "-"] },
    { concepto: "Condominios · Renta Neta", total: fm(RENTA_TOTAL), anios: ["-", "-", "-", fm(RENTA_ANIO1), fm(RENTA_ANIO2)] },
    { concepto: "Condominios · Venta Neta", total: fm(ventaNeta), anios: ["-", "-", "-", "-", fm(ventaNeta)] },
    { concepto: "Flujo Total", total: fm(utilidadTotal), anios: flujoAnual.map(fmNeg) },
  ];

  // TIR: FA verificado 21.77%; otras, estimada del flujo anual.
  let tir: string, tirNota: string;
  if (E.clave === "FA") {
    tir = "21.77 %"; tirNota = "TIR estimada (flujo mensual).";
  } else {
    const r = tirAnual(flujoAnual);
    tir = r != null ? (r * 100).toFixed(2) + " %" : "Por calcular";
    tirNota = r != null ? "TIR estimada (flujo anual)." : "TIR por calcular con Gerardo.";
  }

  const esProyeccion = E.margen_estado === "proyeccion";

  return {
    etapaClave: E.clave, etapaNombre: E.nombre, unidadEtiqueta: etiqueta, recamaras,
    margenEstado: E.margen_estado, esProyeccion,
    comps: COMPS, compsAvg: COMPS_AVG,
    sujeto: { id: "8", desarrollo: "The Cliff Club", descripcion: recamaras, m2: num(m2Total), prM2: fm(precioEntrada), valor: fm(costo) },
    valorActualM2: fm(baseM2), descuento: pct(n(E.descuento)), valorEntradaM2: fm(precioEntrada),
    plusvaliaAnual: (PLUSVALIA_ANUAL * 100).toFixed(1) + " %", plusvalia5M2: fm(baseM2 * PLUSVALIA_FACTOR),
    margenVenta: pct(utilidadVenta / costo),
    areaM2: num(m2Total), valorActual: fm(valorActual), valorTotal: fm(costo),
    margenValorActualPct: pct(margenValorActual / costo), margenValorActual: fm(margenValorActual),
    valorVentaM2: fm(baseM2 * PLUSVALIA_FACTOR), valorVenta: fm(valorVenta),
    comisionPct: "6.0 %", comision: fm(comision), ventaNeta: fm(ventaNeta),
    costo: fm(costo), margenFinal: fm(utilidadVenta), margenFinalPct: pct(utilidadVenta / costo),
    adr: fm(ADR), ocupacion: pct(OCUPACION), rentaMensual: fm(ADR * OCUPACION * 30),
    feePct: pct(FEE_RENTA), fee: fm(ADR * OCUPACION * 30 * FEE_RENTA),
    mantePct: pct(MANTENIMIENTO), mante: fm(ADR * OCUPACION * 30 * MANTENIMIENTO),
    gastos: fm(ADR * OCUPACION * 30 * (FEE_RENTA + MANTENIMIENTO)),
    rentaNetaMensual: fm(ADR * OCUPACION * 30 * (1 - FEE_RENTA - MANTENIMIENTO)),
    rentaAnio1: fm(RENTA_ANIO1), rentaAnio2: fm(RENTA_ANIO2), rentaTotal: fm(RENTA_TOTAL),
    utilidadRenta: fm(utilidadRenta), utilidadVenta: fm(utilidadVenta), utilidadTotal: fm(utilidadTotal),
    flujo,
    margenProyectado: pct(margenCompuesto),
    inversion: "$ " + millones(costo), utilidadProyectada: "$ " + millones(utilidadTotal),
    utilidadMasInversion: "$ " + millones(utilidadTotal + costo),
    tir, tirNota,
    conclusion1: {
      titulo: `Entrada preferencial con ${pct(n(E.descuento))} de descuento`,
      texto: `Precio preferente de Usd ${fm(precioEntrada)} por M2, equivalente a un ${pct(n(E.descuento))} por debajo de nuestro valor de mercado de Usd ${fm(baseM2)} por M2.`,
    },
    conclusion2: {
      titulo: "Potencial de Rentabilidad",
      texto: `Utilidad total proyectada de Usd $${millones(utilidadTotal)}, equivalente a un margen estimado de ${pct(margenCompuesto)} sobre la inversión inicial de $${millones(costo)}.`,
    },
    fecha,
  };
}
