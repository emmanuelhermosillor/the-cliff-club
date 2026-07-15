import { createClient } from "@/lib/supabase/server";
import { ESTADOS_PROSPECTO } from "@/lib/catalogos";
import { NuevoProspecto } from "@/components/prospectos/NuevoProspecto";

type Prospecto = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  origen: string | null;
  estado: string;
};

export default async function ProspectosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prospectos")
    .select("id, nombre, email, telefono, origen, estado")
    .order("created_at", { ascending: false });

  const rows = (data as Prospecto[] | null) ?? [];

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
      <table className="data">
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Origen</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={5} style={{ color: "var(--warm)" }}>Sin prospectos aún.</td></tr>
          ) : (
            rows.map((p) => (
              <tr key={p.id}>
                <td><b>{p.nombre}</b></td>
                <td>{p.email || "—"}</td>
                <td>{p.telefono || "—"}</td>
                <td>{p.origen || "—"}</td>
                <td><span className="tag">{ESTADOS_PROSPECTO[p.estado] || p.estado}</span></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
