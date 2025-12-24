// VAA (Voting Advice Application) Matching Algorithm

export type UserAnswer = "AGREE" | "NEUTRAL" | "DISAGREE" | "SKIP";
export type Position = "AGREE" | "NEUTRAL" | "DISAGREE";

export interface CalculationInput {
  answers: Map<string, UserAnswer>; // statementId -> answer
  topicWeights: Map<string, number>; // topicId -> weight (1 = normal, 2 = important)
  partyPositions: Map<string, Map<string, Position>>; // partyId -> (statementId -> position)
  statementTopics: Map<string, string>; // statementId -> topicId
}

export interface TopicScore {
  score: number;
  maxScore: number;
  percentage: number;
}

export interface PartyResult {
  partyId: string;
  matchPercentage: number;
  totalPoints: number;
  maxPossiblePoints: number;
  topicBreakdown: Map<string, TopicScore>;
}

// Scoring matrix:
// User AGREE + Party AGREE = 2 points (full match)
// User AGREE + Party NEUTRAL = 1 point (partial)
// User AGREE + Party DISAGREE = 0 points (no match)
// User NEUTRAL + Party * = 1 point (partial match for all)
// User DISAGREE + Party DISAGREE = 2 points (full match)
// User DISAGREE + Party NEUTRAL = 1 point (partial)
// User DISAGREE + Party AGREE = 0 points (no match)
const SCORING_MATRIX: Record<Exclude<UserAnswer, "SKIP">, Record<Position, number>> = {
  AGREE: { AGREE: 2, NEUTRAL: 1, DISAGREE: 0 },
  NEUTRAL: { AGREE: 1, NEUTRAL: 2, DISAGREE: 1 },
  DISAGREE: { AGREE: 0, NEUTRAL: 1, DISAGREE: 2 },
};

function calculateStatementPoints(
  userAnswer: UserAnswer,
  partyPosition: Position
): number {
  if (userAnswer === "SKIP") return 0;
  return SCORING_MATRIX[userAnswer][partyPosition];
}

export function calculateMatches(input: CalculationInput): PartyResult[] {
  const partyResults: PartyResult[] = [];

  for (const [partyId, positions] of input.partyPositions) {
    let totalPoints = 0;
    let maxPossiblePoints = 0;
    const topicBreakdown = new Map<string, TopicScore>();

    for (const [statementId, userAnswer] of input.answers) {
      // Skip skipped questions
      if (userAnswer === "SKIP") continue;

      const partyPosition = positions.get(statementId);
      if (!partyPosition) continue; // Party has no position on this statement

      const topicId = input.statementTopics.get(statementId);
      if (!topicId) continue;

      const weight = input.topicWeights.get(topicId) ?? 1;

      // Calculate points for this statement
      const points = calculateStatementPoints(userAnswer, partyPosition);
      const weightedPoints = points * weight;
      const maxPoints = 2 * weight; // Maximum possible is 2 (full agreement)

      totalPoints += weightedPoints;
      maxPossiblePoints += maxPoints;

      // Update topic breakdown
      const topicScore = topicBreakdown.get(topicId) ?? {
        score: 0,
        maxScore: 0,
        percentage: 0,
      };
      topicScore.score += weightedPoints;
      topicScore.maxScore += maxPoints;
      topicBreakdown.set(topicId, topicScore);
    }

    // Calculate percentages for topic breakdown
    for (const [topicId, score] of topicBreakdown) {
      score.percentage =
        score.maxScore > 0 ? Math.round((score.score / score.maxScore) * 100) : 0;
      topicBreakdown.set(topicId, score);
    }

    const matchPercentage =
      maxPossiblePoints > 0
        ? Math.round((totalPoints / maxPossiblePoints) * 100)
        : 0;

    partyResults.push({
      partyId,
      matchPercentage,
      totalPoints,
      maxPossiblePoints,
      topicBreakdown,
    });
  }

  // Sort by match percentage descending
  return partyResults.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// Helper to convert database data to calculation input format
export function prepareCalculationInput(
  userAnswers: Record<string, UserAnswer>,
  topicImportance: Record<string, boolean>,
  statements: Array<{ id: string; topicId: string }>,
  partyPositionsData: Array<{
    partyId: string;
    statementId: string;
    position: string;
  }>
): CalculationInput {
  // Convert user answers
  const answers = new Map<string, UserAnswer>();
  for (const [statementId, answer] of Object.entries(userAnswers)) {
    answers.set(statementId, answer);
  }

  // Convert topic weights (important = 2x weight)
  const topicWeights = new Map<string, number>();
  for (const [topicId, isImportant] of Object.entries(topicImportance)) {
    topicWeights.set(topicId, isImportant ? 2 : 1);
  }

  // Build statement -> topic mapping
  const statementTopics = new Map<string, string>();
  for (const statement of statements) {
    statementTopics.set(statement.id, statement.topicId);
  }

  // Build party positions map
  const partyPositions = new Map<string, Map<string, Position>>();
  for (const pos of partyPositionsData) {
    if (!partyPositions.has(pos.partyId)) {
      partyPositions.set(pos.partyId, new Map());
    }
    partyPositions.get(pos.partyId)!.set(pos.statementId, pos.position as Position);
  }

  return {
    answers,
    topicWeights,
    partyPositions,
    statementTopics,
  };
}
