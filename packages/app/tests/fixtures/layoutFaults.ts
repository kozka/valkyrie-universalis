// What is wrong with the game's windows as they are drawn now (11 November 2026): a window off the screen, two that
// cover each other, a part of a window drawn past its frame where nothing scrolls, a button covered by something else
// or out of reach, a button whose words are cut, and a page wider than the screen. A button inside a box that scrolls
// is in reach, as a player scrolls to it, and so is one under a box's sticky buttons. Shared by monsterpanel.spec.ts
// and windows.spec.ts. The page's code goes as text, as the tests' tsconfig has no DOM types.
import type { Page } from '@playwright/test';

const FAULTS = `(() => {
  const found = [];
  const name = (e) => (e.getAttribute('aria-label') || e.textContent || e.className.toString()).trim().slice(0, 30);
  const inView = (r) => r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1;
  if (document.documentElement.scrollWidth > innerWidth + 1) found.push('page wider than the screen (' + document.documentElement.scrollWidth + ')');
  const tops = [...document.querySelectorAll('.dialog-stack > *, .window-layer:not(.dialog-layer) > *')].filter((e) => e.getBoundingClientRect().width > 0);
  const scrolls = (e) => /(auto|scroll|hidden)/.test(getComputedStyle(e).overflowY);
  for (const top of tops) {
    const r = top.getBoundingClientRect();
    if (!inView(r)) found.push(top.className + ' off the screen');
    for (const part of top.querySelectorAll('*')) {
      const q = part.getBoundingClientRect();
      if (q.width === 0 || q.height === 0) continue;
      let clipped = false;
      for (let p = part.parentElement; p !== null && p !== top.parentElement; p = p.parentElement) if (scrolls(p)) clipped = true;
      if (clipped) continue;
      if (q.bottom > r.bottom + 2 || q.right > r.right + 2 || q.left < r.left - 2 || q.top < r.top - 2) {
        found.push((part.className.toString() || part.tagName) + ' drawn past ' + top.className);
        break;
      }
    }
  }
  for (let i = 0; i < tops.length; i++)
    for (let j = i + 1; j < tops.length; j++) {
      const a = tops[i].getBoundingClientRect();
      const b = tops[j].getBoundingClientRect();
      if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) found.push(tops[i].className + ' over ' + tops[j].className);
    }
  const scrollBox = (e) => {
    for (let p = e.parentElement; p !== null; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(auto|scroll)/.test(s.overflowY + s.overflowX) && (p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1)) return p;
    }
    return null;
  };
  for (const button of document.querySelectorAll('.window-layer :is(button, input, textarea)')) {
    const r = button.getBoundingClientRect();
    if (r.width === 0 || getComputedStyle(button).visibility === 'hidden') continue;
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const box = scrollBox(button);
    if (box !== null) {
      const b = box.getBoundingClientRect();
      if (y < b.top || y > b.bottom || x < b.left || x > b.right) continue;
    }
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) {
      found.push(name(button) + ' out of reach');
      continue;
    }
    const hit = document.elementFromPoint(x, y);
    if (hit !== null && (hit === button || button.contains(hit))) continue;
    const sticky = hit && hit.closest('.event-buttons');
    if (box !== null && sticky && getComputedStyle(sticky).position === 'sticky' && box.contains(sticky)) continue;
    found.push(name(button) + ' covered');
  }
  // A button's words cut: wider than the button, which hides them
  for (const button of document.querySelectorAll('.window-layer .button')) {
    if (button.getBoundingClientRect().width > 0 && button.scrollWidth > button.clientWidth + 2) found.push(name(button) + ' cut');
  }
  return found;
})()`;

export function layoutFaults(page: Page): Promise<string[]> {
  return page.evaluate<string[]>(FAULTS);
}

/**
 * Leaves the page's styles as a browser without container queries (Chrome before 105) reads them: no @container rules,
 * no @supports blocks that ask for them, and the @supports not (container-type) blocks applied, so that what those
 * browsers get can be checked in this one.
 */
export function withoutContainerQueries(page: Page): Promise<void> {
  return page.evaluate<void>(`(() => {
    const walk = (rules, owner) => {
      for (let i = rules.length - 1; i >= 0; i--) {
        const rule = rules[i];
        if (rule instanceof CSSContainerRule) owner.deleteRule(i);
        else if (rule instanceof CSSSupportsRule && /not \\(container-type/.test(rule.conditionText)) {
          const inner = [...rule.cssRules].map((r) => r.cssText);
          owner.deleteRule(i);
          for (const text of inner.reverse()) owner.insertRule(text, i);
        } else if (rule instanceof CSSSupportsRule && /cq|container/.test(rule.conditionText)) owner.deleteRule(i);
        else if (rule instanceof CSSGroupingRule) walk(rule.cssRules, rule);
      }
    };
    for (const sheet of document.styleSheets) walk(sheet.cssRules, sheet);
  })()`);
}
