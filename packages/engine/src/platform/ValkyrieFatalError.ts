// What becomes of Application.Quit() on Valkyrie's fatal paths: the scenario stops with a clear reason.
// Not ported from Valkyrie. The app shows it and the battery counts it as "fatal".

export class ValkyrieFatalError extends Error {
  /** Short code for the battery and the validator, e.g. "duplicate-component". */
  readonly reason: string;
  /** The component, file or pack involved. */
  readonly component: string;

  constructor(reason: string, component: string, message: string) {
    super(message);
    this.name = 'ValkyrieFatalError';
    this.reason = reason;
    this.component = component;
  }
}
