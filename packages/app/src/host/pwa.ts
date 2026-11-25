// The app as an installed app (a PWA): its service worker (service-worker.js), a new version that waits for the player,
// the browser's offer to install it, and keeping its storage once installed. Not ported from Valkyrie.
import { update } from '../ui/store.ts';
import { keptFolder } from './storage.ts';

/** What Chromium browsers give with their offer to install (beforeinstallprompt), which TypeScript does not know. */
interface InstallPrompt extends Event {
  prompt(): Promise<void>;
}

let installPrompt: InstallPrompt | null = null;
/** The new version, waiting until the player reloads. */
let newVersion: ServiceWorker | null = null;
let reloadAsked = false;

/** Whether the app runs installed, in its own window. */
export function installed(): boolean {
  return matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

/** An iPhone or iPad, whose browsers install a web app only from Safari's Share menu (iPadOS says it is a Mac). */
export function appleMobile(): boolean {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Asks the browser not to clear what the app keeps when space runs short; installed apps usually get it. */
function keepStorage(): void {
  void navigator.storage?.persist?.().catch(() => false);
}

export function startPwa(): void {
  if (installed()) keepStorage();
  addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event as InstallPrompt;
    update({ canInstall: true });
  });
  addEventListener('appinstalled', () => {
    installPrompt = null;
    update({ canInstall: false });
    keepStorage();
  });

  // Only the built app has a service worker: in development every change must show at once
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  // The first version takes over without asking; a new one, when this window asked for it, or another window did, and
  // then this one offers to reload too
  const controlled = navigator.serviceWorker.controller !== null;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadAsked) location.reload();
    else if (controlled) update({ appUpdate: true });
  });
  void navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`)
    .then((registration) => {
      const offer = (worker: ServiceWorker) => {
        newVersion = worker;
        update({ appUpdate: true });
      };
      if (registration.waiting !== null && navigator.serviceWorker.controller !== null) offer(registration.waiting);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller !== null) offer(worker);
        });
      });
      // An installed app can stay open for days: look for a new version whenever it comes back to the front
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update().catch(() => undefined);
      });
    })
    .catch(() => undefined);
}

/** The browser's own window to install the app, when it offered one. */
export async function install(): Promise<void> {
  const prompt = installPrompt;
  if (prompt === null) return;
  installPrompt = null;
  update({ canInstall: false });
  await prompt.prompt();
}

/** Reloads the app with its new version, which takes over first unless another window already let it. */
export async function reloadNewVersion(): Promise<void> {
  // What is still being written to storage first: reloading would cut it short (a save can be tens of MB)
  await keptFolder()?.whenIdle();
  if (newVersion === null || newVersion.state !== 'installed') {
    location.reload();
    return;
  }
  reloadAsked = true;
  newVersion.postMessage('take-over');
}
