import { URL } from "url";

// "localhost:3000" parses on its own as a URL with the scheme "localhost:", so
// resolve a path against the value, which is what the routes do with it.
export function getBaseUrlError(baseUrl: string | undefined): string | null {
  if (!baseUrl?.length) {
    return "BASE_URL environment variable is not set. Cannot start server.";
  }

  try {
    new URL("/", baseUrl);
  } catch {
    return (
      `BASE_URL environment variable "${baseUrl}" must be an absolute URL ` +
      `with a scheme and a host, for example "http://localhost:3000". ` +
      `Cannot start server.`
    );
  }

  return null;
}
