import { buildProposal } from "@/server/matriz";
import { Cotizador } from "@/components/cotizador/Cotizador";

// Precalcula la propuesta por defecto (Founders Access · 1 recámara) del lado servidor.
export default function CotizadorPage() {
  const initialModel = buildProposal("FA", "1");
  return <Cotizador initialModel={initialModel} />;
}
