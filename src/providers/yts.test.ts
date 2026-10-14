import { afterEach, describe, expect, test } from "bun:test";
import { base64EncodeImage } from "./yts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Replies with each response in turn (the last one repeats); returns a call counter. */
function stubFetch(responses: Array<Response | Error>) {
  let calls = 0;
  globalThis.fetch = (async () => {
    const next = responses[Math.min(calls++, responses.length - 1)]!;
    if (next instanceof Error) throw next;
    return next.clone();
  }) as unknown as typeof fetch;
  return () => calls;
}

const jpeg = () => new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/jpeg" } });

describe("base64EncodeImage", () => {
  test("retries a 525 and then succeeds", async () => {
    const calls = stubFetch([new Response("", { status: 525 }), jpeg()]);
    const out = await base64EncodeImage("https://img.test/a.jpg", { delayMs: 0 });
    expect(out).toBe("data:image/jpeg;base64,AQID");
    expect(calls()).toBe(2);
  });

  test("does not retry a 404", async () => {
    const calls = stubFetch([new Response("", { status: 404 })]);
    expect(await base64EncodeImage("https://img.test/a.jpg", { delayMs: 0 })).toBe("");
    expect(calls()).toBe(1);
  });

  test("gives up after the allowed attempts", async () => {
    const calls = stubFetch([new Response("", { status: 525 })]);
    expect(await base64EncodeImage("https://img.test/a.jpg", { delayMs: 0 })).toBe("");
    expect(calls()).toBe(3);
  });
});