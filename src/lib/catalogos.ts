// Tipos y catálogos NO confidenciales — seguros para cliente y servidor.
// Cifras/márgenes/banco viven en el servidor (src/server/*), que lee el
// catálogo editable de Supabase (public.etapas / public.unidades).

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

export const DISPONIBILIDAD: Record<string, string> = {
  disponible: "Disponible",
  apartada: "Apartado",
  vendida: "Vendido",
};

// ---- opciones para los selectores del cotizador ----
export type EtapaOption = { clave: string; nombre: string; modelo: string; esComprador: boolean };

export type UnidadOption = {
  clave: string;
  etiqueta: string;
  recamaras: string;
  modelo: string;
  m2Total: number;
};

// ---- tablero de disponibilidad (pág. 7) ----
export type CeldaTablero = {
  clave: string;
  etiqueta: string;
  piso: number;
  disponibilidad: string; // disponible | apartada | vendida
  selected?: boolean;
};

// ---- amortización ----
export type AmortRowView = {
  mes: string; // 01..36
  num: string; // Nº secuencial de pago, o "—"
  fecha: string; // "Jul 26"
  concepto: string;
  monto: string;
  pct: string;
  zero: boolean;
};

// ---- áreas (m² + sqft, ya formateadas) ----
export type Areas = {
  interior?: { m2: string; sqft: string };
  terraza?: { m2: string; sqft: string };
  ph?: { m2: string; sqft: string };
  jardin?: { m2: string; sqft: string };
  bodega?: { m2: string; sqft: string };
  total: { m2: string; sqft: string };
};

// ---- modelo de la PROPUESTA (lo que consume el Documento en el cliente) ----
export type ProposalModel = {
  etapaClave: string;
  unidadClave: string;
  torre: string;
  // etapa
  etapa: { nombre: string; tag: string; desc: string; margen: string; margenEstado: string; dcto: string };
  precioMercado: string; // $8,500
  precioSqftMercado: string; // $790
  precioPreferente: string; // valor por m² final
  precioSqftFinal: string;
  unidadesDisponibles: number;
  // unidad
  unidad: { etiqueta: string; recamaras: string; banos: string; modelo: string; unidadCompacta: string };
  areas: Areas;
  // cifras
  subtotal: string;
  valorTotal: string;
  valorTotalRaw: number;
  mensual: string;
  enganchePct: string;
  engancheTotal: string;
  intermediosPct: string;
  intermediosTotal: string;
  intermediosRango: string; // "Mar 27 – Feb 29"
  contraPct: string;
  contraMonto: string;
  utilidad: string;
  inversionInicial: string;
  valorEnLetra: string;
  amortRows: AmortRowView[];
  banco: {
    ben: string; rfc: string; dir: string; banco: string; cuenta: string; clabe: string; swift: string; inter: string; aba: string;
  };
  tablero: CeldaTablero[];
  planoSrc: string | null;
  canalContacto: string;
  asesor: { nombre: string; contacto: string; puesto: string };
  planNombre: string; // "Base" | "Personalizado"
  snapshot: {
    etapa: string; unidad: string; modelo: string;
    valor_total: number; precio_m2: number; descuento: number; margen: string; margen_estado: string;
  };
};

export type UnidadInput =
  | { tipo: "catalogo"; clave: string }
  | { tipo: "libre"; m2: number; recamaras?: string };

// Asesor que prepara la propuesta (Parte E).
export type Asesor = { nombre: string; contacto: string; puesto: string; telefono: string; email: string };

// Plan de pagos personalizado por cotización (Parte B).
export type FaseInput = { c: string; pct: number; mes: number };
export type PlanOverride = {
  enganchePct: number; // 0–1
  contraPct: number; // 0–1
  meses: number; // nº de mensualidades intermedias
  fases?: FaseInput[]; // desglose del enganche (avanzado); suma = enganchePct
};

// Supuestos del Anexo (Parte C).
export type SupuestosAnexo = {
  plusvaliaAnual: number; plazoAnios: number; adr: number; ocupacion: number;
  comision: number; feeRenta: number; mantenimiento: number;
};

// ---- modelo del ANEXO ----
export type CompRow = { id: string; desarrollo: string; descripcion: string; m2: string; prM2: string; valor: string };

export type AnexoModel = {
  etapaClave: string;
  etapaNombre: string;
  unidadEtiqueta: string;
  recamaras: string;
  margenEstado: string; // proyeccion | confirmado
  esProyeccion: boolean;
  // 01 competitive set
  comps: CompRow[];
  compsAvg: { m2Total: string; m2: string; prM2: string; valor: string };
  sujeto: CompRow; // fila The Cliff Club (unidad)
  // 02 valor de entrada
  valorActualM2: string;
  descuento: string;
  valorEntradaM2: string;
  plusvaliaAnual: string;
  plusvalia5M2: string;
  margenVenta: string;
  // 03 compra-venta
  areaM2: string;
  valorActual: string;
  valorTotal: string;
  margenValorActualPct: string;
  margenValorActual: string;
  valorVentaM2: string;
  valorVenta: string;
  comisionPct: string;
  comision: string;
  ventaNeta: string;
  costo: string;
  margenFinal: string;
  margenFinalPct: string;
  // 04 renta
  adr: string;
  ocupacion: string;
  rentaMensual: string;
  feePct: string;
  fee: string;
  mantePct: string;
  mante: string;
  gastos: string;
  rentaNetaMensual: string;
  rentaAnio1: string;
  rentaAnio2: string;
  rentaTotal: string;
  // 05 compuesta
  utilidadRenta: string;
  utilidadVenta: string;
  utilidadTotal: string;
  // 06 flujo
  flujo: { concepto: string; total: string; anios: string[] }[];
  // 07 indicadores
  margenProyectado: string;
  inversion: string;
  utilidadProyectada: string;
  utilidadMasInversion: string;
  tir: string; // "21.77 %" o "—"
  tirNota: string;
  // 08 conclusión
  conclusion1: { titulo: string; texto: string };
  conclusion2: { titulo: string; texto: string };
  fecha: string;
};
