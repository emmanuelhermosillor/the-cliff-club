import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PROSPECTO } from "@/lib/catalogos";
import { ProspectoEditor, type ProspectoData } from "@/components/prospectos/ProspectoEditor";

const money = (n: number | null) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));

type Cot = {
  id: string; folio: number; estado: string; valor_total: number | null; created_at: string;
  datos: { etapa?: string; unidad?: string } | null;
};

export default async function FichaProspecto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("prospectos")
    .select("id, nombre, email, telefono, origen, estado, notas, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const { data: cotsData } = await supabase
    .from("cotizaciones")
    .select("id, folio, estado, valor_total, created_at, datos")
    .eq("prospecto_id", id)
    .order("created_at", { ascending: false });
  const cots = (cotsData as unknown as Cot[] | null) ?? [];

  const historial = [
    ...cots.map((c) => ({ fecha: c.created_at, texto: `Cotización #${c.folio} · ${c.datos?.etapa ?? ""} · ${c.datos?.unidad ?? ""} · ${money(c.valor_total)}` })),
    { fecha: (p as ProspectoData & { created_at: string }).created_at, texto: "Prospecto creado" },
  ].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <>
      <p className="lead" style={{ marginBottom: 6 }}><Link href="/prospectos">← Prospectos</Link></p>
      <h1 className="view">{p.nombre} <span className="tag" style={{ verticalAlign: "middle" }}>{ESTADOS_PROSPECTO[p.estado] ?? p.estado}</span></h1>
      <p className="lead">
        {p.email || "sin correo"} · {p.telefono || "sin teléfono"} · {p.origen || "sin origen"}
        {"  "}
        <Link className="btn sm" style={{ marginLeft: 10 }} href={`/cotizador?cliente=${encodeURIComponent(p.nombre)}&correo=${encodeURIComponent(p.email ?? "")}&telefono=${encodeURIComponent(p.telefono ?? "")}&origen=${encodeURIComponent(p.origen ?? "")}`}>+ Nueva cotización</Link>
      </p>

      <ProspectoEditor p={p as ProspectoData} />

      <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 22, margin: "6px 0 10px" }}>Cotizaciones ({cots.length})</h2>
      <table className="data" style={{ marginBottom: 24 }}>
        <thead><tr><th>Folio</th><th>Etapa / unidad</th><th>Valor</th><th>Estado</th><th>Fecha</th><th></th></tr></thead>
        <tbody>
          {cots.length === 0 ? (
            <tr><td colSpan={6} style={{ color: "var(--warm)" }}>Sin cotizaciones. Genera una en el Cotizador.</td></tr>
          ) : cots.map((c) => (
            <tr key={c.id}>
              <td className="mono">#{c.folio}</td>
              <td>{c.datos?.etapa ?? "—"} · {c.datos?.unidad ?? "—"}</td>
              <td>{money(c.valor_total)}</td>
              <td><span className="tag">{c.estado}</span></td>
              <td className="mono" style={{ fontSize: 11 }}>{(c.created_at || "").slice(0, 10)}</td>
              <td style={{ textAlign: "right" }}><Link className="btn ghost sm" href={`/cotizaciones/${c.id}`}>Ver / descargar</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 22, margin: "6px 0 10px" }}>Historial</h2>
      <div className="panel">
        {historial.map((h, i) => (
          <div key={i} className="kv" style={{ borderBottomColor: "var(--line)" }}>
            <span className="k">{(h.fecha || "").slice(0, 10)}</span>
            <span className="val" style={{ textAlign: "right" }}>{h.texto}</span>
          </div>
        ))}
      </div>
    </>
  );
}
