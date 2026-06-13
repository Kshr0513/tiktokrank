import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて | TikTok保存ランキング",
  description:
    "TikTok保存ランキングは、Twitter保存ランキングのTikTok版です。みんなが保存したいTikTok動画を集計してランキング形式で表示します。",
};

export default function AboutPage() {
  const faqs = [
    {
      q: "Twitter保存ランキングとの違いは？",
      a: "Twitter保存ランキングはTwitter(X)の動画・ツイートを対象としたサービスですが、当サイトはTikTokの動画に特化したランキングサイトです。仕組みは同様で、ユーザーが投稿したリンクの集計数を順位として表示しています。",
    },
    {
      q: "動画は保存できますか？",
      a: "当サイトでは動画の保存・ダウンロード機能は提供していません。動画の保存はTikTok公式アプリまたはサイト上でのみ行えます。当サイトはあくまでリンクの集計・ランキング表示のみを行います。",
    },
    {
      q: "どうやってランキングに参加するの？",
      a: "トップページの投稿フォームにTikTokの動画URLを貼り付けて投稿するだけです。同じ動画が多く投稿されるほどランキングが上がります。同一IPアドレスからの同一動画への投稿は24時間に1カウントとなります。",
    },
    {
      q: "不適切なコンテンツが表示されている場合は？",
      a: "各ランキング項目の通報ボタンからご報告ください。確認後、速やかに対処いたします。また、権利侵害等の削除依頼はお問い合わせページよりご連絡ください。",
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-bold">このサイトについて</h1>

      <section>
        <h2 className="text-lg font-semibold mb-2">TikTok保存ランキングとは</h2>
        <p className="text-gray-700 leading-relaxed">
          「Twitter保存ランキング」と同じ体験をTikTokで提供するランキングサイトです。
          ユーザーがTikTokの共有リンクを投稿すると、同一動画への投稿数が集計され、
          「今みんなが注目している動画」としてランキングに反映されます。
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          当サイトはリンクの集計・表示のみを行います。動画のダウンロード・保存・プロキシ配信は
          一切行いません。各ランキング項目のリンクはTikTok公式サイトへ直接遷移します。
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">よくある質問</h2>
        <dl className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white border border-gray-200 rounded-xl p-4">
              <dt className="font-medium text-gray-900 mb-1">Q. {faq.q}</dt>
              <dd className="text-gray-600 text-sm leading-relaxed">A. {faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

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
