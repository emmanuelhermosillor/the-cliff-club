// Número a letras (español) para el importe total en los Términos y condiciones.
// Puro y sin estado; validado contra los importes verificados de FA/CR.

const UNIDADES = [
  "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete",
  "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés",
  "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
];
const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

function decenas(n: number): string {
  if (n < 30) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u ? `${DECENAS[d]} y ${UNIDADES[u]}` : DECENAS[d];
}

function grupo(n: number): string {
  // 0..999
  if (n === 0) return "";
  if (n === 100) return "cien";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const cen = CENTENAS[c];
  const rest = resto ? decenas(resto) : "";
  return [cen, rest].filter(Boolean).join(" ");
}

// Apócope antes de "mil"/"millones": uno→un, veintiuno→veintiún, …y uno→…y un.
function apocope(s: string): string {
  if (s.endsWith("veintiuno")) return s.slice(0, -9) + "veintiún";
  if (s.endsWith("uno")) return s.slice(0, -3) + "un";
  return s;
}

export function numeroALetras(valor: number): string {
  const n = Math.round(valor);
  if (n === 0) return "Cero";
  if (n < 0) return "Menos " + numeroALetras(-n).toLowerCase();

  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;
  const partes: string[] = [];

  if (millones) partes.push(millones === 1 ? "un millón" : `${apocope(grupo(millones))} millones`);
  if (miles) partes.push(miles === 1 ? "mil" : `${apocope(grupo(miles))} mil`);
  if (resto) partes.push(grupo(resto));

  const s = partes.join(" ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
