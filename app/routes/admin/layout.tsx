import { Link, Outlet, redirect, useLoaderData, useLocation } from "react-router";
import type { Route } from "./+types/layout";
import { requireEditor, type AuthUser } from "~/lib/auth.server";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Building,
  LogOut,
  Menu,
  X,
  Vote,
} from "lucide-react";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireEditor(request);
  return { user };
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/statements", label: "Statements", icon: FileText },
  { href: "/admin/positions", label: "Positions", icon: Vote },
  { href: "/admin/parties", label: "Parties", icon: Building },
];

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };


  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 z-50 md:hidden bg-white dark:bg-gray-900 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 md:relative md:translate-x-0 pt-16 md:pt-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <p className="font-medium text-gray-900 dark:text-white">
              {user.name || user.email}
            </p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <form action="/auth/logout" method="post">
              <Button variant="ghost" className="w-full justify-start" type="submit">
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
