"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABLES } from "@/lib/tables";

const core: [string, string][] = [
  ["/admin", "dashboard"],
  ["/admin/users", "users"],
  ["/admin/captions", "captions"],
  ["/admin/votes", "votes"],
];

const groups: Record<string, { href: string; label: string }[]> = {};
for (const t of Object.values(TABLES)) {
  (groups[t.group] ??= []).push({
    href: `/admin/manage/${t.slug}`,
    label: t.title.toLowerCase(),
  });
}

export default function Nav() {
  const path = usePathname();
  let n = 0;

  const link = (href: string, label: string) => {
    n++;
    const on = href === "/admin" ? path === href : path.startsWith(href);
    return (
      <Link key={href} href={href} className={`navlink ${on ? "on" : ""}`}>
        <span className={on ? "" : "opacity-50"}>{String(n).padStart(2, "0")}</span>
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-1">
      {core.map(([href, label]) => link(href, label))}
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="mt-4 flex flex-col gap-1">
          <div className="label slashes">{group}</div>
          {items.map((i) => link(i.href, i.label))}
        </div>
      ))}
    </nav>
  );
}