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

export async function crearProspecto(input: ProspectoInput): Promise<{ ok: boolean; error?: string }> {
  const nombre = (input.nombre || "").trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
