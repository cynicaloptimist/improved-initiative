import axios from "axios";
import {
  globalHttpAgent,
  globalHttpsAgent
} from "request-filtering-agent";
import { fetchRemoteText } from "./fetchRemoteText";

jest.mock("axios");
jest.mock("request-filtering-agent", () => ({
  globalHttpAgent: { protocol: "http:" },
  globalHttpsAgent: { protocol: "https:" }
}));

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>;

describe("fetchRemoteText", () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  test("fetches bounded text using agents that block private addresses", async () => {
    mockedGet.mockResolvedValue({
      data: "encounter data",
      status: 200,
      headers: {}
    });

    await expect(
      fetchRemoteText("https://example.com/encounter.json")
    ).resolves.toBe("encounter data");

    expect(mockedGet).toHaveBeenCalledWith(
      "https://example.com/encounter.json",
      expect.objectContaining({
        httpAgent: globalHttpAgent,
        httpsAgent: globalHttpsAgent,
        maxContentLength: 1000000,
        maxRedirects: 5,
        proxy: false,
        responseType: "text",
        signal: expect.objectContaining({ aborted: false }),
        timeout: 10000
      })
    );
  });

  test("rejects non-standard ports", async () => {
    await expect(
      fetchRemoteText("https://example.com:8443/encounter.json")
    ).rejects.toThrow("Only standard HTTP and HTTPS ports are allowed.");
    await expect(
      fetchRemoteText("http://example.com:8080/encounter.json")
    ).rejects.toThrow("Only standard HTTP and HTTPS ports are allowed.");
    expect(mockedGet).not.toHaveBeenCalled();
  });

  test("revalidates port and credentials after redirects", async () => {
    mockedGet.mockResolvedValue({ data: "{}", status: 200, headers: {} });

    await fetchRemoteText("https://example.com/encounter.json");
    const requestOptions = mockedGet.mock.calls[0][1]!;
    const beforeRedirect = requestOptions.beforeRedirect!;

    expect(() =>
      beforeRedirect(
        { protocol: "https:", port: 8443 },
        {} as any,
        {} as any
      )
    ).toThrow("Only standard HTTP and HTTPS ports are allowed.");
    expect(() =>
      beforeRedirect(
        { protocol: "https:", port: 443, auth: "user:password" },
        {} as any,
        {} as any
      )
    ).toThrow("Redirect URLs with credentials are not allowed.");
    expect(() =>
      beforeRedirect(
        { protocol: "http:", port: 80 },
        {} as any,
        {} as any
      )
    ).not.toThrow();
  });

  test("rejects a non-success response", async () => {
    mockedGet.mockResolvedValue({ data: "", status: 404, headers: {} });

    await expect(fetchRemoteText("https://example.com/missing")).rejects.toThrow(
      "Remote server returned HTTP 404."
    );
  });

  test("limits concurrent outbound requests", async () => {
    const responseResolvers: Array<(response: any) => void> = [];
    mockedGet.mockImplementation(
      () =>
        new Promise(resolve => {
          responseResolvers.push(resolve);
        })
    );

    const activeRequests = Array.from({ length: 10 }, (_, index) =>
      fetchRemoteText(`https://example.com/encounter-${index}.json`)
    );
    await expect(
      fetchRemoteText("https://example.com/one-too-many.json")
    ).rejects.toThrow("Too many remote requests are in progress.");

    responseResolvers.forEach(resolve =>
      resolve({ data: "{}", status: 200, headers: {} })
    );
    await expect(Promise.all(activeRequests)).resolves.toHaveLength(10);
  });

  test("rejects unsupported protocols and credentials", async () => {
    await expect(fetchRemoteText("file:///etc/passwd")).rejects.toThrow(
      "Only HTTP and HTTPS URLs are allowed."
    );
    await expect(
      fetchRemoteText("https://user:password@example.com")
    ).rejects.toThrow("URLs with credentials are not allowed.");
    expect(mockedGet).not.toHaveBeenCalled();
  });
});
