import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | TikTok保存ランキング",
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-sm max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
      <p className="text-sm text-gray-500">最終更新日: 2024年1月1日</p>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">収集する情報</h2>
        <p className="text-gray-700 leading-relaxed">
          本サービスは以下の情報を収集します。
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          <li>
            <strong>IPアドレス（ハッシュ化）</strong>: スパム対策のため、
            SHA-256でハッシュ化したIPアドレスを保存します。元のIPアドレスは保存しません。
          </li>
          <li>
            <strong>投稿されたTikTok URL</strong>: ランキング集計のため保存します。
          </li>
          <li>
            <strong>アクセスログ</strong>: サーバーの通常のアクセスログとして記録される場合があります。
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Cookieと広告</h2>
        <p className="text-gray-700 leading-relaxed">
          本サービスは広告配信のためにGoogle AdSense等の広告ネットワークを利用する場合があります。
          これらのサービスはCookieを使用してユーザーに関連性の高い広告を表示します。
          詳細は各広告ネットワークのプライバシーポリシーをご確認ください。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">アクセス解析</h2>
        <p className="text-gray-700 leading-relaxed">
          本サービスはGoogle Analytics 4を利用したアクセス解析を行う場合があります。
          収集されたデータはGoogleのプライバシーポリシーに基づき管理されます。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">情報の第三者提供</h2>
        <p className="text-gray-700 leading-relaxed">
          法令に基づく場合を除き、収集した情報を第三者に提供することはありません。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">お問い合わせ</h2>
        <p className="text-gray-700 leading-relaxed">
          プライバシーに関するお問い合わせは
          <a href="/contact" className="text-rose-500 hover:underline">お問い合わせページ</a>
          よりご連絡ください。
        </p>
      </section>
    </div>
  );
}
