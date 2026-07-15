"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/cotizador", label: "Cotizador" },
  { href: "/prospectos", label: "Prospectos" },
  { href: "/cotizaciones", label: "Cotizaciones" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="top">
      {ITEMS.map((it) => (
        <Link key={it.href} href={it.href} className={pathname.startsWith(it.href) ? "active" : ""}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
