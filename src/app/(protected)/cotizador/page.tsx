import { getEtapasActivas, getUnidadesActivas, buildProposal } from "@/server/catalogo";
import { Cotizador } from "@/components/cotizador/Cotizador";

export default async function CotizadorPage() {
  const [etapas, unidades] = await Promise.all([getEtapasActivas(), getUnidadesActivas()]);

  if (etapas.length === 0 || unidades.length === 0) {
    return (
      <>
        <h1 className="view">Cotizador</h1>
        <p className="lead">
          No hay etapas o unidades activas en el catálogo. Actívalas desde{" "}
          <a href="/admin">el panel de administración</a>.
        </p>
      </>
    );
  }

  const initialModel = await buildProposal(etapas[0].clave, { tipo: "catalogo", clave: unidades[0].clave });

  return <Cotizador etapas={etapas} unidades={unidades} initialModel={initialModel} />;
}
