import { Form, Link, useNavigation } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { slugify } from "~/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Plus, Edit, FileText, Trash2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Topics - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);

  const topics = await db.topic.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { promises: true } },
    },
  });

  return { topics };
}

export async function action({ request }: Route.ActionArgs) {
  await requireEditor(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const name = formData.get("name") as string;
    const nameEn = formData.get("nameEn") as string;
    const icon = formData.get("icon") as string;

    if (!name || !icon) {
      return { error: "Name and icon are required" };
    }

    let slug = slugify(name);
    const existingSlug = await db.topic.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    await db.topic.create({
      data: {
        slug,
        name,
        nameEn: nameEn || null,
        icon,
      },
    });

    return { success: true };
  }

  if (intent === "update") {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const nameEn = formData.get("nameEn") as string;
    const icon = formData.get("icon") as string;

    if (!name || !icon) {
      return { error: "Name and icon are required" };
    }

    await db.topic.update({
      where: { id },
      data: {
        name,
        nameEn: nameEn || null,
        icon,
      },
    });

    return { updated: true };
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;

    // Check if topic has promises
    const topic = await db.topic.findUnique({
      where: { id },
      include: { _count: { select: { promises: true } } },
    });

    if (topic && topic._count.promises > 0) {
      return { error: "Cannot delete topic with associated promises" };
    }

    await db.topic.delete({ where: { id } });
    return { deleted: true };
  }

  return null;
}

export default function AdminTopics({ loaderData, actionData }: Route.ComponentProps) {
  const { topics } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Topics ({topics.length})</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Topic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="create" />

              {actionData?.success && (
                <div className="p-2 rounded bg-green-100 text-green-700 text-sm">
                  Topic created
                </div>
              )}

              {actionData?.error && (
                <div className="p-2 rounded bg-red-100 text-red-700 text-sm">
                  {actionData.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Emoji) *</Label>
                <Input
                  id="icon"
                  name="icon"
                  required
                  placeholder="e.g., 🏥"
                  className="text-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name (Albanian) *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Shëndetësia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameEn">Name (English)</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  placeholder="e.g., Healthcare"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </Form>
          </CardContent>
        </Card>

        {/* Topics List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Icon</th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">English</th>
                      <th className="text-left p-4 font-medium">Promises</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topics.map((topic) => (
                      <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="p-4 text-2xl">{topic.icon}</td>
                        <td className="p-4">
                          <p className="font-medium">{topic.name}</p>
                          <p className="text-sm text-gray-500">{topic.slug}</p>
                        </td>
                        <td className="p-4 text-gray-600">
                          {topic.nameEn || "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>{topic._count.promises}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <TopicEditDialog topic={topic} />
                            {topic._count.promises === 0 && (
                              <Form method="post" className="inline">
                                <input type="hidden" name="intent" value="delete" />
                                <input type="hidden" name="id" value={topic.id} />
                                <Button
                                  type="submit"
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    if (!confirm("Delete this topic?")) {
                                      e.preventDefault();
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </Form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {topics.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          No topics found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TopicEditDialog({ topic }: { topic: { id: string; name: string; nameEn: string | null; icon: string } }) {
  const [open, setOpen] = React.useState(false);
  const navigation = useNavigation();

  React.useEffect(() => {
    if (navigation.state === "idle") {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <Card className="relative z-50 w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="update" />
                <input type="hidden" name="id" value={topic.id} />

                <div className="space-y-2">
                  <Label>Icon (Emoji) *</Label>
                  <Input
                    name="icon"
                    required
                    defaultValue={topic.icon}
                    className="text-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Name (Albanian) *</Label>
                  <Input
                    name="name"
                    required
                    defaultValue={topic.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input
                    name="nameEn"
                    defaultValue={topic.nameEn || ""}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

import React from "react";
