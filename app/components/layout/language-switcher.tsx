import { useFetcher } from "react-router";
import { Globe } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { LANGUAGE_NAMES, type SupportedLanguage } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface LanguageSwitcherProps {
  locale: string;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const fetcher = useFetcher();

  const currentLang = LANGUAGE_NAMES[locale as SupportedLanguage] || LANGUAGE_NAMES.sq;

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    fetcher.submit(
      { locale: langCode },
      { method: "post", action: "/api/set-locale" }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLang.flag} {currentLang.name}
          </span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.entries(LANGUAGE_NAMES) as [SupportedLanguage, { name: string; flag: string }][]).map(
          ([code, lang]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={cn(
                "cursor-pointer",
                code === locale && "bg-gray-100 dark:bg-gray-800"
              )}
            >
              {lang.flag} {lang.name}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
