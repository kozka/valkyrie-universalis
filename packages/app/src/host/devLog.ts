// In development, the page's warnings and errors, and the traces devLog writes, go to the dev server, which appends
// them to packages/app/dev.log (vite.config.ts): what goes wrong on another computer can be read there without its
// console. Does nothing in a built app, where only the last warnings and errors are kept, for the player's reports
// (ui/Feedback.tsx). Not ported from Valkyrie.

function text(part: unknown): string {
  if (typeof part === 'string') return part;
  if (part instanceof Error) return `${part.name}: ${part.message}`;
  try {
    return JSON.stringify(part) ?? String(part);
  } catch {
    return String(part);
  }
}

/** Writes a line to dev.log. */
export function devLog(...parts: unknown[]): void {
  if (!import.meta.env.DEV) return;
  void fetch('/__dev-log', { method: 'POST', body: parts.map(text).join(' '), keepalive: true }).catch(() => undefined);
}

const KEPT = 20;
const recent: string[] = [];

function keep(...parts: unknown[]): void {
  recent.push(`${new Date().toISOString().substring(11, 19)} ${parts.map(text).join(' ')}`.substring(0, 500));
  if (recent.length > KEPT) recent.shift();
}

/** The last warnings and errors of the page, oldest first. */
export function recentProblems(): readonly string[] {
  return recent;
}

/** Keeps the console's warnings and errors, and the errors nobody caught; in development, also sends them to dev.log. */
export function forwardConsoleToDevLog(): void {
  const report = (...parts: unknown[]) => {
    keep(...parts);
    devLog(...parts);
  };
  for (const level of ['warn', 'error'] as const) {
    const write = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      write(...args);
      report(level, ...args);
    };
  }
  addEventListener('error', (event) => report('uncaught', event.message, `${event.filename}:${event.lineno}`));
  addEventListener('unhandledrejection', (event) => report('unhandled', event.reason));
}
