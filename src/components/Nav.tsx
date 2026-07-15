"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/cotizador", label: "Cotizador" },
  { href: "/prospectos", label: "Prospectos" },
  { href: "/cotizaciones", label: "Cotizaciones" },
];

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = [...ITEMS, ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []), { href: "/perfil", label: "Mi perfil" }];
  return (
    <nav className="top">
      {items.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={active ? "active" : ""}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
