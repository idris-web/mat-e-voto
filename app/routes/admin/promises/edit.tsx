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
import { PromiseStatusBadge } from "~/components/promises/promise-status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, Save, Plus, ExternalLink } from "lucide-react";
import { formatDate } from "~/lib/utils";
import { PROMISE_STATUS_CONFIG } from "~/lib/constants";
import type { PromiseStatus } from "@prisma/client";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `Edit: ${data?.promise?.summary || "Promise"} - Premtimet` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await requireEditor(request);

  const promise = await db.promise.findUnique({
    where: { id: params.id },
    include: {
      politician: { include: { party: true } },
      party: true,
      topic: true,
      evidence: {
        orderBy: { createdAt: "desc" },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
    },
  });

  if (!promise) {
    throw new Response("Not Found", { status: 404 });
  }

  const [politicians, parties, topics] = await Promise.all([
    db.politician.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { party: true },
    }),
    db.party.findMany({ orderBy: { shortName: "asc" } }),
    db.topic.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { promise, politicians, parties, topics, user };
}

export async function action({ params, request }: Route.ActionArgs) {
  const user = await requireEditor(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "update") {
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

    await db.promise.update({
      where: { id: params.id },
      data: {
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

    return { success: true };
  }

  if (intent === "changeStatus") {
    const newStatus = formData.get("newStatus") as PromiseStatus;
    const justification = formData.get("justification") as string;

    if (!newStatus || !justification) {
      return { error: "Status and justification are required" };
    }

    const promise = await db.promise.findUnique({ where: { id: params.id } });
    if (!promise) {
      return { error: "Promise not found" };
    }

    await db.$transaction([
      db.statusChange.create({
        data: {
          promiseId: params.id!,
          oldStatus: promise.status,
          newStatus,
          justification,
          changedById: user.id,
        },
      }),
      db.promise.update({
        where: { id: params.id },
        data: { status: newStatus },
      }),
    ]);

    return { statusChanged: true };
  }

  if (intent === "addEvidence") {
    const title = formData.get("evidenceTitle") as string;
    const description = formData.get("evidenceDescription") as string;
    const evidenceSourceUrl = formData.get("evidenceSourceUrl") as string;
    const type = formData.get("evidenceType") as string;

    if (!title || !description || !evidenceSourceUrl || !type) {
      return { error: "All evidence fields are required" };
    }

    await db.evidence.create({
      data: {
        promiseId: params.id!,
        title,
        description,
        sourceUrl: evidenceSourceUrl,
        type: type as any,
        addedById: user.id,
      },
    });

    return { evidenceAdded: true };
  }

  return null;
}

export default function EditPromise({ loaderData, actionData }: Route.ComponentProps) {
  const { promise, politicians, parties, topics, user } = loaderData;
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Promise</h1>
          <p className="text-sm text-gray-500">{promise.slug}</p>
        </div>
        <PromiseStatusBadge status={promise.status} />
        <Button asChild variant="outline">
          <a href={`/promises/${promise.slug}`} target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Public
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Promise Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-6">
                <input type="hidden" name="intent" value="update" />

                {actionData?.success && (
                  <div className="p-3 rounded-md bg-green-100 text-green-700 text-sm">
                    Promise updated successfully
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Input
                    id="summary"
                    name="summary"
                    defaultValue={promise.summary}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textOriginal">Original Quote</Label>
                  <Textarea
                    id="textOriginal"
                    name="textOriginal"
                    defaultValue={promise.textOriginal}
                    required
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textEnglish">English Translation</Label>
                  <Textarea
                    id="textEnglish"
                    name="textEnglish"
                    defaultValue={promise.textEnglish || ""}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Politician</Label>
                    <Select name="politicianId" defaultValue={promise.politicianId || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {politicians.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Topic</Label>
                    <Select name="topicId" defaultValue={promise.topicId} required>
                      <SelectTrigger>
                        <SelectValue />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Party</Label>
                    <Select name="partyId" defaultValue={promise.partyId || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {parties.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.shortName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select name="sourceType" defaultValue={promise.sourceType} required>
                      <SelectTrigger>
                        <SelectValue />
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
                </div>

                <div className="space-y-2">
                  <Label>Date Promised</Label>
                  <Input
                    name="datePromised"
                    type="date"
                    defaultValue={new Date(promise.datePromised).toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Source URL</Label>
                  <Input
                    name="sourceUrl"
                    type="url"
                    defaultValue={promise.sourceUrl}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Archive URL</Label>
                  <Input
                    name="archiveUrl"
                    type="url"
                    defaultValue={promise.archiveUrl || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Context</Label>
                  <Textarea
                    name="context"
                    defaultValue={promise.context || ""}
                    rows={3}
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
          {/* Change Status */}
          <Card>
            <CardHeader>
              <CardTitle>Change Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="changeStatus" />

                {actionData?.statusChanged && (
                  <div className="p-2 rounded bg-green-100 text-green-700 text-sm">
                    Status updated
                  </div>
                )}

                <div className="space-y-2">
                  <Label>New Status</Label>
                  <Select name="newStatus" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROMISE_STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Justification</Label>
                  <Textarea
                    name="justification"
                    required
                    rows={3}
                    placeholder="Explain why the status is changing..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  Update Status
                </Button>
              </Form>
            </CardContent>
          </Card>

          {/* Add Evidence */}
          <Card>
            <CardHeader>
              <CardTitle>Add Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="addEvidence" />

                {actionData?.evidenceAdded && (
                  <div className="p-2 rounded bg-green-100 text-green-700 text-sm">
                    Evidence added
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input name="evidenceTitle" required />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="evidenceType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEGISLATION">Legislation</SelectItem>
                      <SelectItem value="BUDGET_ALLOCATION">Budget Allocation</SelectItem>
                      <SelectItem value="NEWS_ARTICLE">News Article</SelectItem>
                      <SelectItem value="OFFICIAL_STATISTICS">Official Statistics</SelectItem>
                      <SelectItem value="GOVERNMENT_REPORT">Government Report</SelectItem>
                      <SelectItem value="EXPERT_ANALYSIS">Expert Analysis</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea name="evidenceDescription" required rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Source URL</Label>
                  <Input name="evidenceSourceUrl" type="url" required />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Evidence
                </Button>
              </Form>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              {promise.statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {promise.statusHistory.map((change) => (
                    <div key={change.id} className="text-sm border-l-2 border-gray-200 pl-3">
                      <p className="font-medium">
                        {change.oldStatus} → {change.newStatus}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {change.changedBy?.name} • {formatDate(change.createdAt)}
                      </p>
                      <p className="text-gray-600 mt-1">{change.justification}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No status changes yet</p>
              )}
            </CardContent>
          </Card>

          {/* Evidence List */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence ({promise.evidence.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {promise.evidence.length > 0 ? (
                <div className="space-y-3">
                  {promise.evidence.map((ev) => (
                    <div key={ev.id} className="text-sm border-l-2 border-gray-200 pl-3">
                      <p className="font-medium">{ev.title}</p>
                      <Badge variant="secondary" className="mt-1">{ev.type}</Badge>
                      <p className="text-gray-600 mt-1 line-clamp-2">{ev.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No evidence yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
