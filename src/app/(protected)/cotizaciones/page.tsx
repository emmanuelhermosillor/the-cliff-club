import { createClient } from "@/lib/supabase/server";
import { ETAPA_NOMBRE, TIPO_NOMBRE, type EtapaKey, type TipoKey } from "@/lib/catalogos";

type Cotizacion = {
  id: string;
  folio: number;
  etapa: string;
  tipologia: string;
  valor_total: number | null;
  estado: string;
  created_at: string;
  prospectos: { nombre: string } | null;
};

const money = (n: number | null) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));

export default async function CotizacionesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cotizaciones")
    .select("id, folio, etapa, tipologia, valor_total, estado, created_at, prospectos(nombre)")
    .order("created_at", { ascending: false });

  const rows = (data as unknown as Cotizacion[] | null) ?? [];

  return (
    <>
      <h1 className="view">Cotizaciones</h1>
      <p className="lead">
        {error ? `Error: ${error.message}` : `Todas las cotizaciones generadas. ${rows.length} en total.`}
      </p>
      <table className="data">
        <thead>
          <tr><th>Folio</th><th>Prospecto</th><th>Etapa / tipología</th><th>Valor</th><th>Estado</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ color: "var(--warm)" }}>
                Aún no hay cotizaciones. Genera una en el Cotizador y pulsa &ldquo;Guardar en CRM&rdquo;.
              </td>
            </tr>
          ) : (
            rows.map((c) => (
              <tr key={c.id}>
                <td className="mono">#{c.folio}</td>
                <td><b>{c.prospectos?.nombre || "—"}</b></td>
                <td>
                  {ETAPA_NOMBRE[c.etapa as EtapaKey] || c.etapa} · {TIPO_NOMBRE[c.tipologia as TipoKey] || c.tipologia}
                </td>
                <td>{money(c.valor_total)}</td>
                <td><span className="tag">{c.estado}</span></td>
                <td className="mono" style={{ fontSize: "11px" }}>{(c.created_at || "").slice(0, 10)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
