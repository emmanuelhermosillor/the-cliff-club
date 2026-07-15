"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function actualizarPerfil(patch: {
  nombre?: string; telefono?: string; puesto?: string; whatsapp?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const upd: Record<string, string | null> = {};
  if (patch.nombre !== undefined) upd.nombre = patch.nombre.trim() || null;
  if (patch.telefono !== undefined) upd.telefono = patch.telefono.trim() || null;
  if (patch.puesto !== undefined) upd.puesto = patch.puesto.trim() || null;
  if (patch.whatsapp !== undefined) upd.whatsapp = patch.whatsapp.trim() || null;

  const { error } = await supabase.from("profiles").update(upd).eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/perfil");
  return { ok: true };
}
