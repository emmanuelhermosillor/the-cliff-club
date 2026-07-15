// Tipos y catálogos NO confidenciales — seguros para cliente y servidor.
// Las cifras/márgenes/banco viven en el servidor (src/server/*), que lee el
// catálogo editable de Supabase (tablas public.etapas / public.unidades).

export const ESTADOS_PROSPECTO: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  propuesta_enviada: "Propuesta enviada",
  seguimiento: "Seguimiento",
  cerrado_ganado: "Cerrado · ganado",
  cerrado_perdido: "Cerrado · perdido",
};

export const MARGEN_ESTADOS: Record<string, string> = {
  confirmado: "Confirmado",
  proyeccion: "Proyección",
  por_calcular: "Por calcular",
};

// ---- opciones que el servidor envía a los selectores del cotizador ----
export type EtapaOption = {
  clave: string;
  nombre: string;
  modelo: string;
  esComprador: boolean;
};

export type UnidadOption = {
  clave: string;
  etiqueta: string;
  recamaras: string;
  m2Total: number;
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
  etapaClave: string;
  unidadClave: string; // clave del catálogo, o "LIBRE"
  etapa: {
    nombre: string;
    tag: string;
    desc: string;
    m2f: string;
    m2fRaw: number;
    margen: string; // "106%"
    margenEstado: string; // confirmado | proyeccion | por_calcular
    dcto: string; // "30%"
  };
  tipo: { u: string; rec: string; ba: string; unidadCompacta: string };
  precioMercado: string;
  subtotal: string;
  tot: string;
  totRaw: number;
  men: string;
  engTot: string;
  engPct: string;
  intermediosPct: string; // "55%"
  intermediosMeses: number;
  contraPct: string;
  contraMonto: string;
  amortRows: AmortRowView[];
  ut: string; // "0.7M"
  inv: string; // "0.7M"
  letra: string;
  banco: {
    ben: string; rfc: string; dir: string; banco: string; cuenta: string; clabe: string; swift: string; inter: string; aba: string;
  };
  areas: { totM: string; totS: string; iM: string; iS: string; tM: string; tS: string; bM: string; bS: string };
  planoSrc: string | null;
  snapshot: {
    etapa: string; tipologia: string; unidad: string;
    valor_total: number; precio_m2: number; descuento: number; margen: string; margen_estado: string;
  };
};

// Entrada de unidad para calcular una propuesta: del catálogo o libre (m² manual).
export type UnidadInput =
  | { tipo: "catalogo"; clave: string }
  | { tipo: "libre"; m2: number; recamaras?: string };
