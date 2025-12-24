import { useOutletContext } from "react-router";
import type { Route } from "./+types/about";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Translations } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About - Premtimet" },
    { name: "description", content: "About the Premtimet project" },
  ];
}

export default function About() {
  const { t } = useOutletContext<{ t: Translations }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {t.about.title}
        </h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t.about.mission}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                {t.about.missionText}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.about.howItWorks}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                {t.about.howItWorksText}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.about.contact}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Email: contact@premtimet.org
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
