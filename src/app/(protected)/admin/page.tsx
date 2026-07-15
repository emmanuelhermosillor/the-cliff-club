import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EtapaForm, type EtapaRow } from "@/components/admin/EtapaForm";
import { UnidadForm, type UnidadRow } from "@/components/admin/UnidadForm";
import { SupuestosForm, type SupuestosRow } from "@/components/admin/SupuestosForm";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).maybeSingle();
  if (profile?.rol !== "admin") redirect("/cotizador");

  const [{ data: etapas }, { data: unidades }, { data: supuestos }] = await Promise.all([
    supabase.from("etapas").select("*").order("orden"),
    supabase.from("unidades").select("*").order("orden"),
    supabase.from("config_anexo").select("*").eq("id", 1).maybeSingle(),
  ]);

  return (
    <>
      <h1 className="view">Administración</h1>
      <p className="lead">
        Edita precios, descuentos, márgenes y estructura de pago de cada etapa, y las unidades con sus m².
        Los cambios aplican a las <b>nuevas</b> cotizaciones — las ya guardadas conservan su snapshot.
      </p>

      <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 26, margin: "18px 0 10px" }}>Supuestos del Anexo</h2>
      {supuestos && <SupuestosForm c={supuestos as SupuestosRow} />}

      <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 26, margin: "18px 0 10px" }}>Etapas</h2>
      {((etapas as EtapaRow[] | null) ?? []).map((e) => (
        <EtapaForm key={e.clave} etapa={e} />
      ))}

      <h2 style={{ fontFamily: "var(--display)", fontWeight: 500, fontSize: 26, margin: "28px 0 10px" }}>Unidades</h2>
      {((unidades as UnidadRow[] | null) ?? []).map((u) => (
        <UnidadForm key={u.clave} unidad={u} />
      ))}
      <UnidadForm unidad={null} />
    </>
  );
}
