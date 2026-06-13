import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TikTok保存ランキングとは？使い方・よくある質問",
  description:
    "TikTok保存ランキングはTwitter保存ランキングのTikTok版です。TikTok動画URLを投稿すると投稿数で人気ランキングを自動集計。ユーザー登録不要、匿名で利用できます。",
};

const faqs = [
  {
    q: "投稿した動画はいつランキングに反映されますか？",
    a: "投稿は即時に集計へ反映されます。ランキング表示は定期的に更新されるため、順位への反映には最大数分かかる場合があります。",
  },
  {
    q: "同じ動画を何度も投稿できますか？",
    a: "同一のIPアドレスから同一動画への投稿は、24時間に1カウントまでとなります。24時間以内の重複投稿はカウントされませんが、投稿操作自体は受け付けます。",
  },
  {
    q: "動画をダウンロード・保存することはできますか？",
    a: "当サイトでは動画のダウンロード・保存・プロキシ配信の機能を一切提供していません。各ランキング項目のリンクからTikTok公式サイトへ移動し、TikTok側の機能をご利用ください。",
  },
  {
    q: "不適切な動画を見つけたらどうすれば良いですか？",
    a: "各ランキング項目に表示されている通報ボタンからご報告ください。内容を確認のうえ、速やかに非表示等の対処を行います。権利侵害に関する削除依頼はお問い合わせページよりご連絡ください。",
  },
  {
    q: "Twitter保存ランキングとの違いは何ですか？",
    a: "Twitter保存ランキングはX（Twitter）上のコンテンツを対象としたサービスです。当サイトはTikTok動画に特化したランキングサービスであり、Twitter保存ランキングとは運営主体・対象プラットフォームともに別のサービスです。",
  },
];

export default function AboutPage() {
  return (
    <div className="prose prose-sm max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">TikTok保存ランキングとは？</h1>

      {/* このサイトについて */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">このサイトについて</h2>
        <p className="text-gray-700 leading-relaxed">
          TikTok保存ランキングは、Twitter保存ランキングのTikTok版として作られたランキングサービスです。
          ユーザーがTikTok動画のURLを投稿すると、同一動画への投稿数が自動集計され、
          「今みんなが注目しているTikTok人気動画」としてランキングに反映されます。
          ユーザー登録は不要で、匿名のまま投稿・閲覧できます。
        </p>
        <p className="text-gray-700 leading-relaxed">
          当サイトはリンクの集計・ランキング表示のみを行います。
          動画のダウンロード・保存・プロキシ配信は一切行いません。
          各ランキング項目のリンクはTikTok公式サイトへ直接移動します。
        </p>
      </section>

      {/* 使い方 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">使い方</h2>
        <ol className="space-y-4 list-none pl-0">
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-sm">
              1
            </span>
            <div>
              <p className="font-medium text-gray-900">TikTok動画のURLを投稿する</p>
              <p className="text-gray-600 text-sm leading-relaxed mt-1">
                TikTokアプリまたはブラウザで気になる動画の共有リンクをコピーし、
                トップページの投稿フォームに貼り付けて送信します。ユーザー登録は不要です。
              </p>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-sm">
              2
            </span>
            <div>
              <p className="font-medium text-gray-900">投稿数が自動集計される</p>
              <p className="text-gray-600 text-sm leading-relaxed mt-1">
                同じ動画のリンクが多く投稿されるほど、その動画のスコアが上がります。
                異なるURL形式で投稿された場合も同一動画として集計します。
              </p>
            </div>
          </li>
          <li className="flex gap-4 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-sm">
              3
            </span>
            <div>
              <p className="font-medium text-gray-900">ランキングでTikTok人気動画を確認する</p>
              <p className="text-gray-600 text-sm leading-relaxed mt-1">
                24時間・週間・月間・累計のランキングを随時確認できます。
                気になる動画のタイトルをタップするとTikTok公式へ移動します。
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* よくある質問 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">よくある質問（FAQ）</h2>
        <dl className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-4">
              <dt className="font-medium text-gray-900 mb-1">Q. {faq.q}</dt>
              <dd className="text-gray-600 text-sm leading-relaxed">A. {faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 免責事項 */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">免責事項</h2>
        <p className="text-gray-700 leading-relaxed">
          当サイトはTikTok公式のサービスではなく、ByteDance Ltd.とは一切関係ありません。
          当サイトに表示されるサムネイル・動画情報はTikTokが提供するoEmbed APIを通じて取得しており、
          著作権はそれぞれの権利者に帰属します。
        </p>
        <p className="text-gray-700 leading-relaxed">
          当サイトはリンク先コンテンツの内容について責任を負いません。
          不適切なコンテンツを見つけた場合は通報ボタンをご利用ください。
          サービスの停止・変更・終了等によって生じた損害についても責任を負いません。
        </p>
      </section>

      {/* FAQPage 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />
    </div>
  );
}
