import type { Task } from '@prisma/client';

/**
 * Task planning advisor.
 *
 * Today it is rule based. It is written behind an interface so an AI provider can be plugged in
 * later (for example with an API key in .env): if the AI planner is missing, fails, or hits its
 * quota, getPlanner() falls back to the rule-based planner, so the site never breaks.
 */
export interface PlanInput {
  tasks: Task[];
  availableMinutes: number;
}

export interface PlanResult {
  source: 'rules' | 'ai';
  orderedTaskIds: number[];
  suggestedToMove: number[];
  message: string;
}

export interface TaskPlanner {
  plan(input: PlanInput): Promise<PlanResult>;
}

const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

function formatHours(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours} שעות`;
}

export const ruleBasedPlanner: TaskPlanner = {
  async plan({ tasks, availableMinutes }) {
    // Highest priority first; within the same priority, shorter tasks first (quick wins).
    const ordered = [...tasks].sort(
      (a, b) =>
        priorityWeight[b.priority] - priorityWeight[a.priority] ||
        a.estimatedMinutes - b.estimatedMinutes ||
        a.id - b.id,
    );

    const total = ordered.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const suggestedToMove: number[] = [];
    let remaining = total;
    // Drop from the end (lowest priority, longest) until the plan fits.
    for (let i = ordered.length - 1; i >= 0 && remaining > availableMinutes; i--) {
      const task = ordered[i]!;
      suggestedToMove.push(task.id);
      remaining -= task.estimatedMinutes;
    }

    let message: string;
    if (tasks.length === 0) message = 'אין משימות פתוחות להיום.';
    else if (suggestedToMove.length === 0)
      message = `יש לך ${formatHours(total)} משימות ונשארו ${formatHours(availableMinutes)} — מספיק זמן! 💪`;
    else
      message =
        `יש לך ${formatHours(total)} משימות ונשארו ${formatHours(availableMinutes)}. ` +
        `מומלץ להעביר ${suggestedToMove.length === 1 ? 'משימה אחת' : `${suggestedToMove.length} משימות`} בעדיפות הנמוכה למחר.`;

    return { source: 'rules', orderedTaskIds: ordered.map((t) => t.id), suggestedToMove, message };
  },
};

/** Optional AI planner. Not configured yet — set one here when an AI provider is added. */
let aiPlanner: TaskPlanner | null = null;

export function setAiPlanner(planner: TaskPlanner | null): void {
  aiPlanner = planner;
}

export async function runPlanner(input: PlanInput): Promise<PlanResult> {
  if (aiPlanner) {
    try {
      return await aiPlanner.plan(input);
    } catch (err) {
      console.warn('AI planner unavailable, falling back to rules:', err);
    }
  }
  return ruleBasedPlanner.plan(input);
}
