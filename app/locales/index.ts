import sq from "./sq";
import sr from "./sr";
import en from "./en";

export const resources = {
  sq,
  sr,
  en,
} as const;

export type Locale = keyof typeof resources;
export type Translations = typeof sq;

export function getTranslations(locale: Locale): Translations {
  return resources[locale] || resources.sq;
}

export { sq, sr, en };
