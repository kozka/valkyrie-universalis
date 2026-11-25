// Where the browser reads a file of the store from. The lists name GitLab files by their /-/raw/ address, which sends no
// CORS headers; GitLab's repository files API sends them. Not ported from Valkyrie.

/** gitlab.com/<project>/-/raw/<ref>/<path>, the form the store lists use for GitLab. */
const GITLAB_RAW = /^https:\/\/gitlab\.com\/(.+?)\/-\/raw\/([^/]+)\/(.+)$/;

function decoded(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** The address the browser can read the file at: the same, or GitLab's API for a GitLab raw file. */
export function readableUrl(url: string): string {
  const gitlab = GITLAB_RAW.exec(url);
  if (gitlab === null) return url;
  const [, project, ref, path] = gitlab as unknown as [string, string, string, string];
  return (
    'https://gitlab.com/api/v4/projects/' +
    encodeURIComponent(decoded(project)) +
    '/repository/files/' +
    encodeURIComponent(decoded(path)) +
    '/raw?ref=' +
    encodeURIComponent(decoded(ref))
  );
}
