"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import clsx from "clsx";
import { SignOutButton } from "@/modules/auth/ui/sign-out-button";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string;
  orgName?: string;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/events", label: "Eventos" },
  { href: "/orders", label: "Pedidos" },
  { href: "/inventory", label: "Inventario" },
  { href: "/staff", label: "Staff" },
  { href: "/settings", label: "Ajustes" }
];

export const AppShell = ({ children, userEmail, orgName }: AppShellProps) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-sm font-semibold text-brand-800">
            CO
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              ChefOS Dashboard
            </p>
            <p className="text-xs text-slate-600">{orgName ?? "Org activa"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-700">
          <span className="rounded-lg bg-slate-100 px-2 py-1">
            {userEmail ?? "Sesión"}
          </span>
          <SignOutButton />
        </div>
      </header>
      <div className="grid grid-cols-[240px_1fr] gap-0">
        <aside className="hidden min-h-[calc(100vh-56px)] border-r border-slate-200 bg-white/70 px-4 py-6 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center rounded-lg px-3 py-2 text-sm transition",
                    active
                      ? "bg-brand-50 text-brand-800 ring-1 ring-brand-100"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
};
