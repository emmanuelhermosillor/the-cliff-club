import "server-only";

/**
 * Constantes confidenciales y helpers de formato. server-only.
 * Las etapas/unidades ahora viven en el catálogo editable de Supabase
 * (ver src/server/catalogo.ts). Aquí quedan solo los datos que NO se editan
 * desde el panel: calendario de amortización, datos bancarios y formateadores.
 */

// Datos bancarios para el depósito (nunca al cliente en el bundle).
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

// Calendario de amortización — 36 meses desde 30/07/2026.
export const FECHAS = [
  "30/07/2026", "31/08/2026", "30/09/2026", "31/10/2026", "30/11/2026", "31/12/2026",
  "31/01/2027", "28/02/2027", "31/03/2027", "30/04/2027", "31/05/2027", "30/06/2027",
  "31/07/2027", "31/08/2027", "30/09/2027", "31/10/2027", "30/11/2027", "31/12/2027",
  "31/01/2028", "29/02/2028", "31/03/2028", "30/04/2028", "31/05/2028", "30/06/2028",
  "31/07/2028", "31/08/2028", "30/09/2028", "31/10/2028", "30/11/2028", "31/12/2028",
  "31/01/2029", "28/02/2029", "31/03/2029", "30/04/2029", "31/05/2029", "30/06/2029",
];

// 1 m² = 10.7639104 sqft (para derivar sqft por componente).
export const SQFT_POR_M2 = 10.7639104;

// ---- formateadores ----
export const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const num = (n: number) => Math.round(n).toLocaleString("en-US");
// Millones con 2 decimales para que utilidad/inversión conserven el margen
// (evita "$1.2M sobre $1.2M" que se leería 100% en vez de 106%).
export const millones = (n: number) => (n / 1_000_000).toFixed(2) + "M";
