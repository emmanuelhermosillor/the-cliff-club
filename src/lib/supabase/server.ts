import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cliente de servidor (Server Components, Route Handlers, Server Actions).
// En Next.js 16 cookies() es asíncrono.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll llamado desde un Server Component: lo maneja el proxy al refrescar la sesión.
          }
        },
      },
    },
  );
}
