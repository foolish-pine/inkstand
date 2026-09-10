"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 記事の作成・編集はダッシュボードの一部なので、そこにいる間も
// 「ダッシュボード」を現在地として扱う。
const navItems = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    prefixes: ["/dashboard/articles"],
  },
  { href: "/dashboard/purchases", label: "購入履歴", prefixes: [] },
  { href: "/dashboard/sales", label: "売上", prefixes: [] },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ダッシュボード" className="border-rule border-b">
      <ul className="mx-auto flex w-full max-w-3xl gap-8 px-6">
        {navItems.map(({ href, label, prefixes }) => {
          const isCurrent =
            pathname === href ||
            prefixes.some((prefix) => pathname.startsWith(prefix));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className={`focus-visible:outline-accent -mb-px block border-b-2 py-4 text-xs tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isCurrent
                    ? "border-accent text-foreground"
                    : "text-muted hover:text-foreground border-transparent"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
