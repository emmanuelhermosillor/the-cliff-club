/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/Nav";
import { SignOutButton } from "@/components/SignOutButton";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .maybeSingle();

  const nombre = profile?.nombre || user.email || "";
  const isAdmin = profile?.rol === "admin";
  const rol = isAdmin ? "Admin" : "Asesor";

  return (
    <>
      <header className="top">
        <img className="wm" src="/brand/logo_wordmark.png" alt="The Cliff Club" />
        <Nav isAdmin={isAdmin} />
        <span className="spacer" />
        <span className="who">
          {nombre} · {rol}
        </span>
        <SignOutButton />
      </header>
      <main>{children}</main>
    </>
  );
}
