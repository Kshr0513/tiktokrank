import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ | TikTok保存ランキング",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">お問い合わせ</h1>

      <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h2 className="font-semibold text-amber-800 mb-1">削除依頼について</h2>
        <p className="text-sm text-amber-700 leading-relaxed">
          著作権等の権利侵害があると判断される場合は、下記よりご連絡ください。
          動画ID・権利者名・連絡先を明記の上お送りいただくと対処が早まります。
          当サービスは動画本体を保存・配信しておらず、TikTok公式へのリンクのみを表示しています。
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-gray-700 mb-4">
          以下のメールアドレスまたはフォームよりお問い合わせください。
        </p>
        <p className="font-medium">
          メール: <a href="mailto:contact@tiktokrank.example.com" className="text-rose-500 hover:underline">contact@tiktokrank.example.com</a>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          ※ 通常2〜3営業日以内に返信いたします。
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold mb-3">よくあるお問い合わせ</h2>
        <ul className="space-y-3 text-sm text-gray-700">
          <li>
            <strong>コンテンツの通報:</strong> 各ランキング項目の「通報」ボタンをご利用ください。
          </li>
          <li>
            <strong>動画の削除依頼:</strong> 権利侵害の場合はメールにて動画IDと権利者情報をお送りください。
          </li>
          <li>
            <strong>掲載依頼・広告:</strong> 申し訳ありませんが、掲載依頼は受け付けておりません。
          </li>
        </ul>
      </section>
    </div>
  );
}
