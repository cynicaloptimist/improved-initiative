import axios, { AxiosResponse, GenericAbortSignal } from "axios";
import { URL } from "url";

type RequestFilteringAgentModule = typeof import("request-filtering-agent");
type GlobalWithAbortSignal = typeof global & {
  AbortSignal: {
    timeout(milliseconds: number): GenericAbortSignal;
  };
};

const maximumResponseBytes = 1000000;
const maximumRedirects = 5;
const maximumConcurrentRequests = 10;
const requestTimeoutMilliseconds = 10000;
let activeRequestCount = 0;

function assertAllowedProtocolAndPort(protocol: string, port: string): void {
  const allowedPort = protocol === "http:" ? "80" : "443";
  if (
    (protocol !== "http:" && protocol !== "https:") ||
    (port !== "" && port !== allowedPort)
  ) {
    throw new Error("Only standard HTTP and HTTPS ports are allowed.");
  }
}

function parseRemoteUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch (_) {
    throw new Error("Invalid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }
  assertAllowedProtocolAndPort(url.protocol, url.port);
  if (url.username || url.password) {
    throw new Error("URLs with credentials are not allowed.");
  }
  return url;
}

function validateRedirect(options: Record<string, any>): void {
  assertAllowedProtocolAndPort(
    String(options.protocol || ""),
    options.port == null ? "" : String(options.port)
  );
  if (options.auth) {
    throw new Error("Redirect URLs with credentials are not allowed.");
  }
}

export async function fetchRemoteText(input: string): Promise<string> {
  const url = parseRemoteUrl(input);
  if (activeRequestCount >= maximumConcurrentRequests) {
    throw new Error("Too many remote requests are in progress.");
  }
  activeRequestCount++;

  try {
    return await fetchValidatedRemoteText(url);
  } finally {
    activeRequestCount--;
  }
}

async function fetchValidatedRemoteText(url: URL): Promise<string> {
  // Node 24 supports requiring synchronous ES modules. Keeping this at the
  // request boundary also lets the CommonJS Jest runtime replace the module.
  const { globalHttpAgent, globalHttpsAgent } = require(
    "request-filtering-agent"
  ) as RequestFilteringAgentModule;
  const signal = (global as GlobalWithAbortSignal).AbortSignal.timeout(
    requestTimeoutMilliseconds
  );
  const response: AxiosResponse<string> = await axios.get(url.toString(), {
    httpAgent: globalHttpAgent,
    httpsAgent: globalHttpsAgent,
    responseType: "text",
    timeout: requestTimeoutMilliseconds,
    maxContentLength: maximumResponseBytes,
    maxBodyLength: maximumResponseBytes,
    maxRedirects: maximumRedirects,
    beforeRedirect: validateRedirect,
    proxy: false,
    signal,
    validateStatus: () => true
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Remote server returned HTTP ${response.status}.`);
  }
  if (Buffer.byteLength(response.data, "utf8") > maximumResponseBytes) {
    throw new Error("Remote response is too large.");
  }
  return response.data;
}
