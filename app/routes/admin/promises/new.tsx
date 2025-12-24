import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { slugify } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "New Promise - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);

  const [politicians, parties, topics] = await Promise.all([
    db.politician.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { party: true },
    }),
    db.party.findMany({ orderBy: { shortName: "asc" } }),
    db.topic.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { politicians, parties, topics };
}

export async function action({ request }: Route.ActionArgs) {
  await requireEditor(request);

  const formData = await request.formData();
  const summary = formData.get("summary") as string;
  const textOriginal = formData.get("textOriginal") as string;
  const textEnglish = formData.get("textEnglish") as string;
  const politicianId = formData.get("politicianId") as string;
  const partyId = formData.get("partyId") as string;
  const topicId = formData.get("topicId") as string;
  const sourceUrl = formData.get("sourceUrl") as string;
  const archiveUrl = formData.get("archiveUrl") as string;
  const sourceType = formData.get("sourceType") as string;
  const datePromised = formData.get("datePromised") as string;
  const context = formData.get("context") as string;

  if (!summary || !textOriginal || !topicId || !sourceUrl || !sourceType || !datePromised) {
    return { error: "Required fields are missing" };
  }

  // Generate unique slug
  let slug = slugify(summary);
  const existingSlug = await db.promise.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const promise = await db.promise.create({
    data: {
      slug,
      summary,
      textOriginal,
      textEnglish: textEnglish || null,
      politicianId: politicianId || null,
      partyId: partyId || null,
      topicId,
      sourceUrl,
      archiveUrl: archiveUrl || null,
      sourceType: sourceType as any,
      datePromised: new Date(datePromised),
      context: context || null,
    },
  });

  return redirect(`/admin/promises/${promise.id}/edit`);
}

export default function NewPromise({ loaderData, actionData }: Route.ComponentProps) {
  const { politicians, parties, topics } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/admin/promises">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Promise</h1>
      </div>

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
                {actionData.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Input
                id="summary"
                name="summary"
                required
                placeholder="Short summary of the promise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textOriginal">Original Quote (Albanian) *</Label>
              <Textarea
                id="textOriginal"
                name="textOriginal"
                required
                rows={4}
                placeholder="The original promise in Albanian"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textEnglish">English Translation</Label>
              <Textarea
                id="textEnglish"
                name="textEnglish"
                rows={4}
                placeholder="English translation (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="politicianId">Politician</Label>
                <Select name="politicianId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select politician" />
                  </SelectTrigger>
                  <SelectContent>
                    {politicians.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.party && `(${p.party.shortName})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partyId">Party</Label>
                <Select name="partyId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select party" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.shortName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicId">Topic *</Label>
              <Select name="topicId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceType">Source Type *</Label>
                <Select name="sourceType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAMPAIGN_SPEECH">Campaign Speech</SelectItem>
                    <SelectItem value="INTERVIEW">Interview</SelectItem>
                    <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                    <SelectItem value="PARTY_PROGRAM">Party Program</SelectItem>
                    <SelectItem value="PARLIAMENT_SESSION">Parliament Session</SelectItem>
                    <SelectItem value="PRESS_CONFERENCE">Press Conference</SelectItem>
                    <SelectItem value="OFFICIAL_DOCUMENT">Official Document</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="datePromised">Date Promised *</Label>
                <Input
                  id="datePromised"
                  name="datePromised"
                  type="date"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL *</Label>
              <Input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                required
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="archiveUrl">Archive URL (Wayback Machine)</Label>
              <Input
                id="archiveUrl"
                name="archiveUrl"
                type="url"
                placeholder="https://web.archive.org/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Context</Label>
              <Textarea
                id="context"
                name="context"
                rows={3}
                placeholder="Additional context about when/where this promise was made"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button asChild variant="outline">
                <Link to="/admin/promises">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Promise"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
