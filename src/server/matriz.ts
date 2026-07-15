import "server-only";
import type { EtapaKey, TipoKey, ProposalModel, AmortRowView } from "@/lib/catalogos";

/**
 * MATRIZ DE DATOS — fuente: prototipo verificado (Adria / TCC).
 * CONFIDENCIAL. Este módulo es server-only: precios base, márgenes, tabla de
 * valores y datos bancarios NUNCA viajan en el bundle del cliente (README §4).
 * Las cifras se portan al pie de la letra — no se inventan ni se recalculan.
 */

type Fase = [concepto: string, pct: number, mesIndex: number];

type Etapa = {
  nombre: string;
  tag: string;
  desc: string;
  pendiente?: boolean;
  dcto?: number;
  m2f?: number;
  margen?: string;
  fases?: Fase[];
  graciaTail?: number[];
  contraPct?: number;
};

export const ETAPAS: Record<EtapaKey, Etapa> = {
  FR: {
    nombre: "Founders Reserve",
    tag: "El primer nombre en la lista de Torre B.",
    desc: "La etapa más temprana y exclusiva de The Cliff Club Residences.",
    pendiente: true,
  },
  FA: {
    nombre: "Founders Access",
    tag: "Una invitación al primer círculo de Torre B.",
    desc: "Founders Access abre Torre B a un grupo reducido, antes del mercado. Entrar hoy es entrar al valor de origen. Después, el precio será otro.",
    dcto: 0.3,
    m2f: 5950,
    margen: "106%",
    fases: [
      ["Apartado", 0.05, 0],
      ["Permiso de construcción", 0.1, 3],
      ["Inicio de construcción", 0.1, 4],
      ["Construcción", 0.1, 5],
    ],
    graciaTail: [6, 7],
    contraPct: 0.1,
  },
  CR: {
    nombre: "Collectors Reserve",
    tag: "Acceso preferente a Torre B.",
    desc: "Collectors Reserve es la etapa más flexible de The Cliff Club Residences: acceso preferente a Torre B, con condiciones pensadas para entrar desde las primeras etapas.",
    dcto: 0.25,
    m2f: 6375,
    margen: "92%",
    fases: [
      ["Apartado", 0.025, 0],
      ["Permiso / movimiento de tierras", 0.075, 2],
      ["Permiso de construcción", 0.075, 3],
      ["Inicio de construcción", 0.125, 4],
    ],
    graciaTail: [5, 6, 7],
    contraPct: 0.15,
  },
};

type Tipo = {
  u: string;
  rec: string;
  ba: string;
  iM: number;
  iS: number;
  tM: number;
  tS: number;
  bM: number;
  bS: number;
  totM: number;
  totS: number;
  sub: number;
};

export const TIPOS: Record<TipoKey, Tipo> = {
  "1": { u: "B 403", rec: "1 recámara", ba: "2.0 baños", iM: 87.02, iS: 936.68, tM: 17.95, tS: 193.21, bM: 6.4, bS: 68.89, totM: 111.37, totS: 1198.78, sub: 946645 },
  "2": { u: "B 402", rec: "2 recámaras", ba: "2.5 baños", iM: 150.92, iS: 1624.49, tM: 36.81, tS: 396.22, bM: 6.4, bS: 68.89, totM: 194.13, totS: 2089.6, sub: 1650105 },
  "3": { u: "B 406", rec: "3 recámaras", ba: "3.5 baños", iM: 192.1, iS: 2067.75, tM: 58.81, tS: 633.03, bM: 6.4, bS: 68.89, totM: 257.31, totS: 2769.66, sub: 2187135 },
  "4": { u: "B 401", rec: "4 recámaras", ba: "4.5 baños", iM: 232.67, iS: 2504.44, tM: 58.73, tS: 632.16, bM: 6.4, bS: 68.89, totM: 297.8, totS: 3205.49, sub: 2531300 },
};

type Val = { tot: number; men: number; ut: string; inv: string; letra: string };

export const VAL: Record<"FA" | "CR", Record<TipoKey, Val>> = {
  FA: {
    "1": { tot: 662652, men: 15186, ut: "0.7M", inv: "0.6M", letra: "Seiscientos sesenta y dos mil seiscientos cincuenta y dos" },
    "2": { tot: 1155074, men: 26470, ut: "1.2M", inv: "1.1M", letra: "Un millón ciento cincuenta y cinco mil setenta y cuatro" },
    "3": { tot: 1530995, men: 35085, ut: "1.6M", inv: "1.5M", letra: "Un millón quinientos treinta mil novecientos noventa y cinco" },
    "4": { tot: 1771910, men: 40606, ut: "1.9M", inv: "1.8M", letra: "Un millón setecientos setenta y un mil novecientos diez" },
  },
  CR: {
    "1": { tot: 709984, men: 16270, ut: "0.6M", inv: "0.7M", letra: "Setecientos nueve mil novecientos ochenta y cuatro" },
    "2": { tot: 1237579, men: 28361, ut: "1.1M", inv: "1.2M", letra: "Un millón doscientos treinta y siete mil quinientos setenta y nueve" },
    "3": { tot: 1640351, men: 37591, ut: "1.5M", inv: "1.6M", letra: "Un millón seiscientos cuarenta mil trescientos cincuenta y uno" },
    "4": { tot: 1898475, men: 43507, ut: "1.8M", inv: "1.9M", letra: "Un millón ochocientos noventa y ocho mil cuatrocientos setenta y cinco" },
  },
};

