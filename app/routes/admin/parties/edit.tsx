import { Form, useActionData, useLoaderData, useNavigation, Link } from "react-router";
import type { Route } from "./+types/edit";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ArrowLeft, Save, ExternalLink, Users, FileText } from "lucide-react";
import { getInitials, formatShortDate } from "~/lib/utils";
import { PromiseStatusBadge } from "~/components/promises/promise-status-badge";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `Edit: ${data?.party?.name || "Party"} - Premtimet` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireEditor(request);

  const party = await db.party.findUnique({
    where: { id: params.id },
    include: {
      politicians: {
        orderBy: { name: "asc" },
        take: 10,
      },
      promises: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { politician: true },
      },
      _count: {
        select: { politicians: true, promises: true },
      },
    },
  });

  if (!party) {
    throw new Response("Not Found", { status: 404 });
  }

  return { party };
}

export async function action({ params, request }: Route.ActionArgs) {
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

  await db.party.update({
    where: { id: params.id },
    data: {
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

  return { success: true };
}

export default function EditParty({ loaderData, actionData }: Route.ComponentProps) {
  const { party } = loaderData;
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
        <div
          className="h-10 w-10 rounded flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: party.color }}
        >
          {party.shortName.slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{party.name}</h1>
          <p className="text-sm text-gray-500">{party.slug}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {party._count.politicians}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {party._count.promises}
          </span>
        </div>
        <Button asChild variant="outline">
          <a href={`/parties/${party.slug}`} target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Public
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Party Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-6">
                {actionData?.success && (
                  <div className="p-3 rounded-md bg-green-100 text-green-700 text-sm">
                    Party updated successfully
                  </div>
                )}

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
                      defaultValue={party.name}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Name (English)</Label>
                    <Input
                      id="nameEn"
                      name="nameEn"
                      defaultValue={party.nameEn || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shortName">Short Name *</Label>
                    <Input
                      id="shortName"
                      name="shortName"
                      defaultValue={party.shortName}
                      required
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
                        defaultValue={party.color}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        defaultValue={party.color}
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
                      defaultValue={party.foundedYear || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      type="url"
                      defaultValue={party.logoUrl || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    defaultValue={party.websiteUrl || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Albanian)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={party.description || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">Description (English)</Label>
                  <Textarea
                    id="descriptionEn"
                    name="descriptionEn"
                    rows={4}
                    defaultValue={party.descriptionEn || ""}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Politicians */}
          <Card>
            <CardHeader>
              <CardTitle>Politicians ({party._count.politicians})</CardTitle>
            </CardHeader>
            <CardContent>
              {party.politicians.length > 0 ? (
                <div className="space-y-2">
                  {party.politicians.map((politician) => (
                    <Link
                      key={politician.id}
                      to={`/admin/politicians/${politician.id}/edit`}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={politician.photoUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(politician.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{politician.name}</p>
                        {politician.currentPosition && (
                          <p className="text-xs text-gray-500 truncate">
                            {politician.currentPosition}
                          </p>
                        )}
                      </div>
                      <Badge variant={politician.isActive ? "default" : "secondary"} className="text-xs">
                        {politician.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No politicians</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Promises */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Promises</CardTitle>
            </CardHeader>
            <CardContent>
              {party.promises.length > 0 ? (
                <div className="space-y-3">
                  {party.promises.map((promise) => (
                    <Link
                      key={promise.id}
                      to={`/admin/promises/${promise.id}/edit`}
                      className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-2">{promise.summary}</p>
                        <PromiseStatusBadge status={promise.status} size="sm" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {promise.politician?.name || "Party promise"} • {formatShortDate(promise.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No promises yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
