"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProspectoInput = {
  nombre: string;
  email?: string;
  telefono?: string;
  origen?: string;
  estado?: string;
  notas?: string;
};

const ESTADOS = ["nuevo", "contactado", "propuesta_enviada", "seguimiento", "cerrado_ganado", "cerrado_perdido"];

export async function crearProspecto(input: ProspectoInput): Promise<{ ok: boolean; error?: string }> {
  const nombre = (input.nombre || "").trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Vuelve a entrar." };

  const { error } = await supabase.from("prospectos").insert({
    nombre,
    email: input.email?.trim() || null,
    telefono: input.telefono?.trim() || null,
    origen: input.origen?.trim() || null,
    estado: input.estado || "nuevo",
    notas: input.notas?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/prospectos");
  return { ok: true };
}

// B3 — editar datos + estado.
export async function actualizarProspecto(
  id: string,
  patch: { nombre?: string; email?: string; telefono?: string; origen?: string; notas?: string; estado?: string },
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };
  if (patch.estado && !ESTADOS.includes(patch.estado)) return { ok: false, error: "Estado inválido." };

  const upd: Record<string, string | null> = {};
  if (patch.nombre !== undefined) upd.nombre = patch.nombre.trim() || null;
  if (patch.email !== undefined) upd.email = patch.email.trim() || null;
  if (patch.telefono !== undefined) upd.telefono = patch.telefono.trim() || null;
  if (patch.origen !== undefined) upd.origen = patch.origen.trim() || null;
  if (patch.notas !== undefined) upd.notas = patch.notas.trim() || null;
  if (patch.estado !== undefined) upd.estado = patch.estado;

  const { error } = await supabase.from("prospectos").update(upd).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/prospectos");
  revalidatePath(`/prospectos/${id}`);
  return { ok: true };
}

// B2 — eliminar con cascada (borra sus cotizaciones primero). RLS limita a dueño/admin.
export async function eliminarProspecto(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { error: e1 } = await supabase.from("cotizaciones").delete().eq("prospecto_id", id);
  if (e1) return { ok: false, error: "No se pudieron borrar las cotizaciones: " + e1.message };
  const { error: e2 } = await supabase.from("prospectos").delete().eq("id", id);
  if (e2) return { ok: false, error: e2.message };

  revalidatePath("/prospectos");
  return { ok: true };
}
