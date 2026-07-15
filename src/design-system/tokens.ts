// The Cliff Club — brand tokens (source of truth, mirrors tokens.css / @theme in globals.css).
// Silent-luxury: low contrast, luminous, generous air. Concept: "The Art of Being".
export const tokens = {
  color: {
    blue: "#6B9DA1", // Blue Rivera (primario)
    mist: "#C3D1DF", // Coastal Mist
    shell: "#FBF5EE", // Shell White (fondo)
    sand: "#CABBA8", // Desert Sand
    warm: "#BFB3AA", // Warm Gray
    moss: "#C9CDBE", // Moss
    ink: "#2A2724", // tinta
    line: "#D8D2C7",
  },
  font: {
    // Fallback tipográfico. Ideal (de pago): IvyOra Display / IvyOra Text / Söhne Mono.
    display: "'Cormorant Garamond', Georgia, serif",
    text: "'EB Garamond', Georgia, serif",
    mono: "'Space Mono', ui-monospace, monospace",
  },
} as const;
