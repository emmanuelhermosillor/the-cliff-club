import { getEtapasActivas, getUnidadesDisponibles } from "@/server/catalogo";
import { Cotizador } from "@/components/cotizador/Cotizador";

export default async function CotizadorPage() {
  const [etapas, unidades] = await Promise.all([getEtapasActivas(), getUnidadesDisponibles()]);

  if (etapas.length === 0 || unidades.length === 0) {
    return (
      <>
        <h1 className="view">Cotizador</h1>
        <p className="lead">
          No hay etapas o unidades disponibles en el catálogo. Actívalas desde{" "}
          <a href="/admin">el panel de administración</a>.
        </p>
      </>
    );
  }

  return <Cotizador etapas={etapas} unidades={unidades} />;
}
