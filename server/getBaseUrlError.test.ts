import { getBaseUrlError } from "./getBaseUrlError";

describe("getBaseUrlError", () => {
  test("accepts an absolute URL", () => {
    expect(getBaseUrlError("http://localhost:3000")).toBeNull();
    expect(getBaseUrlError("https://www.improvedinitiative.app")).toBeNull();
  });

  test("rejects a missing BASE_URL", () => {
    expect(getBaseUrlError(undefined)).toContain("is not set");
    expect(getBaseUrlError("")).toContain("is not set");
  });

  test("rejects a value that cannot resolve a request path", () => {
    expect(getBaseUrlError("localhost:3000")).toContain("absolute URL");
    expect(getBaseUrlError("localhost:3000")).toContain("localhost:3000");
    expect(getBaseUrlError("www.improvedinitiative.app")).toContain(
      "absolute URL"
    );
    expect(getBaseUrlError("http://")).toContain("absolute URL");
  });
});
