import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/index";
import { db } from "~/lib/db.server";
import { requireEditor } from "~/lib/auth.server";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Save, Check, Minus, X } from "lucide-react";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Party Positions - VAA - Premtimet" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditor(request);

  const [statements, parties, positions] = await Promise.all([
    db.statement.findMany({
      where: { isActive: true },
      orderBy: [{ topic: { name: "asc" } }, { order: "asc" }],
      include: { topic: true },
    }),
    db.party.findMany({
      orderBy: { name: "asc" },
    }),
    db.partyPosition.findMany(),
  ]);

  // Build position map: statementId-partyId -> position
  const positionMap: Record<string, string> = {};
  for (const pos of positions) {
    positionMap[`${pos.statementId}-${pos.partyId}`] = pos.position;
  }

  return { statements, parties, positionMap };
}

export async function action({ request }: Route.ActionArgs) {
  await requireEditor(request);

  const formData = await request.formData();
  const entries = Array.from(formData.entries());

  // Process each position update
  const updates: Array<{ statementId: string; partyId: string; position: string }> = [];

  for (const [key, value] of entries) {
    if (key.startsWith("pos-") && value) {
      const [, statementId, partyId] = key.split("-");
      updates.push({
        statementId,
        partyId,
        position: value as string,
      });
    }
  }

  // Upsert all positions
  for (const update of updates) {
    if (update.position === "NOT_SET") {
      // Delete position if set to NOT_SET
      await db.partyPosition.deleteMany({
        where: {
          statementId: update.statementId,
          partyId: update.partyId,
        },
      });
    } else {
      await db.partyPosition.upsert({
        where: {
          statementId_partyId: {
            statementId: update.statementId,
            partyId: update.partyId,
          },
        },
        create: {
          statementId: update.statementId,
          partyId: update.partyId,
          position: update.position,
        },
        update: {
          position: update.position,
        },
      });
    }
  }

  return { saved: true, count: updates.length };
}

const POSITION_OPTIONS = [
  { value: "NOT_SET", label: "Not Set", icon: null, color: "bg-gray-200 dark:bg-gray-700" },
  { value: "AGREE", label: "Agree", icon: Check, color: "bg-green-500" },
  { value: "NEUTRAL", label: "Neutral", icon: Minus, color: "bg-yellow-500" },
  { value: "DISAGREE", label: "Disagree", icon: X, color: "bg-red-500" },
];

export default function AdminVAAPositions({ loaderData, actionData }: Route.ComponentProps) {
  const { statements, parties, positionMap } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Group statements by topic
  const topics = Array.from(new Set(statements.map((s) => s.topic.id))).map((topicId) => {
    const topicStatements = statements.filter((s) => s.topicId === topicId);
    return {
      ...topicStatements[0].topic,
      statements: topicStatements,
    };
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Party Positions</h1>
          <p className="text-gray-500 mt-1">
            Set each party's position on every statement
          </p>
        </div>
      </div>

      {actionData?.saved && (
        <div className="mb-4 p-3 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
          Positions saved successfully
        </div>
      )}

      {statements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No active statements found. Create and activate statements first.
            </p>
          </CardContent>
        </Card>
      ) : parties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No parties found. Add parties first.</p>
          </CardContent>
        </Card>
      ) : (
        <Form method="post">
          <div className="mb-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save All Positions"}
            </Button>
          </div>

          {/* Legend */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">Legend:</span>
                {POSITION_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded", opt.color)} />
                    <span className="text-sm">{opt.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Position Matrix by Topic */}
          <div className="space-y-6">
            {topics.map((topic) => (
              <Card key={topic.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{topic.icon}</span>
                    {topic.name}
                    <Badge variant="secondary">{topic.statements.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium w-1/3">
                            Statement
                          </th>
                          {parties.map((party) => (
                            <th
                              key={party.id}
                              className="text-center p-3 font-medium"
                              style={{ minWidth: "120px" }}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: party.color }}
                                />
                                <span className="text-xs">{party.shortName}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {topic.statements.map((statement) => (
                          <tr
                            key={statement.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <td className="p-3">
                              <p className="text-sm">{statement.text}</p>
                            </td>
                            {parties.map((party) => {
                              const key = `${statement.id}-${party.id}`;
                              const currentPosition = positionMap[key] || "NOT_SET";
                              return (
                                <td key={party.id} className="p-3">
                                  <Select
                                    name={`pos-${statement.id}-${party.id}`}
                                    defaultValue={currentPosition}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue>
                                        <PositionBadge position={currentPosition} />
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {POSITION_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={cn(
                                                "w-3 h-3 rounded",
                                                opt.color
                                              )}
                                            />
                                            {opt.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save All Positions"}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

function PositionBadge({ position }: { position: string }) {
  const opt = POSITION_OPTIONS.find((o) => o.value === position) || POSITION_OPTIONS[0];
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-3 h-3 rounded", opt.color)} />
      <span className="text-xs">{opt.label}</span>
    </div>
  );
}
