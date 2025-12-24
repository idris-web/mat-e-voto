import { Form, useSearchParams } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import { formatDate } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Review Tips - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);

  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "pending";

  const where = filter === "all"
    ? {}
    : filter === "processed"
      ? { isProcessed: true }
      : { isProcessed: false };

  const tips = await db.tip.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      processedBy: { select: { name: true, email: true } },
    },
  });

  const counts = await db.tip.groupBy({
    by: ["isProcessed"],
    _count: true,
  });

  const pendingCount = counts.find(c => !c.isProcessed)?._count || 0;
  const processedCount = counts.find(c => c.isProcessed)?._count || 0;

  return { tips, pendingCount, processedCount, filter };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireEditor(request);

  const formData = await request.formData();
  const tipId = formData.get("tipId") as string;
  const action = formData.get("action") as string;
  const notes = formData.get("notes") as string;

  if (!tipId || !action) {
    return { error: "Missing required fields" };
  }

  if (action === "process") {
    await db.tip.update({
      where: { id: tipId },
      data: {
        isProcessed: true,
        processedById: user.id,
        processedAt: new Date(),
        adminNotes: notes || null,
      },
    });
    return { processed: true };
  }

  if (action === "unprocess") {
    await db.tip.update({
      where: { id: tipId },
      data: {
        isProcessed: false,
        processedById: null,
        processedAt: null,
        adminNotes: notes || null,
      },
    });
    return { unprocessed: true };
  }

  if (action === "delete") {
    await db.tip.delete({ where: { id: tipId } });
    return { deleted: true };
  }

  return null;
}

export default function AdminTips({ loaderData, actionData }: Route.ComponentProps) {
  const { tips, pendingCount, processedCount, filter } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tips & Submissions</h1>
        <div className="flex items-center gap-2">
          <Badge variant={pendingCount > 0 ? "destructive" : "secondary"}>
            {pendingCount} Pending
          </Badge>
          <Badge variant="secondary">{processedCount} Processed</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "pending" })}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === "processed" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "processed" })}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Processed ({processedCount})
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setSearchParams({ filter: "all" })}
        >
          All ({pendingCount + processedCount})
        </Button>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        {tips.map((tip) => (
          <Card key={tip.id} className={tip.isProcessed ? "opacity-75" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {tip.politicianName || "Unknown Politician"}
                    {tip.isProcessed ? (
                      <Badge variant="secondary" className="ml-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Processed
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted {formatDate(tip.createdAt)}
                    {tip.submitterEmail && ` by ${tip.submitterEmail}`}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promise Text */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Promise Quote</Label>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  "{tip.promiseText}"
                </p>
              </div>

              {/* Source URL */}
              {tip.sourceUrl && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Source URL</Label>
                  <a
                    href={tip.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {tip.sourceUrl}
                  </a>
                </div>
              )}

              {/* Additional Notes */}
              {tip.additionalNotes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Additional Notes</Label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{tip.additionalNotes}</p>
                </div>
              )}

              {/* Admin Notes (if processed) */}
              {tip.isProcessed && tip.adminNotes && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-gray-500">Admin Notes</Label>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{tip.adminNotes}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Processed by {tip.processedBy?.name || tip.processedBy?.email} on{" "}
                    {tip.processedAt && formatDate(tip.processedAt)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4">
                <Form method="post" className="space-y-3">
                  <input type="hidden" name="tipId" value={tip.id} />

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${tip.id}`}>Admin Notes</Label>
                    <Textarea
                      id={`notes-${tip.id}`}
                      name="notes"
                      placeholder="Add notes about this tip..."
                      defaultValue={tip.adminNotes || ""}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    {!tip.isProcessed ? (
                      <Button name="action" value="process" type="submit">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Processed
                      </Button>
                    ) : (
                      <Button name="action" value="unprocess" type="submit" variant="outline">
                        <Clock className="h-4 w-4 mr-2" />
                        Mark as Pending
                      </Button>
                    )}
                    <Button
                      name="action"
                      value="delete"
                      type="submit"
                      variant="destructive"
                      onClick={(e) => {
                        if (!confirm("Delete this tip? This cannot be undone.")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Form>
              </div>
            </CardContent>
          </Card>
        ))}

        {tips.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              {filter === "pending"
                ? "No pending tips to review"
                : filter === "processed"
                ? "No processed tips yet"
                : "No tips submitted yet"}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
