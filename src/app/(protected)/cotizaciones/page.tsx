import { createClient } from "@/lib/supabase/server";
import { CotizacionesList, type CotRow } from "@/components/cotizaciones/CotizacionesList";

type Raw = {
  id: string; folio: number; etapa: string; tipologia: string;
  valor_total: number | null; estado: string; created_at: string;
  datos: { etapa?: string; unidad?: string } | null;
  prospectos: { nombre: string } | null;
};

export default async function CotizacionesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("id, folio, etapa, tipologia, valor_total, estado, created_at, datos, prospectos(nombre)")
    .order("created_at", { ascending: false });

  const raw = (data as unknown as Raw[] | null) ?? [];
  const rows: CotRow[] = raw.map((c) => ({
    id: c.id, folio: c.folio, estado: c.estado, valor_total: c.valor_total, created_at: c.created_at,
    etapaNombre: c.datos?.etapa || c.etapa, unidad: c.datos?.unidad || c.tipologia,
    prospecto: c.prospectos?.nombre ?? "",
  }));

  return (
    <>
      <h1 className="view">Cotizaciones</h1>
      <p className="lead">
        {error ? `Error: ${error.message}` : `Todas las cotizaciones generadas. ${rows.length} en total.`}
      </p>
      <CotizacionesList rows={rows} />
    </>
  );
}
