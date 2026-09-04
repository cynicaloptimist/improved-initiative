import { DecompressLegacyUrlPayload } from "./LegacyUrlCompression";

describe("DecompressLegacyUrlPayload", () => {
  it("decodes links produced by json-url 2", async () => {
    const payload =
      "XQAAAAIpAAAAAAAAAABsictiIogikbmtxlOFK_jBxcv6E762hMFnXm6hiUYMS94jP9wOG6TLFmGtdWpD__hLAAA";

    await expect(DecompressLegacyUrlPayload(payload)).resolves.toBe(
      JSON.stringify({ Name: "Legacy Goblin", HP: 7, AC: 15 })
    );
  });
});
