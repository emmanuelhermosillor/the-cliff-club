import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProposalModel, AnexoModel } from "@/lib/catalogos";
import { ReDescarga } from "@/components/cotizador/ReDescarga";

type Datos = {
  cliente?: string; fecha?: string; unidad?: string;
  propuesta?: ProposalModel; anexo?: AnexoModel;
} | null;

export default async function CotizacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: c } = await supabase
    .from("cotizaciones")
    .select("id, folio, estado, datos, prospecto_id, prospectos(nombre)")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();

  const datos = c.datos as Datos;
  const prospecto = (c as unknown as { prospectos: { nombre: string } | null }).prospectos;

  return (
    <>
      <p className="lead" style={{ marginBottom: 6 }}>
        {c.prospecto_id ? <Link href={`/prospectos/${c.prospecto_id}`}>← {prospecto?.nombre ?? "Prospecto"}</Link> : <Link href="/cotizaciones">← Cotizaciones</Link>}
      </p>
      <h1 className="view">Cotización #{c.folio}</h1>
      <p className="lead">{datos?.propuesta?.etapa?.nombre ?? ""} · {datos?.unidad ?? datos?.propuesta?.unidad?.etiqueta ?? ""} · {prospecto?.nombre ?? datos?.cliente ?? ""}</p>

      <ReDescarga
        propuesta={datos?.propuesta ?? null}
        anexo={datos?.anexo ?? null}
        cliente={datos?.cliente ?? prospecto?.nombre ?? ""}
        fecha={datos?.fecha ?? ""}
        folio={c.folio as number}
      />
    </>
  );
}
