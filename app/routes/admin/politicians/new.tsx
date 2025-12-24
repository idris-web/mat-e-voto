import { Form, redirect, useActionData, useLoaderData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { slugify } from "~/lib/utils";
import { Card, CardContent } from "~/components/ui/card";
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

export function meta({}: Route.MetaArgs) {
  return [{ title: "New Politician - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);
  const parties = await db.party.findMany({ orderBy: { shortName: "asc" } });
  return { parties };
}

export async function action({ request }: Route.ActionArgs) {
  await requireEditor(request);

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const nameEn = formData.get("nameEn") as string;
  const partyId = formData.get("partyId") as string;
  const currentPosition = formData.get("currentPosition") as string;
  const currentPositionEn = formData.get("currentPositionEn") as string;
  const photoUrl = formData.get("photoUrl") as string;
  const bio = formData.get("bio") as string;
  const bioEn = formData.get("bioEn") as string;
  const twitterHandle = formData.get("twitterHandle") as string;
  const facebookUrl = formData.get("facebookUrl") as string;
  const instagramHandle = formData.get("instagramHandle") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const isActive = formData.get("isActive") === "true";

  if (!name) {
    return { error: "Name is required" };
  }

  // Generate unique slug
  let slug = slugify(name);
  const existingSlug = await db.politician.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const politician = await db.politician.create({
    data: {
      slug,
      name,
      nameEn: nameEn || null,
      partyId: partyId || null,
      currentPosition: currentPosition || null,
      currentPositionEn: currentPositionEn || null,
      photoUrl: photoUrl || null,
      bio: bio || null,
      bioEn: bioEn || null,
      twitterHandle: twitterHandle || null,
      facebookUrl: facebookUrl || null,
      instagramHandle: instagramHandle || null,
      websiteUrl: websiteUrl || null,
      isActive,
    },
  });

  return redirect(`/admin/politicians/${politician.id}/edit`);
}

export default function NewPolitician({ loaderData, actionData }: Route.ComponentProps) {
  const { parties } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/admin/politicians">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Politician</h1>
      </div>

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">
                {actionData.error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Albanian) *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  placeholder="English name if different"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Party</Label>
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="isActive" defaultValue="true">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position (Albanian)</Label>
                <Input
                  id="currentPosition"
                  name="currentPosition"
                  placeholder="e.g., Prime Minister"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPositionEn">Current Position (English)</Label>
                <Input
                  id="currentPositionEn"
                  name="currentPositionEn"
                  placeholder="e.g., Prime Minister"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                name="photoUrl"
                type="url"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biography (Albanian)</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="Short biography..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bioEn">Biography (English)</Label>
              <Textarea
                id="bioEn"
                name="bioEn"
                rows={4}
                placeholder="English biography..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  name="twitterHandle"
                  placeholder="@username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramHandle">Instagram Handle</Label>
                <Input
                  id="instagramHandle"
                  name="instagramHandle"
                  placeholder="@username"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  id="facebookUrl"
                  name="facebookUrl"
                  type="url"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button asChild variant="outline">
                <Link to="/admin/politicians">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Politician"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
