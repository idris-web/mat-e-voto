import { Form, useActionData, useNavigation, useOutletContext } from "react-router";
import type { Route } from "./+types/submit-tip";
import { db } from "~/lib/db.server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Send, CheckCircle } from "lucide-react";
import type { Translations } from "~/locales";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Submit a Tip - Premtimet" },
    { name: "description", content: "Help verify promises by submitting information" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const politicianName = formData.get("politicianName") as string;
  const promiseText = formData.get("promiseText") as string;
  const sourceUrl = formData.get("sourceUrl") as string;
  const submitterEmail = formData.get("submitterEmail") as string;
  const additionalNotes = formData.get("additionalNotes") as string;

  if (!promiseText) {
    return { error: "Promise text is required" };
  }

  await db.tip.create({
    data: {
      politicianName: politicianName || null,
      promiseText,
      sourceUrl: sourceUrl || null,
      submitterEmail: submitterEmail || null,
      additionalNotes: additionalNotes || null,
    },
  });

  return { success: true };
}

export default function SubmitTip({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { t } = useOutletContext<{ t: Translations }>();
  const isSubmitting = navigation.state === "submitting";

  if (actionData?.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t.tip.success}</h2>
              <Button asChild className="mt-4">
                <a href="/">{t.common.goHome}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t.tip.title}</CardTitle>
            <CardDescription>{t.tip.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-6">
              {actionData?.error && (
                <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
                  {actionData.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="politicianName">Politician Name</Label>
                <Input
                  id="politicianName"
                  name="politicianName"
                  placeholder="e.g., Albin Kurti"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promiseText">{t.tip.contentLabel} *</Label>
                <Textarea
                  id="promiseText"
                  name="promiseText"
                  placeholder={t.tip.contentPlaceholder}
                  required
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl">{t.tip.sourceUrlLabel}</Label>
                <Input
                  id="sourceUrl"
                  name="sourceUrl"
                  type="url"
                  placeholder={t.tip.sourceUrlPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  placeholder="Any additional context or information..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submitterEmail">{t.tip.emailLabel}</Label>
                <Input
                  id="submitterEmail"
                  name="submitterEmail"
                  type="email"
                  placeholder={t.tip.emailPlaceholder}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? t.common.loading : t.actions.submit}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
