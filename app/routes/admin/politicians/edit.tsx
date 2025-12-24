import { Form, redirect, useActionData, useLoaderData, useNavigation, Link } from "react-router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { getInitials, formatShortDate } from "~/lib/utils";
import { PromiseStatusBadge } from "~/components/promises/promise-status-badge";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `Edit: ${data?.politician?.name || "Politician"} - Premtimet` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  await requireEditor(request);

  const politician = await db.politician.findUnique({
    where: { id: params.id },
    include: {
      party: true,
      promises: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { topic: true },
      },
    },
  });

  if (!politician) {
    throw new Response("Not Found", { status: 404 });
  }

  const parties = await db.party.findMany({ orderBy: { shortName: "asc" } });

  return { politician, parties };
}

export async function action({ params, request }: Route.ActionArgs) {
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

  await db.politician.update({
    where: { id: params.id },
    data: {
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

  return { success: true };
}

export default function EditPolitician({ loaderData, actionData }: Route.ComponentProps) {
  const { politician, parties } = loaderData;
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
        <Avatar className="h-12 w-12">
          <AvatarImage src={politician.photoUrl || undefined} />
          <AvatarFallback>{getInitials(politician.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{politician.name}</h1>
          <p className="text-sm text-gray-500">{politician.slug}</p>
        </div>
        <Badge variant={politician.isActive ? "default" : "secondary"}>
          {politician.isActive ? "Active" : "Inactive"}
        </Badge>
        <Button asChild variant="outline">
          <a href={`/politicians/${politician.slug}`} target="_blank">
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
              <CardTitle>Politician Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-6">
                {actionData?.success && (
                  <div className="p-3 rounded-md bg-green-100 text-green-700 text-sm">
                    Politician updated successfully
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
                      defaultValue={politician.name}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nameEn">Name (English)</Label>
                    <Input
                      id="nameEn"
                      name="nameEn"
                      defaultValue={politician.nameEn || ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Party</Label>
                    <Select name="partyId" defaultValue={politician.partyId || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select party" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
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
                    <Select name="isActive" defaultValue={politician.isActive ? "true" : "false"}>
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
                      defaultValue={politician.currentPosition || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPositionEn">Current Position (English)</Label>
                    <Input
                      id="currentPositionEn"
                      name="currentPositionEn"
                      defaultValue={politician.currentPositionEn || ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    name="photoUrl"
                    type="url"
                    defaultValue={politician.photoUrl || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biography (Albanian)</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    defaultValue={politician.bio || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bioEn">Biography (English)</Label>
                  <Textarea
                    id="bioEn"
                    name="bioEn"
                    rows={4}
                    defaultValue={politician.bioEn || ""}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitterHandle">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      name="twitterHandle"
                      defaultValue={politician.twitterHandle || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagramHandle">Instagram Handle</Label>
                    <Input
                      id="instagramHandle"
                      name="instagramHandle"
                      defaultValue={politician.instagramHandle || ""}
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
                      defaultValue={politician.facebookUrl || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      name="websiteUrl"
                      type="url"
                      defaultValue={politician.websiteUrl || ""}
                    />
                  </div>
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
          {/* Recent Promises */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Promises ({politician.promises.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {politician.promises.length > 0 ? (
                <div className="space-y-3">
                  {politician.promises.map((promise) => (
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
                        {promise.topic?.icon} {promise.topic?.name} • {formatShortDate(promise.createdAt)}
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
