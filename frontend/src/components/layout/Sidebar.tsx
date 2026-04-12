"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const links = [
    { href: "/models", label: "Models", icon: "M3 3h18v18H3V3zm2 2v14h14V5H5z" },
  ];

  return (
    <div className="flex h-full w-60 flex-col border-r bg-gray-50">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/models" className="text-lg font-bold text-gray-900">
          FP&A
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(link.href)
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={link.icon} />
            </svg>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center justify-between rounded-md px-3 py-2">
          <div className="text-sm">
            <p className="font-medium text-gray-900 truncate">
              {user?.name || user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
