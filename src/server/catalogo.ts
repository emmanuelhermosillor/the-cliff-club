import "server-only";

import { createClient } from "@/lib/supabase/server";
import { numeroALetras } from "@/lib/numero";
import { BANCO, FECHAS, SQFT_POR_M2, fmt, num, millones } from "./matriz";
import type {
  EtapaOption,
  UnidadOption,
  ProposalModel,
  AmortRowView,
  UnidadInput,
} from "@/lib/catalogos";

// ---- filas del catálogo (Supabase) ----
type Fase = { c: string; pct: number; mes: number };

type EtapaRow = {
  clave: string;
  nombre: string;
  tagline: string | null;
  descripcion: string | null;
  orden: number;
  modelo: string;
  es_comprador: boolean;
  descuento: number | null;
  precio_base_m2: number | null;
  precio_entrada_m2: number | null;
  enganche_pct: number | null;
  intermedios_pct: number | null;
  intermedios_meses: number | null;
  intermedios_desde_idx: number | null;
  contra_pct: number | null;
  contra_mes_idx: number | null;
  fases_enganche: Fase[] | null;
  gracia_meses: number[] | null;
  margen: number | null;
  margen_estado: string;
  activa: boolean;
};

type UnidadRow = {
  clave: string;
  etiqueta: string | null;
  recamaras: string | null;
  banos: string | null;
  m2_interior: number | null;
  m2_terraza: number | null;
  m2_bodega: number | null;
  m2_total: number | null;
  sqft_total: number | null;
  orden: number;
  activa: boolean;
};

const n = (v: unknown): number => Number(v ?? 0);

// ---- catálogos para los selectores (solo activos, sin cifras) ----
export async function getEtapasActivas(): Promise<EtapaOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("etapas")
    .select("clave, nombre, modelo, es_comprador, activa, orden")
    .eq("activa", true)
    .order("orden");
  return (data ?? []).map((e) => ({
    clave: e.clave as string,
    nombre: e.nombre as string,
    modelo: e.modelo as string,
    esComprador: e.es_comprador as boolean,
  }));
}

