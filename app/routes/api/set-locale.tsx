import type { Route } from "./+types/set-locale";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "~/lib/constants";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const locale = formData.get("locale") as string;

  if (!SUPPORTED_LANGUAGES.includes(locale as SupportedLanguage)) {
    return new Response("Invalid locale", { status: 400 });
  }

  const referer = request.headers.get("Referer") || "/";

  return new Response(null, {
    status: 302,
    headers: {
      Location: referer,
      "Set-Cookie": `__matevoto_locale=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
    },
  });
}
