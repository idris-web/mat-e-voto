import { Link } from "react-router";
import { Sliders } from "lucide-react";
import { Button } from "~/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import type { Translations } from "~/locales";
import type { AuthUser } from "~/lib/auth.server";

interface HeaderProps {
  t: Translations;
  user: AuthUser | null;
  locale: string;
}

export function Header({ t, user, locale }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              mat<span className="text-emerald-500">-e-</span>voto
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle />

            {user && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  <Sliders className="h-4 w-4" />
                  <span className="sr-only">{t.nav.admin}</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
