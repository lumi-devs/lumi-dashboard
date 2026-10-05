import { describe, it, expect } from "bun:test";
import { isRateLimited } from "#/lib/rate-limit";

describe("isRateLimited", () => {
  it("allows requests within the configured limit", async () => {
    const key = `test-within-limit-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(await isRateLimited(key, 5, 10_000)).toBe(false);
    }
  });

  it("blocks requests once the limit is exceeded", async () => {
    const key = `test-exceeded-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      expect(await isRateLimited(key, 3, 10_000)).toBe(false);
    }
    expect(await isRateLimited(key, 3, 10_000)).toBe(true);
    expect(await isRateLimited(key, 3, 10_000)).toBe(true);
  });

  it("isolates counters between distinct keys", async () => {
    const keyA = `key-a-${Date.now()}`;
    const keyB = `key-b-${Date.now()}`;

    expect(await isRateLimited(keyA, 1, 10_000)).toBe(false);
    expect(await isRateLimited(keyA, 1, 10_000)).toBe(true);

    expect(await isRateLimited(keyB, 1, 10_000)).toBe(false);
    expect(await isRateLimited(keyB, 1, 10_000)).toBe(true);
  });

  it("uses default parameters (30 points, 60s) when omitted", async () => {
    const key = `test-default-${Date.now()}`;
    expect(await isRateLimited(key)).toBe(false);
  });
});
