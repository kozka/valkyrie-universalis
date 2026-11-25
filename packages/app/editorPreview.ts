// Not in Valkyrie: whether the scenario editor is open to try in the published app (12 November 2026, for a few days),
// with a warning on entering and on a computer only (src/ui/EditorWarning.tsx). false puts it back as it was: development
// builds only, with no warning, and the built app without its code. vite.config.ts writes it into the app as
// __EDITOR_PREVIEW__, which the build folds away (an import would leave the editor in); the Playwright tests import it.
export const EDITOR_PREVIEW = true;