export const FECHAS = [
  "30/07/2026", "31/08/2026", "30/09/2026", "31/10/2026", "30/11/2026", "31/12/2026",
  "31/01/2027", "28/02/2027", "31/03/2027", "30/04/2027", "31/05/2027", "30/06/2027",
  "31/07/2027", "31/08/2027", "30/09/2027", "31/10/2027", "30/11/2027", "31/12/2027",
  "31/01/2028", "29/02/2028", "31/03/2028", "30/04/2028", "31/05/2028", "30/06/2028",
  "31/07/2028", "31/08/2028", "30/09/2028", "31/10/2028", "30/11/2028", "31/12/2028",
  "31/01/2029", "28/02/2029", "31/03/2029", "30/04/2029", "31/05/2029", "30/06/2029",
];

export const BANCO = {
  ben: "Adria Capital Proyecto B A001, S.A.P.I. de C.V.",
  rfc: "ACP210520UK7",
  dir: "Cerro San Antonio 202, Lomas de Mazatlán, Mazatlán, Sinaloa, C.P. 82110",
  banco: "Banco del Bajío, S.A.",
  cuenta: "342127120401",
  clabe: "030744900030731157",
  swift: "BJIOMXMLXXX / BJIOMXML",
  inter: "JP Morgan · New York",
  aba: "021000021 · CHASUS33XXX",
};

export const PRECIO_MERCADO_M2 = 8500;

// ---- formateadores (idénticos al prototipo) ----
export const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const num = (n: number) => Math.round(n).toLocaleString("en-US");

// ---- amortización a 36 meses (lógica idéntica al prototipo) ----
type AmortRow = { c: string; m: number };

function amort(eKey: EtapaKey, tot: number, men: number): AmortRow[] {
  const e = ETAPAS[eKey];
  const fases = e.fases!;
  const rows: AmortRow[] = new Array(36).fill(null).map(() => ({ c: "—", m: 0 }));
  rows[0] = { c: fases[0][0], m: tot * fases[0][1] };
  for (let i = 1; i < fases.length; i++) {
    const f = fases[i];
    rows[f[2]] = { c: f[0], m: tot * f[1] };
  }
  e.graciaTail!.forEach((i) => (rows[i] = { c: "Gracia", m: 0 }));
  let n = 1;
  for (let i = 8; i <= 31; i++) {
    rows[i] = { c: "Pago Intermedio " + String(n).padStart(2, "0"), m: men };
    n++;
  }
  rows[35] = { c: "Contra Entrega", m: tot * e.contraPct! };
  return rows;
}

// ---- modelo de propuesta (lo que consume el Documento en el cliente) ----
export function buildProposal(eKey: EtapaKey, tKey: TipoKey): ProposalModel {
  if (eKey === "FR" || ETAPAS[eKey].pendiente) {
    throw new Error("Etapa no disponible");
  }
  const E = ETAPAS[eKey];
  const T = TIPOS[tKey];
  const V = VAL[eKey as "FA" | "CR"][tKey];
  const tot = V.tot;
  const dctoPct = Math.round(E.dcto! * 100) + "%";
  const rows = amort(eKey, tot, V.men);
  const engTot = E.fases!.reduce((a, f) => a + tot * f[1], 0);
  const engPct = Math.round(E.fases!.reduce((a, f) => a + f[1], 0) * 100) + "%";

  const amortRows: AmortRowView[] = rows.map((r, i) => {
    const pct = tot ? (r.m / tot) * 100 : 0;
    const z = r.m === 0;
    return {
      mes: String(i + 1),
      num: z ? "–" : i < 6 ? String(i + 1).padStart(2, "0") : i >= 8 && i <= 31 ? String(i - 7).padStart(2, "0") : "–",
      fecha: FECHAS[i],
      concepto: r.c,
      monto: z ? "$ –" : fmt(r.m),
      pct: pct ? pct.toFixed(1) + "%" : "0.0%",
      zero: z,
    };
  });

  return {
    eKey,
    tKey,
    etapa: { nombre: E.nombre, tag: E.tag, desc: E.desc, m2f: fmt(E.m2f!), m2fRaw: E.m2f!, margen: E.margen!, dcto: dctoPct },
    tipo: { ...T, unidadCompacta: T.u.replace(" ", "") },
    precioMercado: fmt(PRECIO_MERCADO_M2),
    subtotal: fmt(T.sub),
    tot: fmt(tot),
    totRaw: tot,
    men: fmt(V.men),
    engTot: fmt(engTot),
    engPct,
    contraPct: Math.round(E.contraPct! * 100) + "%",
    contraMonto: fmt(tot * E.contraPct!),
    amortRows,
    ut: V.ut,
    inv: V.inv,
    letra: V.letra,
    banco: BANCO,
    areas: {
      totM: num(T.totM), totS: num(T.totS), iM: num(T.iM), iS: num(T.iS),
      tM: num(T.tM), tS: num(T.tS), bM: num(T.bM), bS: num(T.bS),
    },
    snapshot: {
      etapa: E.nombre, tipologia: T.rec, unidad: T.u,
      valor_total: tot, precio_m2: E.m2f!, descuento: E.dcto!, margen: E.margen!,
    },
  };
}
