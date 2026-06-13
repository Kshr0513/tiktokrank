import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | TikTok保存ランキング",
};

export default function TermsPage() {
  return (
    <div className="prose prose-sm max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">利用規約</h1>
      <p className="text-sm text-gray-500">最終更新日: 2024年1月1日</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">第1条（本サービスについて）</h2>
        <p className="text-gray-700 leading-relaxed">
          TikTok保存ランキング（以下「本サービス」）は、ユーザーが投稿したTikTok動画リンクを集計し、
          ランキング形式で表示するサービスです。当サービスは動画を保存・複製・配信する機能を一切提供しません。
          各動画リンクはTikTok公式サイト（tiktok.com）へ直接遷移します。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">第2条（禁止事項）</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>TikTok以外のURLの投稿</li>
          <li>スパム・連続投稿などの不正行為</li>
          <li>他者の権利を侵害するコンテンツの投稿・通報の悪用</li>
          <li>本サービスの運営を妨害する行為</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">第3条（免責事項）</h2>
        <p className="text-gray-700 leading-relaxed">
          本サービスはリンク集計サービスであり、リンク先コンテンツの内容について責任を負いません。
          サービスの停止・変更・終了等によって生じた損害についても責任を負いません。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">第4条（知的財産権）</h2>
        <p className="text-gray-700 leading-relaxed">
          本サービスに表示される動画情報・サムネイルはTikTokのoEmbed APIを通じて取得しており、
          著作権はそれぞれの権利者に帰属します。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">第5条（利用規約の変更）</h2>
        <p className="text-gray-700 leading-relaxed">
          本規約は事前通知なく変更する場合があります。変更後も継続して本サービスをご利用の場合は、
          変更後の規約に同意したものとみなします。
        </p>
      </section>
    </div>
  );
}
