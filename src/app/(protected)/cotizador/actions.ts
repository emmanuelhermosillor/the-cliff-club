"use server";

import { buildProposal } from "@/server/catalogo";
import type { ProposalModel, UnidadInput } from "@/lib/catalogos";
import { createClient } from "@/lib/supabase/server";

// Recalcula la propuesta en el servidor (las cifras nunca se confían al cliente).
export async function computeProposal(etapaClave: string, unidad: UnidadInput): Promise<ProposalModel> {
  return buildProposal(etapaClave, unidad);
}

export type GuardarResult = { ok: boolean; folio?: number; error?: string };

// Guarda en CRM: busca/crea el prospecto por nombre e inserta la cotización con
// un snapshot inmutable en `datos`. RLS asegura que cada asesor solo toca lo suyo.
export async function guardarCotizacion(
  etapaClave: string,
  unidad: UnidadInput,
  cliente: string,
  fecha: string,
): Promise<GuardarResult> {
  const nombre = (cliente || "").trim();
  if (nombre.length < 2 || nombre.startsWith("____")) {
    return { ok: false, error: "Escribe el nombre del cliente antes de guardar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Vuelve a entrar." };

  let model: ProposalModel;
  try {
    model = await buildProposal(etapaClave, unidad);
  } catch {
    return { ok: false, error: "Etapa o unidad no válida." };
  }

  // Buscar prospecto por nombre (RLS lo limita al asesor) o crearlo.
  let prospectoId: string;
  const { data: prosp } = await supabase
    .from("prospectos")
    .select("id")
    .eq("nombre", nombre)
    .maybeSingle();

  if (prosp?.id) {
    prospectoId = prosp.id;
  } else {
    const { data: np, error: pe } = await supabase
      .from("prospectos")
      .insert({ nombre, estado: "propuesta_enviada" })
      .select("id")
      .single();
    if (pe || !np) return { ok: false, error: "Error al crear prospecto: " + (pe?.message ?? "") };
    prospectoId = np.id;
  }

  const snapshot = { ...model.snapshot, cliente: nombre, fecha };
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
      datos: snapshot,
      estado: "generada",
    })
    .select("folio")
    .single();

  if (error || !cot) return { ok: false, error: "Error al guardar: " + (error?.message ?? "") };
  return { ok: true, folio: cot.folio as number };
}