export async function getUnidadesActivas(): Promise<UnidadOption[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("unidades")
    .select("clave, etiqueta, recamaras, m2_total, activa, orden")
    .eq("activa", true)
    .order("orden");
  return (data ?? []).map((u) => ({
    clave: u.clave as string,
    etiqueta: (u.etiqueta as string) ?? (u.clave as string),
    recamaras: (u.recamaras as string) ?? "",
    m2Total: n(u.m2_total),
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
  "1": "/renders/plano_1rec.jpeg",
  "2": "/renders/plano_2rec.jpeg",
  "3": "/renders/plano_3rec.jpg",
  "4": "/renders/plano_4rec.jpg",
};
function planoDeRecamaras(recamaras: string | null): string | null {
  const m = (recamaras ?? "").match(/\d/);
  return m ? PLANOS[m[0]] ?? null : null;
}

const pct = (v: number) => Math.round(v * 100) + "%";

// ---- amortización a 36 meses, generalizada desde el catálogo ----
type AmortRow = { c: string; m: number };

function amort(etapa: EtapaRow, valor: number, men: number): AmortRow[] {
  const rows: AmortRow[] = new Array(36).fill(null).map(() => ({ c: "—", m: 0 }));
  const fases = etapa.fases_enganche ?? [];
  fases.forEach((f) => {
    if (f.mes >= 0 && f.mes < 36) rows[f.mes] = { c: f.c, m: valor * f.pct };
  });
  (etapa.gracia_meses ?? []).forEach((i) => {
    if (i >= 0 && i < 36) rows[i] = { c: "Gracia", m: 0 };
  });
  const desde = etapa.intermedios_desde_idx ?? 8;
  const meses = etapa.intermedios_meses ?? 24;
  let k = 1;
  for (let i = desde; i < desde + meses && i < 36; i++) {
    rows[i] = { c: "Pago Intermedio " + String(k).padStart(2, "0"), m: men };
    k++;
  }
  const contraIdx = etapa.contra_mes_idx ?? 35;
  if (contraIdx >= 0 && contraIdx < 36) rows[contraIdx] = { c: "Contra Entrega", m: valor * n(etapa.contra_pct) };
  return rows;
}

// ---- construir la propuesta (server-only) ----
export async function buildProposal(etapaClave: string, unidad: UnidadInput): Promise<ProposalModel> {
  const E = await fetchEtapa(etapaClave);
  if (!E || !E.activa) throw new Error("Etapa no disponible");
  if (E.precio_entrada_m2 == null || E.intermedios_pct == null || E.contra_pct == null || !E.fases_enganche) {
    throw new Error("Etapa sin estructura de pago completa");
  }

  // Resolver unidad (catálogo o libre).
  let uClave: string;
  let etiqueta: string;
  let recamaras: string;
  let banos: string;
  let m2Int: number | null;
  let m2Ter: number | null;
  let m2Bod: number | null;
  let m2Total: number;
  let sqftTotal: number;

  if (unidad.tipo === "catalogo") {
    const U = await fetchUnidad(unidad.clave);
    if (!U || U.m2_total == null) throw new Error("Unidad no disponible");
    uClave = U.clave;
    etiqueta = U.etiqueta ?? U.clave;
    recamaras = U.recamaras ?? "";
    banos = U.banos ?? "";
    m2Int = U.m2_interior != null ? n(U.m2_interior) : null;
    m2Ter = U.m2_terraza != null ? n(U.m2_terraza) : null;
    m2Bod = U.m2_bodega != null ? n(U.m2_bodega) : null;
    m2Total = n(U.m2_total);
    sqftTotal = U.sqft_total != null ? n(U.sqft_total) : m2Total * SQFT_POR_M2;
  } else {
    const m2 = Number(unidad.m2);
    if (!Number.isFinite(m2) || m2 <= 0) throw new Error("m² inválido");
    uClave = "LIBRE";
    etiqueta = "Unidad libre";
    recamaras = unidad.recamaras ?? "Unidad a definir";
    banos = "";
    m2Int = null;
    m2Ter = null;
    m2Bod = null;
    m2Total = m2;
    sqftTotal = m2 * SQFT_POR_M2;
  }

  const baseM2 = n(E.precio_base_m2 ?? 8500);
  const precioEntrada = n(E.precio_entrada_m2);
  const subtotal = Math.round(baseM2 * m2Total);
  const valor = Math.round(precioEntrada * m2Total);

  const meses = E.intermedios_meses ?? 24;
  const men = Math.round((valor * n(E.intermedios_pct)) / meses);
  const rows = amort(E, valor, men);

  const engTot = (E.fases_enganche ?? []).reduce((a, f) => a + valor * f.pct, 0);
  const engPct = E.enganche_pct != null ? pct(n(E.enganche_pct)) : pct((E.fases_enganche ?? []).reduce((a, f) => a + f.pct, 0));
  const desde = E.intermedios_desde_idx ?? 8;

  const amortRows: AmortRowView[] = rows.map((r, i) => {
    const p = valor ? (r.m / valor) * 100 : 0;
    const z = r.m === 0;
    return {
      mes: String(i + 1),
      num: z ? "–" : i < desde ? String(i + 1).padStart(2, "0") : i >= desde && i < desde + meses ? String(i - desde + 1).padStart(2, "0") : "–",
      fecha: FECHAS[i] ?? "",
      concepto: r.c,
      monto: z ? "$ –" : fmt(r.m),
      pct: p ? p.toFixed(1) + "%" : "0.0%",
      zero: z,
    };
  });

  const margenNum = E.margen;
  const margenStr = margenNum != null ? pct(n(margenNum)) : "—";
  const utilidad = margenNum != null ? valor * n(margenNum) : 0;

  const sqft = (m2v: number | null) => (m2v != null ? num(m2v * SQFT_POR_M2) : "—");

  return {
    etapaClave: E.clave,
    unidadClave: uClave,
    etapa: {
      nombre: E.nombre,
      tag: E.tagline ?? "",
      desc: E.descripcion ?? "",
      m2f: fmt(precioEntrada),
      m2fRaw: precioEntrada,
      margen: margenStr,
      margenEstado: E.margen_estado,
      dcto: E.descuento != null ? pct(n(E.descuento)) : "—",
    },
    tipo: { u: etiqueta, rec: recamaras, ba: banos, unidadCompacta: etiqueta.replace(/\s/g, "") },
    precioMercado: fmt(baseM2),
    subtotal: fmt(subtotal),
    tot: fmt(valor),
    totRaw: valor,
    men: fmt(men),
    engTot: fmt(engTot),
    engPct,
    intermediosPct: pct(n(E.intermedios_pct)),
    intermediosMeses: meses,
    contraPct: pct(n(E.contra_pct)),
    contraMonto: fmt(valor * n(E.contra_pct)),
    amortRows,
    ut: margenNum != null ? millones(utilidad) : "—",
    inv: millones(valor),
    letra: numeroALetras(valor),
    banco: BANCO,
    areas: {
      totM: num(m2Total),
      totS: num(sqftTotal),
      iM: m2Int != null ? num(m2Int) : "—",
      iS: sqft(m2Int),
      tM: m2Ter != null ? num(m2Ter) : "—",
      tS: sqft(m2Ter),
      bM: m2Bod != null ? num(m2Bod) : "—",
      bS: sqft(m2Bod),
    },
    planoSrc: planoDeRecamaras(recamaras),
    snapshot: {
      etapa: E.nombre,
      tipologia: recamaras,
      unidad: etiqueta,
      valor_total: valor,
      precio_m2: precioEntrada,
      descuento: n(E.descuento),
      margen: margenStr,
      margen_estado: E.margen_estado,
    },
  };
}
