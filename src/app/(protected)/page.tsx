import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PROSPECTO } from "@/lib/catalogos";

const money = (n: number | null) => (n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US"));
const ORDEN = ["nuevo", "contactado", "propuesta_enviada", "seguimiento", "cerrado_ganado", "cerrado_perdido"];

type Prospecto = { id: string; nombre: string; estado: string; updated_at: string; email: string | null };
type Cot = { id: string; folio: number; valor_total: number | null; estado: string; created_at: string; datos: { etapa?: string; unidad?: string } | null; prospectos: { nombre: string } | null };

export default async function Home() {
  const supabase = await createClient();
  const [{ data: prospData }, { data: cotData }] = await Promise.all([
    supabase.from("prospectos").select("id, nombre, estado, updated_at, email").order("updated_at", { ascending: false }),
    supabase.from("cotizaciones").select("id, folio, valor_total, estado, created_at, datos, prospectos(nombre)").order("created_at", { ascending: false }).limit(8),
  ]);
  const prospectos = (prospData as Prospecto[] | null) ?? [];
  const cots = (cotData as unknown as Cot[] | null) ?? [];

  const hace5dias = Date.now() - 5 * 24 * 60 * 60 * 1000;
  const sinSeguimiento = prospectos.filter((p) => p.estado === "propuesta_enviada" && new Date(p.updated_at).getTime() < hace5dias);
  const porEstado = (e: string) => prospectos.filter((p) => p.estado === e);

  return (
    <>
      <h1 className="view">Inicio</h1>
      <p className="lead">Tu pipeline: prospectos por estado y cotizaciones recientes. <Link href="/cotizador">+ Nueva cotización</Link></p>

      {sinSeguimiento.length > 0 && (
        <div className="fr-banner" style={{ background: "#f4e6df", borderColor: "#d9b7a8" }}>
          <b>{sinSeguimiento.length}</b> prospecto{sinSeguimiento.length === 1 ? "" : "s"} en propuesta enviada sin seguimiento en 5+ días:{" "}
          {sinSeguimiento.slice(0, 6).map((p, i) => (
            <span key={p.id}>{i > 0 ? ", " : ""}<Link href={`/prospectos/${p.id}`}>{p.nombre}</Link></span>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {ORDEN.map((e) => {
          const list = porEstado(e);
          return (
            <div key={e} className="panel" style={{ padding: 14 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--warm)", marginBottom: 8 }}>
                {ESTADOS_PROSPECTO[e]} · {list.length}
              </div>
              {list.slice(0, 6).map((p) => (
                <div key={p.id} style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                  <Link href={`/prospectos/${p.id}`} style={{ fontSize: 14 }}>{p.nombre}</Link>
                </div>
              ))}
              {list.length === 0 && <div className="note">—</div>}
            </div>
          );
        })}
      </div>

      <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 24, margin: "0 0 10px" }}>Cotizaciones recientes</h2>
      <table className="data">
        <thead><tr><th>Folio</th><th>Prospecto</th><th>Etapa / unidad</th><th>Valor</th><th>Fecha</th><th></th></tr></thead>
        <tbody>
          {cots.length === 0 ? (
            <tr><td colSpan={6} style={{ color: "var(--warm)" }}>Aún no hay cotizaciones.</td></tr>
          ) : cots.map((c) => (
            <tr key={c.id}>
              <td className="mono">#{c.folio}</td>
              <td><b>{c.prospectos?.nombre ?? "—"}</b></td>
              <td>{c.datos?.etapa ?? "—"} · {c.datos?.unidad ?? "—"}</td>
              <td>{money(c.valor_total)}</td>
              <td className="mono" style={{ fontSize: 11 }}>{(c.created_at || "").slice(0, 10)}</td>
              <td style={{ textAlign: "right" }}><Link className="btn ghost sm" href={`/cotizaciones/${c.id}`}>Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
