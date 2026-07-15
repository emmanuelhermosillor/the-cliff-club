// Reference preset (Tailwind v3 shape). This project runs Tailwind v4, which is
// CSS-first: the live theme is defined via @theme in src/app/globals.css.
// Kept here as the portable source of truth for tokens / utility names.
module.exports = {
  theme: { extend: {
    colors: { galeria:"#F6F5F1", grafito:"#1A1B18", salvia:"#7B8A6F", "salvia-dark":"#63735A", nacar:"#EDEBE4", piedra:"#B9B6AC", linea:"#DCDAD0" },
    fontFamily: {
      display: ["var(--font-display)","Cormorant Garamond","serif"],
      body: ["var(--font-body)","Manrope","sans-serif"],
      mono: ["var(--font-mono)","IBM Plex Mono","monospace"],
    },
    letterSpacing: { label:"0.26em", brand:"0.09em" },
  }},
};
