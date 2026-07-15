// Catálogos y tipos NO confidenciales — seguros para cliente y servidor.
// (Las cifras/márgenes/banco viven en src/server/matriz.ts, que es server-only.)

export type EtapaKey = "FR" | "FA" | "CR";
export type TipoKey = "1" | "2" | "3" | "4";

export const ETAPAS_SELECT: { key: EtapaKey; label: string; disabled: boolean }[] = [
  { key: "FR", label: "Founders Reserve (pendiente)", disabled: true },
  { key: "FA", label: "Founders Access", disabled: false },
  { key: "CR", label: "Collectors Reserve", disabled: false },
];

export const TIPOS_SELECT: { key: TipoKey; label: string }[] = [
  { key: "1", label: "1 Recámara" },
  { key: "2", label: "2 Recámaras" },
  { key: "3", label: "3 Recámaras" },
  { key: "4", label: "4 Recámaras" },
];

export const ESTADOS_PROSPECTO: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  propuesta_enviada: "Propuesta enviada",
  seguimiento: "Seguimiento",
  cerrado_ganado: "Cerrado · ganado",
  cerrado_perdido: "Cerrado · perdido",
};

// Etiqueta corta etapa/tipología para listados (sin cifras).
export const ETAPA_NOMBRE: Record<EtapaKey, string> = {
  FR: "Founders Reserve",
  FA: "Founders Access",
  CR: "Collectors Reserve",
};
export const TIPO_NOMBRE: Record<TipoKey, string> = {
  "1": "1 recámara",
  "2": "2 recámaras",
  "3": "3 recámaras",
  "4": "4 recámaras",
};

// ---- modelo de propuesta que el servidor entrega al Documento (cliente) ----
export type AmortRowView = {
  mes: string;
  num: string;
  fecha: string;
  concepto: string;
  monto: string;
  pct: string;
  zero: boolean;
};

export type ProposalModel = {
  eKey: EtapaKey;
  tKey: TipoKey;
  etapa: { nombre: string; tag: string; desc: string; m2f: string; m2fRaw: number; margen: string; dcto: string };
  tipo: {
    u: string; rec: string; ba: string; unidadCompacta: string;
    iM: number; iS: number; tM: number; tS: number; bM: number; bS: number; totM: number; totS: number; sub: number;
  };
  precioMercado: string;
  subtotal: string;
  tot: string;
  totRaw: number;
  men: string;
  engTot: string;
  engPct: string;
  contraPct: string;
  contraMonto: string;
  amortRows: AmortRowView[];
  ut: string;
  inv: string;
  letra: string;
  banco: {
    ben: string; rfc: string; dir: string; banco: string; cuenta: string; clabe: string; swift: string; inter: string; aba: string;
  };
  areas: { totM: string; totS: string; iM: string; iS: string; tM: string; tS: string; bM: string; bS: string };
  snapshot: {
    etapa: string; tipologia: string; unidad: string;
    valor_total: number; precio_m2: number; descuento: number; margen: string;
  };
};
