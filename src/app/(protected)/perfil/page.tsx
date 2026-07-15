import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PerfilEditor } from "@/components/PerfilEditor";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: p } = await supabase
    .from("profiles")
    .select("nombre, telefono, puesto, whatsapp, rol")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <h1 className="view">Mi perfil</h1>
      <p className="lead">Tus datos aparecen en la propuesta como &ldquo;Preparada por&rdquo; y en el contacto. El vendedor legal sigue siendo Adria Capital.</p>
      <PerfilEditor p={{
        nombre: p?.nombre ?? "", telefono: p?.telefono ?? "", puesto: p?.puesto ?? "",
        whatsapp: p?.whatsapp ?? "", email: user.email ?? "", rol: p?.rol ?? "asesor",
      }} />
    </>
  );
}
