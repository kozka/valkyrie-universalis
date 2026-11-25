// Not in Valkyrie: a part of the screen that fails to draw shows the stop window (App.tsx StopWindow) and draws nothing,
// leaving the rest as it is, as Unity logs an exception and keeps the scene. It draws again once the player leaves
// the stop window, by going on playing or otherwise.
import { Component, type ReactNode } from 'react';
import { update, useUI } from './store.ts';

class Boundary extends Component<{ children: ReactNode; clear: boolean }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    console.error(error);
    if (useUI.getState().stop === null) {
      update({ stop: { message: error instanceof Error ? error.message : String(error), detail: error instanceof Error ? (error.stack ?? '') : '' } });
    }
  }

  override componentDidUpdate(): void {
    if (this.state.failed && this.props.clear) this.setState({ failed: false });
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

/** Draws its children, or nothing while what failed in them waits on the stop window. */
export function Guard({ children }: { children: ReactNode }) {
  const clear = useUI((s) => s.stop === null);
  return <Boundary clear={clear}>{children}</Boundary>;
}
