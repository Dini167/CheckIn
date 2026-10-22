/**
 * Single source of "now" for the whole server. All attendance times come from here,
 * never from the client. Tests can freeze time with setClock().
 */
let override: (() => Date) | null = null;

export function now(): Date {
  return override ? override() : new Date();
}

export function setClock(fn: (() => Date) | null): void {
  override = fn;
}
