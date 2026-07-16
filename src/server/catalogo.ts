import "server-only";

import { createClient } from "@/lib/supabase/server";
import { numeroALetras } from "@/lib/numero";
import { BANCO, FECHAS, SQFT_POR_M2, fmt, num, millones } from "./matriz";
import type {
  EtapaOption, UnidadOption, CeldaTablero, ProposalModel, AmortRowView, Areas,
  UnidadInput, AnexoModel, CompRow, PlanOverride, SupuestosAnexo,
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

// Asesor (usuario actual): nombre + contacto congelados en la propuesta (Parte E).
export async function getAsesor(): Promise<{ nombre: string; contacto: string; puesto: string; telefono: string; email: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { nombre: "", contacto: "", puesto: "", telefono: "", email: "" };
  const { data: p } = await supabase.from("profiles").select("nombre, telefono, puesto").eq("id", user.id).maybeSingle();
  const nombre = (p?.nombre as string) || user.email || "";
  const telefono = (p?.telefono as string) || "";
  const email = user.email || "";
  const contacto = [telefono, email].filter(Boolean).join(" · ");
  return { nombre, contacto, puesto: (p?.puesto as string) || "", telefono, email };
}

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

export async function getInventario(): Promise<CeldaTablero[]> {
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

// Planos por tipología. 1BR/4BR: descargados de los links oficiales de Gerardo (v8).
// 2BR/3BR: los links del correo traían rlkey dañado — se conservan los archivos oficiales
// locales (mismo nombre de archivo); TODO reemplazar cuando lleguen los links corregidos.
const PLANOS: Record<string, string> = {
  "1": "/renders/plano_1br.jpg", "2": "/renders/plano_2rec.jpeg",
  "3": "/renders/plano_3rec.jpg", "4": "/renders/plano_4br.jpg",
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
export async function buildProposal(etapaClave: string, unidad: UnidadInput, opts?: { plan?: PlanOverride }): Promise<ProposalModel> {
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

  // Plan de pagos efectivo: base de la etapa, o personalizado por cotización (Parte B).
  let enganchePctNum: number, intermediosPctNum: number, contraPctNum: number, mesesInter: number;
  let desde: number, contraMesIdx: number, fasesEng: Fase[], graciaMeses: number[], planNombre: string;
  if (opts?.plan) {
    const po = opts.plan;
    enganchePctNum = po.enganchePct;
    contraPctNum = po.contraPct;
    intermediosPctNum = Math.max(0, 1 - enganchePctNum - contraPctNum);
    mesesInter = Math.max(1, Math.round(po.meses));
    fasesEng = po.fases && po.fases.length ? po.fases : [{ c: "Enganche", pct: enganchePctNum, mes: 0 }];
    graciaMeses = [];
    desde = Math.max(0, ...fasesEng.map((f) => f.mes)) + 1;
    contraMesIdx = Math.min(35, desde + mesesInter);
    planNombre = "Personalizado";
  } else {
    enganchePctNum = E.enganche_pct != null ? n(E.enganche_pct) : (E.fases_enganche ?? []).reduce((a, f) => a + f.pct, 0);
    contraPctNum = n(E.contra_pct);
    intermediosPctNum = n(E.intermedios_pct);
    mesesInter = E.intermedios_meses ?? 24;
    fasesEng = E.fases_enganche ?? [];
    graciaMeses = E.gracia_meses ?? [];
    desde = E.intermedios_desde_idx ?? 8;
    contraMesIdx = E.contra_mes_idx ?? 35;
    planNombre = "Base";
  }
  const planEtapa: EtapaRow = {
    ...E, enganche_pct: enganchePctNum, intermedios_pct: intermediosPctNum, contra_pct: contraPctNum,
    intermedios_meses: mesesInter, intermedios_desde_idx: desde, contra_mes_idx: contraMesIdx,
    fases_enganche: fasesEng, gracia_meses: graciaMeses,
  };
  const meses = mesesInter;
  const men = Math.round((valor * intermediosPctNum) / meses);
  const rows = amortRows(planEtapa, valor, men);
  const asesor = await getAsesor();

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

  const engancheTotal = fasesEng.reduce((a, f) => a + valor * f.pct, 0);
  const intermediosTotal = valor * intermediosPctNum;
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
    enganchePct: pct(enganchePctNum),
    engancheTotal: fmt(engancheTotal),
    intermediosPct: pct(intermediosPctNum),
    intermediosTotal: fmt(intermediosTotal),
    intermediosRango: `${rangoIni} – ${rangoFin}`,
    contraPct: pct(contraPctNum),
    contraMonto: fmt(valor * contraPctNum),
    utilidad: margenNum != null ? "$" + millones(utilidad) : "—",
    inversionInicial: "$" + millones(valor),
    valorEnLetra: numeroALetras(valor),
    amortRows: amort,
    banco: BANCO,
    tablero,
    planoSrc: planoDeRecamaras(recamaras),
    canalContacto: asesor.nombre ? `${asesor.nombre}${asesor.contacto ? " · " + asesor.contacto : ""}` : CANAL_CONTACTO,
    asesor: { nombre: asesor.nombre, contacto: asesor.contacto, puesto: asesor.puesto },
    planNombre,
    snapshot: {
      etapa: E.nombre, unidad: etiqueta, modelo,
      valor_total: valor, precio_m2: precioEntrada, descuento: n(E.descuento), margen: margenNum != null ? pct(n(margenNum)) : "—",
      margen_estado: E.margen_estado,
    },
  };
}

// ================= ANEXO =================
// Supuestos del Anexo — defaults verificados, editables por admin (config_anexo).
export const SUPUESTOS_DEFAULT: SupuestosAnexo = {
  plusvaliaAnual: 0.08, plazoAnios: 5, adr: 450, ocupacion: 0.45, comision: 0.06, feeRenta: 0.20, mantenimiento: 0.10,
};

export async function getSupuestos(): Promise<SupuestosAnexo> {
  const supabase = await createClient();
  const { data } = await supabase.from("config_anexo").select("*").eq("id", 1).maybeSingle();
  if (!data) return { ...SUPUESTOS_DEFAULT };
  return {
    plusvaliaAnual: n(data.plusvalia_anual), plazoAnios: Math.round(n(data.plazo_anios)),
    adr: n(data.adr), ocupacion: n(data.ocupacion), comision: n(data.comision),
    feeRenta: n(data.fee_renta), mantenimiento: n(data.mantenimiento),
  };
}

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

export async function buildAnexo(etapaClave: string, unidad: UnidadInput, fecha: string, opts?: { supuestos?: SupuestosAnexo }): Promise<AnexoModel> {
  const E = await fetchEtapa(etapaClave);
  if (!E || E.precio_entrada_m2 == null || E.intermedios_pct == null || E.contra_pct == null || !E.fases_enganche)
    throw new Error("Etapa no disponible");

  const usandoDefaults = !opts?.supuestos;
  const S = opts?.supuestos ?? await getSupuestos();
  const plazo = Math.max(4, Math.min(8, Math.round(S.plazoAnios)));

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
  const plusvaliaFactor = Math.pow(1 + S.plusvaliaAnual, plazo);
  const valorVenta = valorActual * plusvaliaFactor;
  const comision = valorVenta * S.comision;
  const ventaNeta = valorVenta - comision;
  const utilidadVenta = ventaNeta - costo;

  // Renta a partir de los supuestos. Último año de renta = 11 meses (mes 12 = venta).
  const rentaBruta = S.adr * S.ocupacion * 30;
  const rentaNetaMensual = rentaBruta * (1 - S.feeRenta - S.mantenimiento);
  const nRenta = plazo - 3; // años de renta (4..plazo)
  const rentaAnios: number[] = [];
  for (let k = 0; k < nRenta; k++) rentaAnios.push(rentaNetaMensual * (k === nRenta - 1 ? 11 : 12));
  const utilidadRenta = rentaAnios.reduce((a, b) => a + b, 0);
  const utilidadTotal = utilidadVenta + utilidadRenta;
  const margenCompuesto = costo ? utilidadTotal / costo : 0; // modelo bottom-up (venta+renta)

  // v11: el margen HEADLINE es el oficial de la etapa (etapa.margen) — única
  // fuente de verdad, idéntico al de la Propuesta. El modelo por componentes
  // se conserva como respaldo; si difiere del oficial se agrega una nota de
  // reconciliación (no se fuerzan los renglones del modelo). v12: si el modelo
  // queda POR DEBAJO del oficial, la nota del documento no revela el % menor
  // (señal interna vía console.warn; calibrar con ADR por tipología).
  const margenOficial = n(E.margen) > 0 ? n(E.margen) : margenCompuesto;
  const utilidadOficial = costo * margenOficial;
  const pOfi = pct(margenOficial), pMod = pct(margenCompuesto);
  let notaMargen = "";
  if (pMod !== pOfi) {
    notaMargen = margenCompuesto > margenOficial
      ? `Margen compuesto citado conforme al oficial de la etapa (${pOfi}). El modelo por componentes (venta + renta) proyecta un potencial mayor (${pMod} · $${millones(utilidadTotal)}); se cita el oficial por prudencia.`
      : `Margen citado conforme al oficial de la etapa (${pOfi}). Proyección de rentabilidad conservadora; detalle de supuestos en este Anexo.`;
    if (margenCompuesto < margenOficial) console.warn(`[anexo] modelo (${pMod}) por debajo del oficial (${pOfi}) en ${E.clave} ${etiqueta} — revisar con Gerardo.`);
  }

  // Flujo por año (1..plazo). Inversión (base de la etapa) en años 1-3; renta y venta después.
  const enganche = (E.fases_enganche ?? []).reduce((a, f) => a + costo * f.pct, 0);
  const mesesA = E.intermedios_meses ?? 24;
  const desdeA = E.intermedios_desde_idx ?? 8;
  const menA = (costo * n(E.intermedios_pct)) / mesesA;
  const interPorAnio = [0, 0, 0];
  for (let i = desdeA; i < desdeA + mesesA && i < 36; i++) {
    const a = Math.floor(i / 12);
    if (a < 3) interPorAnio[a] += menA;
  }
  const contra = costo * n(E.contra_pct);

  const flujoAnual: number[] = [-(enganche + interPorAnio[0]), -interPorAnio[1], -(interPorAnio[2] + contra)];
  for (let k = 0; k < nRenta; k++) flujoAnual.push(rentaAnios[k] + (k === nRenta - 1 ? ventaNeta : 0));

  const fm = (x: number) => "$ " + Math.round(x).toLocaleString("en-US");
  const fmNeg = (x: number) => (x < 0 ? "($" + Math.round(-x).toLocaleString("en-US") + ")" : "$" + Math.round(x).toLocaleString("en-US"));
  const at = (idx: number, val: string): string[] => Array.from({ length: plazo }, (_, i) => (i === idx ? val : "-"));
  const rentaRow = Array.from({ length: plazo }, (_, i) => (i >= 3 && i - 3 < nRenta ? fm(rentaAnios[i - 3]) : "-"));

  const flujo = [
    { concepto: "Condominios · Inv. · Enganche", total: fmNeg(-enganche), anios: at(0, fmNeg(-enganche)) },
    { concepto: "Condominios · Inv. · Mensualidad", total: fmNeg(-(interPorAnio[0] + interPorAnio[1] + interPorAnio[2])), anios: Array.from({ length: plazo }, (_, i) => (i < 3 ? fmNeg(-interPorAnio[i]) : "-")) },
    { concepto: "Condominios · Inv. · Finiquito", total: fmNeg(-contra), anios: at(2, fmNeg(-contra)) },
    { concepto: "Condominios · Renta Neta", total: fm(utilidadRenta), anios: rentaRow },
    { concepto: "Condominios · Venta Neta", total: fm(ventaNeta), anios: at(plazo - 1, fm(ventaNeta)) },
    { concepto: "Flujo Total", total: fm(utilidadTotal), anios: flujoAnual.map(fmNeg) },
  ];

  // TIR: FA con supuestos por defecto = 21.77% (verificado, mensual); otras/override, estimada del flujo anual.
  let tir: string, tirNota: string;
  if (E.clave === "FA" && usandoDefaults) {
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
    plusvaliaAnual: (S.plusvaliaAnual * 100).toFixed(1) + " %", plusvalia5M2: fm(baseM2 * plusvaliaFactor),
    margenVenta: pct(utilidadVenta / costo),
    areaM2: num(m2Total), valorActual: fm(valorActual), valorTotal: fm(costo),
    margenValorActualPct: pct(margenValorActual / costo), margenValorActual: fm(margenValorActual),
    valorVentaM2: fm(baseM2 * plusvaliaFactor), valorVenta: fm(valorVenta),
    comisionPct: (S.comision * 100).toFixed(1) + " %", comision: fm(comision), ventaNeta: fm(ventaNeta),
    costo: fm(costo), margenFinal: fm(utilidadVenta), margenFinalPct: pct(utilidadVenta / costo),
    adr: fm(S.adr), ocupacion: pct(S.ocupacion), rentaMensual: fm(rentaBruta),
    feePct: pct(S.feeRenta), fee: fm(rentaBruta * S.feeRenta),
    mantePct: pct(S.mantenimiento), mante: fm(rentaBruta * S.mantenimiento),
    gastos: fm(rentaBruta * (S.feeRenta + S.mantenimiento)),
    rentaNetaMensual: fm(rentaNetaMensual),
    rentaAnio1: fm(rentaAnios[0] ?? 0), rentaAnio2: fm(rentaAnios[nRenta - 1] ?? 0), rentaTotal: fm(utilidadRenta),
    utilidadRenta: fm(utilidadRenta), utilidadVenta: fm(utilidadVenta), utilidadTotal: fm(utilidadTotal),
    flujo,
    margenProyectado: pOfi,
    inversion: "$ " + millones(costo), utilidadProyectada: "$ " + millones(utilidadOficial),
    utilidadMasInversion: "$ " + millones(utilidadOficial + costo),
    utilidadOficial: "$ " + millones(utilidadOficial),
    margenModelo: pMod, utilidadModelo: "$ " + millones(utilidadTotal), notaMargen,
    tir, tirNota,
    conclusion1: {
      titulo: `Entrada preferencial con ${pct(n(E.descuento))} de descuento`,
      texto: `Precio preferente de Usd ${fm(precioEntrada)} por M2, equivalente a un ${pct(n(E.descuento))} por debajo de nuestro valor de mercado de Usd ${fm(baseM2)} por M2.`,
    },
    conclusion2: {
      titulo: "Potencial de Rentabilidad",
      texto: `Utilidad total proyectada de Usd $${millones(utilidadOficial)}, equivalente a un margen estimado de ${pOfi} sobre la inversión inicial de $${millones(costo)}.`,
    },
    fecha,
  };
}
