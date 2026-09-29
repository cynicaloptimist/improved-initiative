import * as lzmaModule from "lzma/src/lzma_worker";
import * as messagePack from "msgpack5/dist/msgpack5";
import * as safeBase64 from "urlsafe-base64";

interface BrowserBuffer {
  constructor: {
    from(value: number[]): BrowserBuffer;
  };
}

const lzma = lzmaModule.LZMA_WORKER;

export function DecompressLegacyUrlPayload(payload: string): Promise<string> {
  const compressed = safeBase64.decode(payload) as BrowserBuffer;

  return new Promise((resolve, reject) => {
    lzma.decompress(compressed, (decompressed: number[], error: Error) => {
      if (error) {
        reject(error);
        return;
      }

      const decoded = messagePack().decode(
        compressed.constructor.from(decompressed)
      );
      if (typeof decoded !== "string") {
        reject(new Error("Legacy URL payload did not contain a string"));
        return;
      }

      resolve(decoded);
    });
  });
}
