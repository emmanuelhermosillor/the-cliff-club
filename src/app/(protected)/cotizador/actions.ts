"use server";

import { buildProposal, buildAnexo } from "@/server/catalogo";
import type { ProposalModel, AnexoModel, UnidadInput } from "@/lib/catalogos";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Recalcula la propuesta en el servidor (las cifras nunca se confían al cliente).
export async function computeProposal(etapaClave: string, unidad: UnidadInput): Promise<ProposalModel> {
  return buildProposal(etapaClave, unidad);
}

export async function computeAnexo(etapaClave: string, unidad: UnidadInput, fecha: string): Promise<AnexoModel> {
  return buildAnexo(etapaClave, unidad, fecha);
}

export type ProspectoInput = { cliente: string; correo?: string; telefono?: string; origen?: string };
export type GuardarResult = { ok: boolean; folio?: number; error?: string };

// Empareja prospecto por correo → teléfono → nombre (B6, evita duplicados).
async function matchProspecto(
  supabase: SupabaseClient,
  nombre: string,
  correo?: string,
  telefono?: string,
): Promise<string | null> {
  if (correo) {
    const { data } = await supabase.from("prospectos").select("id").eq("email", correo).limit(1);
    if (data && data[0]) return data[0].id as string;
  }
  if (telefono) {
    const { data } = await supabase.from("prospectos").select("id").eq("telefono", telefono).limit(1);
    if (data && data[0]) return data[0].id as string;
  }
  const { data } = await supabase.from("prospectos").select("id").eq("nombre", nombre).limit(1);
  return data && data[0] ? (data[0].id as string) : null;
}

// Guarda en CRM: crea/actualiza el prospecto (con TODOS sus datos) e inserta la
// cotización con un snapshot inmutable — incluye los modelos congelados para re-descarga.
export async function guardarCotizacion(
  etapaClave: string,
  unidad: UnidadInput,
  prospecto: ProspectoInput,
  fecha: string,
): Promise<GuardarResult> {
  const nombre = (prospecto.cliente || "").trim();
  const correo = prospecto.correo?.trim() || undefined;
  const telefono = prospecto.telefono?.trim() || undefined;
  const origen = prospecto.origen?.trim() || undefined;
  if (nombre.length < 2 || nombre.startsWith("____")) {
    return { ok: false, error: "Escribe el nombre del cliente antes de guardar." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Vuelve a entrar." };

  let model: ProposalModel, anexoModel: AnexoModel;
  try {
    model = await buildProposal(etapaClave, unidad);
    anexoModel = await buildAnexo(etapaClave, unidad, fecha || "");
  } catch {
    return { ok: false, error: "Etapa o unidad no válida." };
  }

  // Prospecto: emparejar y actualizar, o crear (sin duplicar).
  let prospectoId = await matchProspecto(supabase, nombre, correo, telefono);
  if (prospectoId) {
    const patch: Record<string, string> = { nombre };
    if (correo) patch.email = correo;
    if (telefono) patch.telefono = telefono;
    if (origen) patch.origen = origen;
    await supabase.from("prospectos").update(patch).eq("id", prospectoId);
  } else {
    const { data: np, error: pe } = await supabase
      .from("prospectos")
      .insert({ nombre, email: correo ?? null, telefono: telefono ?? null, origen: origen ?? null, estado: "propuesta_enviada" })
      .select("id")
      .single();
    if (pe || !np) return { ok: false, error: "Error al crear prospecto: " + (pe?.message ?? "") };
    prospectoId = np.id;
  }

  const datos = {
    cliente: nombre,
    fecha,
    etapa: model.snapshot.etapa,
    unidad: model.snapshot.unidad,
    modelo: model.snapshot.modelo,
    valor_total: model.snapshot.valor_total,
    precio_m2: model.snapshot.precio_m2,
    descuento: model.snapshot.descuento,
    margen: model.snapshot.margen,
    margen_estado: model.snapshot.margen_estado,
    // modelos congelados para re-descarga (B5)
    propuesta: model,
    anexo: anexoModel,
  };

  const { data: cot, error } = await supabase
    .from("cotizaciones")
    .insert({
      prospecto_id: prospectoId,
      etapa: model.etapaClave,
      tipologia: model.unidadClave,
      unidad: model.snapshot.unidad,
      valor_total: model.snapshot.valor_total,
      precio_m2: model.snapshot.precio_m2,
      descuento: model.snapshot.descuento,
      datos,
      estado: "generada",
    })
    .select("folio")
    .single();

  if (error || !cot) return { ok: false, error: "Error al guardar: " + (error?.message ?? "") };
  return { ok: true, folio: cot.folio as number };
}
