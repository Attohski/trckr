"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/shipments", label: "Shipments" },
  { href: "/expenses", label: "Expenses" },
  { href: "/payments", label: "Payments" },
  { href: "/clients", label: "Clients" },
  { href: "/analytics", label: "Analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-black text-neutral-400 flex flex-col border-r border-neutral-800">
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white">trckr</h1>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}className={`flex items-center px-6 py-2.5 text-sm transition-colors ${
  active
    ? "bg-neutral-900 text-white border-r-2 border-white"
    : "hover:bg-neutral-900 hover:text-white"
}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
        v1.0
      </div>
    </aside>
  );
}