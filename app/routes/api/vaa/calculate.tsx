import type { Route } from "./+types/calculate";
import { db } from "~/lib/db.server";
import {
  calculateMatches,
  prepareCalculationInput,
  type UserAnswer,
} from "~/lib/vaa-algorithm.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const { answers, topicImportance } = body as {
      answers: Record<string, UserAnswer>;
      topicImportance: Record<string, boolean>;
    };

    if (!answers || typeof answers !== "object") {
      return Response.json({ error: "Invalid answers" }, { status: 400 });
    }

    // Get all necessary data
    const [statements, parties, positions] = await Promise.all([
      db.statement.findMany({
        where: { isActive: true },
        select: { id: true, topicId: true },
      }),
      db.party.findMany({
        orderBy: { name: "asc" },
      }),
      db.partyPosition.findMany(),
    ]);

    const topics = await db.topic.findMany({
      orderBy: { name: "asc" },
    });

    // Prepare input and calculate matches
    const input = prepareCalculationInput(
      answers,
      topicImportance || {},
      statements,
      positions.map((p) => ({
        partyId: p.partyId,
        statementId: p.statementId,
        position: p.position,
      }))
    );

    const results = calculateMatches(input);

    // Enrich results with party data
    const enrichedResults = results.map((result) => {
      const party = parties.find((p) => p.id === result.partyId);
      const topicBreakdown = Array.from(result.topicBreakdown.entries()).map(
        ([topicId, score]) => {
          const topic = topics.find((t) => t.id === topicId);
          return {
            topicId,
            topicName: topic?.name || "",
            topicNameEn: topic?.nameEn || "",
            topicIcon: topic?.icon || "",
            ...score,
          };
        }
      );

      return {
        partyId: result.partyId,
        matchPercentage: result.matchPercentage,
        totalPoints: result.totalPoints,
        maxPossiblePoints: result.maxPossiblePoints,
        party: party
          ? {
              id: party.id,
              name: party.name,
              nameEn: party.nameEn,
              shortName: party.shortName,
              color: party.color,
              logoUrl: party.logoUrl,
            }
          : null,
        topicBreakdown,
      };
    });

    return Response.json({ results: enrichedResults });
  } catch (error) {
    console.error("VAA calculation error:", error);
    return Response.json({ error: "Calculation failed" }, { status: 500 });
  }
}
