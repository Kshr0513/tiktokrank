import { describe, it, expect } from "vitest";
import { normalizeTikTokUrl, TikTokUrlError } from "./tiktok";

describe("normalizeTikTokUrl", () => {
  it("extracts video ID from standard URL", async () => {
    const { videoId } = await normalizeTikTokUrl(
      "https://www.tiktok.com/@user/video/7123456789012345678"
    );
    expect(videoId).toBe("7123456789012345678");
  });

  it("builds canonical URL with username", async () => {
    const { canonicalUrl } = await normalizeTikTokUrl(
      "https://www.tiktok.com/@myuser/video/7123456789012345678"
    );
    expect(canonicalUrl).toBe(
      "https://www.tiktok.com/@myuser/video/7123456789012345678"
    );
  });

  it("rejects non-tiktok domain", async () => {
    await expect(
      normalizeTikTokUrl("https://example.com/video/123")
    ).rejects.toThrow(TikTokUrlError);
  });

  it("rejects invalid URL", async () => {
    await expect(normalizeTikTokUrl("not-a-url")).rejects.toThrow(TikTokUrlError);
  });

  it("rejects tiktok URL without video ID", async () => {
    await expect(
      normalizeTikTokUrl("https://www.tiktok.com/@user")
    ).rejects.toThrow(TikTokUrlError);
  });
});
