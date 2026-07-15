import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Alta de usuarios (PREPARADO — no expuesto en la UI todavía; README §6).
 * Server-only: usa SUPABASE_SERVICE_ROLE_KEY, que NUNCA debe salir del servidor.
 * Solo un usuario con rol 'admin' puede invocarla.
 *
 * POST /api/admin/create-user  { email, password, nombre?, rol? }
 */
export async function POST(request: Request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor." },
      { status: 501 },
    );
  }

  // 1) Autorización: el que llama debe ser admin (sesión válida + profile.rol='admin').
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.rol !== "admin") {
    return NextResponse.json({ error: "Requiere rol admin." }, { status: 403 });
  }

  // 2) Alta con service_role.
  let body: { email?: string; password?: string; nombre?: string; rol?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const email = body.email?.trim();
  const password = body.password;
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Correo y contraseña (8+ caracteres) requeridos." }, { status: 400 });
  }

  const admin = createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre: body.nombre?.trim() || "" },
  });
  if (error || !created.user) {
    return NextResponse.json({ error: error?.message || "No se pudo crear el usuario." }, { status: 400 });
  }

  // 3) Ajustar rol si se pidió 'admin' (el trigger crea el profile como 'asesor' por defecto).
  if (body.rol === "admin") {
    await admin.from("profiles").update({ rol: "admin" }).eq("id", created.user.id);
  }

  return NextResponse.json({ ok: true, id: created.user.id, email });
}
