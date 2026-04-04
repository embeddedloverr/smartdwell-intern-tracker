"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Users, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/mentor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mentor/interns", label: "Manage Interns", icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-sdw-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="font-semibold text-lg">Smartdwell</h1>
              <p className="text-xs text-white/60 -mt-1">Mentor Dashboard</p>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const active =
                  item.href === "/mentor"
                    ? pathname === "/mentor"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
