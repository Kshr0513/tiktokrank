import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | TikTok保存ランキング",
    default: "TikTok保存ランキング | Twitter保存ランキングのTikTok版 - 今バズってる動画",
  },
  description:
    "Twitter保存ランキングのようにTikTokの人気動画をリアルタイム集計。今みんなが注目している動画がわかります。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://tiktokrank.example.com"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "TikTok保存ランキング",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// S-6: サイト全体の WebSite 構造化データ
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TikTok保存ランキング",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "https://tiktokrank.example.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-rose-500">
              TikTok保存ランキング
            </a>
            <nav className="hidden sm:flex gap-4 text-sm text-gray-600">
              <a href="/ranking/realtime" className="hover:text-rose-500">リアルタイム</a>
              <a href="/" className="hover:text-rose-500">デイリー</a>
              <a href="/ranking/weekly" className="hover:text-rose-500">週間</a>
              <a href="/ranking/monthly" className="hover:text-rose-500">月間</a>
              <a href="/ranking/all" className="hover:text-rose-500">総合</a>
            </nav>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-500">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/about" className="hover:text-rose-500">このサイトについて</a>
            <a href="/terms" className="hover:text-rose-500">利用規約</a>
            <a href="/privacy" className="hover:text-rose-500">プライバシーポリシー</a>
            <a href="/contact" className="hover:text-rose-500">お問い合わせ</a>
          </div>
          <p className="mt-3">© {new Date().getFullYear()} TikTok保存ランキング</p>
        </footer>
      </body>
    </html>
  );
}
