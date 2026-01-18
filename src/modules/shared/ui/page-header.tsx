"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

const crumbFromPath = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "inicio";
  return segments.join(" / ");
};

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  const pathname = usePathname();
  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-slate-100 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {crumbFromPath(pathname)}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className={clsx("flex items-center gap-2", "text-sm")}>
          {actions}
        </div>
      ) : null}
    </div>
  );
};
