import type { Role } from '@prisma/client';

/**
 * Tiny in-process event bus so modules can react to each other without importing each other.
 * Example: attendance publishes "clockIn"; the pulses module (if installed) schedules checks.
 * Removing the listening module simply means nobody reacts.
 */
export interface AppEvents {
  clockIn: { userId: number; role: Role; workDate: string; at: Date; firstOfDay: boolean };
}

type Handler<K extends keyof AppEvents> = (payload: AppEvents[K]) => Promise<void> | void;

const handlers = new Map<keyof AppEvents, Handler<keyof AppEvents>[]>();

export function on<K extends keyof AppEvents>(event: K, handler: Handler<K>): void {
  handlers.set(event, [...(handlers.get(event) ?? []), handler as Handler<keyof AppEvents>]);
}

export async function emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): Promise<void> {
  for (const handler of handlers.get(event) ?? []) {
    try {
      await handler(payload);
    } catch (err) {
      // A failing listener must never break the action that triggered it.
      console.error(`Event handler for "${event}" failed:`, err);
    }
  }
}

export function clearEventHandlers(): void {
  handlers.clear();
}
