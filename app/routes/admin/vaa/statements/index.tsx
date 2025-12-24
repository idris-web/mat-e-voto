import { Form, Link, useNavigation } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Manage Statements - VAA - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);

  const statements = await db.statement.findMany({
    orderBy: [{ topic: { name: "asc" } }, { order: "asc" }],
    include: {
      topic: true,
      _count: { select: { partyPositions: true } },
    },
  });

  const topics = await db.topic.findMany({
    orderBy: { name: "asc" },
  });

  const parties = await db.party.count();

  return { statements, topics, partyCount: parties };
}

export async function action({ request }: Route.ActionArgs) {
  await requireEditor(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id") as string;
    await db.statement.delete({ where: { id } });
    return { deleted: true };
  }

  if (intent === "toggle") {
    const id = formData.get("id") as string;
    const statement = await db.statement.findUnique({ where: { id } });
    if (statement) {
      await db.statement.update({
        where: { id },
        data: { isActive: !statement.isActive },
      });
    }
    return { toggled: true };
  }

  if (intent === "reorder") {
    const id = formData.get("id") as string;
    const direction = formData.get("direction") as string;
    const statement = await db.statement.findUnique({
      where: { id },
      include: { topic: true },
    });

    if (statement) {
      const siblings = await db.statement.findMany({
        where: { topicId: statement.topicId },
        orderBy: { order: "asc" },
      });

      const currentIndex = siblings.findIndex((s) => s.id === id);
      const newIndex =
        direction === "up"
          ? Math.max(0, currentIndex - 1)
          : Math.min(siblings.length - 1, currentIndex + 1);

      if (currentIndex !== newIndex) {
        const swapWith = siblings[newIndex];
        await db.$transaction([
          db.statement.update({
            where: { id: statement.id },
            data: { order: swapWith.order },
          }),
          db.statement.update({
            where: { id: swapWith.id },
            data: { order: statement.order },
          }),
        ]);
      }
    }
    return { reordered: true };
  }

  return null;
}

export default function AdminVAAStatements({ loaderData }: Route.ComponentProps) {
  const { statements, topics, partyCount } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Group statements by topic
  const statementsByTopic = topics.map((topic) => ({
    topic,
    statements: statements.filter((s) => s.topicId === topic.id),
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Statements ({statements.length})</h1>
          <p className="text-gray-500 mt-1">
            Manage political statements for the voting advice questionnaire
          </p>
        </div>
        <Link to="/admin/vaa/statements/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Statement
          </Button>
        </Link>
      </div>

      {statements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No statements yet.</p>
            <Link to="/admin/vaa/statements/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Statement
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {statementsByTopic.map(({ topic, statements: topicStatements }) => (
            <Card key={topic.id}>
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{topic.icon}</span>
                  <h2 className="font-semibold">{topic.name}</h2>
                  <Badge variant="secondary">{topicStatements.length}</Badge>
                </div>
              </div>
              <CardContent className="p-0">
                {topicStatements.length === 0 ? (
                  <p className="p-4 text-gray-500 text-sm">
                    No statements in this topic yet.
                  </p>
                ) : (
                  <div className="divide-y">
                    {topicStatements.map((statement, index) => (
                      <div
                        key={statement.id}
                        className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <div className="flex flex-col gap-1">
                          <Form method="post">
                            <input type="hidden" name="intent" value="reorder" />
                            <input type="hidden" name="id" value={statement.id} />
                            <input type="hidden" name="direction" value="up" />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0 || isSubmitting}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                          </Form>
                          <Form method="post">
                            <input type="hidden" name="intent" value="reorder" />
                            <input type="hidden" name="id" value={statement.id} />
                            <input type="hidden" name="direction" value="down" />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={
                                index === topicStatements.length - 1 || isSubmitting
                              }
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </Form>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{statement.text}</p>
                          {statement.textEn && (
                            <p className="text-sm text-gray-500 mt-1">
                              EN: {statement.textEn}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={statement.isActive ? "default" : "secondary"}
                            >
                              {statement.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {statement._count.partyPositions}/{partyCount} positions
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Form method="post">
                            <input type="hidden" name="intent" value="toggle" />
                            <input type="hidden" name="id" value={statement.id} />
                            <Button
                              type="submit"
                              variant="outline"
                              size="sm"
                              disabled={isSubmitting}
                            >
                              {statement.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </Form>
                          <Link to={`/admin/vaa/statements/${statement.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Form method="post">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="id" value={statement.id} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              disabled={isSubmitting}
                              onClick={(e) => {
                                if (!confirm("Delete this statement?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
