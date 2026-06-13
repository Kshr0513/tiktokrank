"use client";

import { useState } from "react";

interface Props {
  videoId: string;
}

export function ReportButton({ videoId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit() {
    if (!reason.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, reason }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        aria-label="通報"
      >
        通報
      </button>
    );
  }

  return (
    <div className="text-xs space-y-1.5">
      {status === "done" ? (
        <p className="text-green-600">通報を受け付けました</p>
      ) : (
        <>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="通報理由（著作権侵害、不適切なコンテンツ等）"
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs resize-none"
            rows={2}
            maxLength={500}
            disabled={status === "loading"}
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={status === "loading" || !reason.trim()}
              className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-50"
            >
              送信
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-500 px-2 py-1"
            >
              キャンセル
            </button>
          </div>
          {status === "error" && (
            <p className="text-red-500">送信に失敗しました</p>
          )}
        </>
      )}
    </div>
  );
}
