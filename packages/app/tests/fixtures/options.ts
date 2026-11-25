// The options' controls (12 November 2026): a choice among several is a drop-down list, one that is on or off a
// switch (screens/OptionsScreen.tsx). `pick` chooses an entry of a list by its words, a text or a pattern.
import type { Locator } from '@playwright/test';

export async function pick(list: Locator, label: string | RegExp): Promise<void> {
  const texts = (await list.locator('option').allTextContents()).map((t) => t.trim());
  const index = texts.findIndex((t) => (typeof label === 'string' ? t === label : label.test(t)));
  if (index < 0) throw new Error(`No ${String(label)} among ${texts.join(', ')}`);
  await list.selectOption({ index });
}
