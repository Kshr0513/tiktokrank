"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmitForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    { type: "idle" } | { type: "loading" } | { type: "success"; message: string } | { type: "error"; message: string }
  >({ type: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus({ type: "loading" });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), website: "" }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        title?: string;
        count?: number;
      };

      if (!res.ok || !data.success) {
        setStatus({ type: "error", message: data.error ?? "エラーが発生しました" });
        return;
      }

      const msg = `「${data.title}」を投稿しました！ 現在${data.count}件の投稿`;
      setStatus({ type: "success", message: msg });
      setUrl("");
      router.refresh();
    } catch {
      setStatus({ type: "error", message: "通信エラーが発生しました" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="TikTokのリンクを貼り付けてください"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          disabled={status.type === "loading"}
          required
        />
        <button
          type="submit"
          disabled={status.type === "loading" || !url.trim()}
          className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {status.type === "loading" ? "投稿中…" : "投稿"}
        </button>
      </div>
      {status.type === "success" && (
        <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
          {status.message}
        </p>
      )}
      {status.type === "error" && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {status.message}
        </p>
      )}
    </form>
  );
}
