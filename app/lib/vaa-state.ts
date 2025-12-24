// VAA Client-side State Management
// Uses sessionStorage for privacy (cleared on browser close)

import type { UserAnswer } from "./vaa-algorithm.server";

export interface VAAState {
  currentIndex: number;
  answers: Record<string, UserAnswer>; // statementId -> answer
  topicImportance: Record<string, boolean>; // topicId -> isImportant
  startedAt: number;
  isComplete: boolean;
}

const STORAGE_KEY = "vaa_state";

export function getInitialState(): VAAState {
  return {
    currentIndex: 0,
    answers: {},
    topicImportance: {},
    startedAt: Date.now(),
    isComplete: false,
  };
}

export function saveVAAState(state: VAAState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save VAA state:", e);
  }
}

export function loadVAAState(): VAAState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error("Failed to load VAA state:", e);
    return null;
  }
}

export function clearVAAState(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear VAA state:", e);
  }
}

// Encode state for URL sharing (compact format)
export function encodeVAAResults(
  answers: Record<string, UserAnswer>,
  topicImportance: Record<string, boolean>
): string {
  const data = { a: answers, t: topicImportance };
  return btoa(JSON.stringify(data));
}

// Decode state from URL
export function decodeVAAResults(
  encoded: string
): { answers: Record<string, UserAnswer>; topicImportance: Record<string, boolean> } | null {
  try {
    const data = JSON.parse(atob(encoded));
    return {
      answers: data.a || {},
      topicImportance: data.t || {},
    };
  } catch (e) {
    console.error("Failed to decode VAA results:", e);
    return null;
  }
}

// Calculate progress percentage
export function calculateProgress(
  currentIndex: number,
  totalStatements: number
): number {
  if (totalStatements === 0) return 0;
  return Math.round((currentIndex / totalStatements) * 100);
}

// Get answer counts for statistics
export function getAnswerStats(answers: Record<string, UserAnswer>): {
  agree: number;
  neutral: number;
  disagree: number;
  skip: number;
  total: number;
} {
  const stats = { agree: 0, neutral: 0, disagree: 0, skip: 0, total: 0 };

  for (const answer of Object.values(answers)) {
    stats.total++;
    switch (answer) {
      case "AGREE":
        stats.agree++;
        break;
      case "NEUTRAL":
        stats.neutral++;
        break;
      case "DISAGREE":
        stats.disagree++;
        break;
      case "SKIP":
        stats.skip++;
        break;
    }
  }

  return stats;
}
