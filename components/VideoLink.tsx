"use client";

interface Props {
  videoId: string;
  href: string;
}

export function VideoLink({ videoId, href }: Props) {
  function handleClick() {
    // fire-and-forget: クリック数を非同期で記録する（awaaitしない）
    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    }).catch(() => {
      // クリック記録失敗はサイレントに無視する
    });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className="shrink-0 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors text-center"
    >
      TikTokで見る
    </a>
  );
}
