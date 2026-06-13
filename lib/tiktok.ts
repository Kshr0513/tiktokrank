const ALLOWED_HOSTS = new Set([
  "www.tiktok.com",
  "tiktok.com",
  "vm.tiktok.com",
  "vt.tiktok.com",
  "m.tiktok.com",
]);

// @username/video/id を両方キャプチャ
const VIDEO_RE = /\/@([^/?#]+)\/video\/(\d+)/;

export class TikTokUrlError extends Error {}

async function resolveRedirects(url: string): Promise<string> {
  const res = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  return res.url;
}

function parseVideoUrl(url: string): { username: string; videoId: string } {
  const match = VIDEO_RE.exec(url);
  if (!match) throw new TikTokUrlError("動画IDを抽出できませんでした");
  return { username: match[1], videoId: match[2] };
}

export async function normalizeTikTokUrl(
  raw: string
): Promise<{ videoId: string; canonicalUrl: string }> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new TikTokUrlError("URLの形式が正しくありません");
  }

  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new TikTokUrlError("TikTokのURLのみ投稿できます");
  }

  const isShort =
    parsed.hostname === "vm.tiktok.com" || parsed.hostname === "vt.tiktok.com";

  let longUrl = raw;
  if (isShort) {
    longUrl = await resolveRedirects(raw);
    // C-1: リダイレクト先が TikTok ドメイン外の場合 SSRF になるため再検証
    let resolvedHost: string;
    try {
      resolvedHost = new URL(longUrl).hostname;
    } catch {
      throw new TikTokUrlError("リダイレクト先のURLが不正です");
    }
    if (!ALLOWED_HOSTS.has(resolvedHost)) {
      throw new TikTokUrlError("TikTokのURLのみ投稿できます");
    }
  }

  // C-3: username を含む正しい canonical URL を構築
  const { username, videoId } = parseVideoUrl(longUrl);
  const canonicalUrl = `https://www.tiktok.com/@${username}/video/${videoId}`;
  return { videoId, canonicalUrl };
}

export interface OEmbedData {
  title: string;
  authorName: string;
  thumbnailUrl: string;
}

export async function fetchOEmbed(videoUrl: string): Promise<OEmbedData> {
  try {
    const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`oEmbed ${res.status}`);
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
    };
    return {
      title: data.title ?? "TikTok動画",
      authorName: data.author_name ?? "",
      thumbnailUrl: data.thumbnail_url ?? "",
    };
  } catch {
    return { title: "TikTok動画", authorName: "", thumbnailUrl: "" };
  }
}

export async function checkVideoExists(videoUrl: string): Promise<boolean> {
  try {
    const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    // W-9: 404のみ削除済みと判断。400は一時的なAPIエラーの可能性があるため存在扱い
    if (res.status === 404) return false;
    return true;
  } catch {
    return true;
  }
}
