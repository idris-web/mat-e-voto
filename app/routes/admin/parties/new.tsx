import { Form, redirect, useActionData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/new";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { slugify } from "~/lib/utils";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "New Party - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireEditor(request);

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const nameEn = formData.get("nameEn") as string;
  const shortName = formData.get("shortName") as string;
  const color = formData.get("color") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const websiteUrl = formData.get("websiteUrl") as string;
  const description = formData.get("description") as string;
  const descriptionEn = formData.get("descriptionEn") as string;
  const foundedYear = formData.get("foundedYear") as string;

  if (!name || !shortName || !color) {
    return { error: "Name, short name, and color are required" };
  }

  // Generate unique slug
  let slug = slugify(shortName);
  const existingSlug = await db.party.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const party = await db.party.create({
    data: {
      slug,
      name,
      nameEn: nameEn || null,
      shortName,
      color,
      logoUrl: logoUrl || null,
      websiteUrl: websiteUrl || null,
      description: description || null,
      descriptionEn: descriptionEn || null,
      foundedYear: foundedYear ? parseInt(foundedYear) : null,
    },
  });

  return redirect(`/admin/parties/${party.id}/edit`);
}

export default function NewParty({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/admin/parties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Party</h1>
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
                  placeholder="Full party name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  placeholder="English name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name *</Label>
                <Input
                  id="shortName"
                  name="shortName"
                  required
                  placeholder="e.g., LDK, PDK, VV"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    required
                    defaultValue="#3B82F6"
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    defaultValue="#3B82F6"
                    className="flex-1"
                    onChange={(e) => {
                      const colorInput = document.getElementById("color") as HTMLInputElement;
                      if (colorInput) colorInput.value = e.target.value;
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  name="foundedYear"
                  type="number"
                  min="1900"
                  max="2100"
                  placeholder="e.g., 2000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  placeholder="https://..."
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description (Albanian)</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Party description..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <Textarea
                id="descriptionEn"
                name="descriptionEn"
                rows={4}
                placeholder="English description..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button asChild variant="outline">
                <Link to="/admin/parties">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Party"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
