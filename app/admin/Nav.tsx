"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "dashboard"],
  ["/admin/users", "users"],
  ["/admin/captions", "captions"],
  ["/admin/votes", "votes"],
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {items.map(([href, label], i) => {
        const on = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`navlink ${on ? "on" : ""}`}>
            <span className={on ? "" : "opacity-50"}>0{i + 1}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}