import { Form, Link, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/edit";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Edit Statement - VAA - Premtimet" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireEditor(request);

  const statement = await db.statement.findUnique({
    where: { id: params.id },
    include: { topic: true },
  });

  if (!statement) {
    throw new Response("Statement not found", { status: 404 });
  }

  const topics = await db.topic.findMany({
    orderBy: { name: "asc" },
  });

  return { statement, topics };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireEditor(request);

  const formData = await request.formData();
  const text = formData.get("text") as string;
  const textEn = formData.get("textEn") as string;
  const textSr = formData.get("textSr") as string;
  const topicId = formData.get("topicId") as string;
  const order = parseInt(formData.get("order") as string) || 0;
  const isActive = formData.get("isActive") === "on";

  if (!text || !topicId) {
    return { error: "Statement text and topic are required" };
  }

  await db.statement.update({
    where: { id: params.id },
    data: {
      text,
      textEn: textEn || null,
      textSr: textSr || null,
      topicId,
      order,
      isActive,
    },
  });

  return redirect("/admin/vaa/statements");
}

export default function EditStatement({ loaderData, actionData }: Route.ComponentProps) {
  const { statement, topics } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/vaa/statements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Statement</h1>
          <p className="text-gray-500 mt-1">
            Update the statement details
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <Form method="post" className="space-y-6">
            {actionData?.error && (
              <div className="p-3 rounded bg-red-100 text-red-700 text-sm">
                {actionData.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="topicId">Topic *</Label>
              <Select name="topicId" required defaultValue={statement.topicId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.icon} {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Statement (Albanian) *</Label>
              <Textarea
                id="text"
                name="text"
                required
                rows={3}
                defaultValue={statement.text}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textEn">Statement (English)</Label>
              <Textarea
                id="textEn"
                name="textEn"
                rows={3}
                defaultValue={statement.textEn || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textSr">Statement (Serbian)</Label>
              <Textarea
                id="textSr"
                name="textSr"
                rows={3}
                defaultValue={statement.textSr || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={statement.order}
                min={0}
                className="w-32"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                name="isActive"
                defaultChecked={statement.isActive}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link to="/admin/vaa/statements">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
