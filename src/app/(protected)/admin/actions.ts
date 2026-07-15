"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminResult = { ok: boolean; msg: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const, msg: "Sesión expirada." };
  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).maybeSingle();
  if (profile?.rol !== "admin") return { supabase, ok: false as const, msg: "Requiere rol admin." };
  return { supabase, ok: true as const, msg: "" };
}

const s = (v: FormDataEntryValue | null) => (v == null ? null : String(v).trim() || null);
const numOrNull = (v: FormDataEntryValue | null) => {
  const t = s(v);
  if (t == null) return null;
  const x = Number(t);
  return Number.isFinite(x) ? x : null;
};
const intOrNull = (v: FormDataEntryValue | null) => {
  const x = numOrNull(v);
  return x == null ? null : Math.round(x);
};

function parseJsonField(v: FormDataEntryValue | null): { ok: boolean; value: unknown } {
  const t = s(v);
  if (t == null) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(t) };
  } catch {
    return { ok: false, value: null };
  }
}

export async function guardarEtapa(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, msg: gate.msg };
  const { supabase } = gate;

  const clave = s(formData.get("clave"));
  if (!clave) return { ok: false, msg: "Falta la clave de la etapa." };

  const fases = parseJsonField(formData.get("fases_enganche"));
  if (!fases.ok) return { ok: false, msg: "fases_enganche no es JSON válido." };
  const gracia = parseJsonField(formData.get("gracia_meses"));
  if (!gracia.ok) return { ok: false, msg: "gracia_meses no es JSON válido." };

  const patch = {
    nombre: s(formData.get("nombre")) ?? clave,
    tagline: s(formData.get("tagline")),
    descripcion: s(formData.get("descripcion")),
    orden: intOrNull(formData.get("orden")) ?? 0,
    descuento: numOrNull(formData.get("descuento")),
    precio_base_m2: numOrNull(formData.get("precio_base_m2")),
    precio_entrada_m2: numOrNull(formData.get("precio_entrada_m2")),
    enganche_pct: numOrNull(formData.get("enganche_pct")),
    intermedios_pct: numOrNull(formData.get("intermedios_pct")),
    intermedios_meses: intOrNull(formData.get("intermedios_meses")),
    contra_pct: numOrNull(formData.get("contra_pct")),
    fases_enganche: fases.value,
    gracia_meses: gracia.value,
    margen: numOrNull(formData.get("margen")),
    margen_estado: s(formData.get("margen_estado")) ?? "por_calcular",
    activa: formData.get("activa") === "on",
  };

  const { error } = await supabase.from("etapas").update(patch).eq("clave", clave);
  if (error) return { ok: false, msg: error.message };

  revalidatePath("/admin");
  revalidatePath("/cotizador");
  return { ok: true, msg: `Etapa ${clave} guardada.` };
}

export async function guardarUnidad(_prev: AdminResult, formData: FormData): Promise<AdminResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, msg: gate.msg };
  const { supabase } = gate;

  const clave = s(formData.get("clave"));
  if (!clave) return { ok: false, msg: "Falta la clave de la unidad." };

  const row = {
    clave,
    etiqueta: s(formData.get("etiqueta")) ?? clave,
    modelo: s(formData.get("modelo")),
    piso: intOrNull(formData.get("piso")),
    disponibilidad: s(formData.get("disponibilidad")) ?? "disponible",
    recamaras: s(formData.get("recamaras")),
    banos: s(formData.get("banos")),
    m2_interior: numOrNull(formData.get("m2_interior")),
    m2_terraza: numOrNull(formData.get("m2_terraza")),
    m2_ph: numOrNull(formData.get("m2_ph")) ?? 0,
    m2_jardin: numOrNull(formData.get("m2_jardin")) ?? 0,
    m2_bodega: numOrNull(formData.get("m2_bodega")),
    m2_total: numOrNull(formData.get("m2_total")),
    sqft_total: numOrNull(formData.get("sqft_total")),
    orden: intOrNull(formData.get("orden")) ?? 0,
    activa: formData.get("activa") === "on",
  };
  if (row.m2_total == null) return { ok: false, msg: "m² total es obligatorio." };
  if (!["disponible", "apartada", "vendida"].includes(row.disponibilidad)) {
    return { ok: false, msg: "Disponibilidad inválida." };
  }

  const { error } = await supabase.from("unidades").upsert(row, { onConflict: "clave" });
  if (error) return { ok: false, msg: error.message };

  revalidatePath("/admin");
  revalidatePath("/cotizador");
  return { ok: true, msg: `Unidad ${clave} guardada.` };
}
