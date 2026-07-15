import { createClient } from "@/lib/supabase/server";
import { ProspectosList, type ProspectoRow } from "@/components/prospectos/ProspectosList";
import { NuevoProspecto } from "@/components/prospectos/NuevoProspecto";

export default async function ProspectosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prospectos")
    .select("id, nombre, email, telefono, origen, estado, notas, created_at, cotizaciones(count)")
    .order("created_at", { ascending: false });

  const rows: ProspectoRow[] = ((data as unknown as (ProspectoRow & { cotizaciones: { count: number }[] })[]) ?? []).map((p) => ({
    ...p,
    nCotizaciones: p.cotizaciones?.[0]?.count ?? 0,
  }));

  return (
    <>
      <h1 className="view">Prospectos</h1>
      <p className="lead">
        {error ? `Error: ${error.message}` : `Tu cartera de prospectos. ${rows.length} registrados.`}
      </p>
      <div className="toolbar">
        <span />
        <NuevoProspecto />
      </div>
      <ProspectosList rows={rows} />
    </>
  );
}
