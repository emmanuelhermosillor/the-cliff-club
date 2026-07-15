import { getEtapasActivas, getUnidadesDisponibles, getInventario, getSupuestos } from "@/server/catalogo";
import { Cotizador } from "@/components/cotizador/Cotizador";

export default async function CotizadorPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [etapas, unidades, inventario, supuestosDefault] = await Promise.all([
    getEtapasActivas(), getUnidadesDisponibles(), getInventario(), getSupuestos(),
  ]);

  if (etapas.length === 0 || unidades.length === 0) {
    return (
      <>
        <h1 className="view">Cotizador</h1>
        <p className="lead">No hay etapas o unidades disponibles. Actívalas desde <a href="/admin">el panel de administración</a>.</p>
      </>
    );
  }

  const prefill = { cliente: sp.cliente, correo: sp.correo, telefono: sp.telefono, origen: sp.origen };

  return <Cotizador etapas={etapas} unidades={unidades} inventario={inventario} supuestosDefault={supuestosDefault} prefill={prefill} />;
}
