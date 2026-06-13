# TikTok保存ランキング — プロジェクト指示書

## プロジェクト概要

「Twitter保存ランキング」のTikTok版となるWebサイトを開発する。

- ユーザーがTikTokの共有リンク(動画URL)をサイトに投稿する
- 同一動画のリンクが投稿された回数を集計し、ランキング形式で表示する
- **サイト上でのダウンロード機能は一切実装しない。** ランキングの各項目はTikTok本体へのリンクであり、保存したいユーザーはTikTok側で行う
- 収益化は広告枠による(実装時はプレースホルダーのみ用意)

## 技術スタック

- **フレームワーク**: Next.js (App Router, TypeScript)
- **DB**: PostgreSQL + Prisma(ローカル開発はSQLiteでも可。schema.prismaで切替できる構成にする)
- **スタイル**: Tailwind CSS
- **デプロイ想定**: Vercel + Supabase(またはVPS)
- **メタデータ取得**: TikTok oEmbed API(`https://www.tiktok.com/oembed?url=...`)でタイトル・投稿者名・サムネイルURLを取得

## 最重要要件

1. **SEOファースト**: ランキングページは必ずSSR/ISRで描画する。クライアントサイドレンダリングのみのランキングは禁止。メタタグ・構造化データ・sitemap.xmlは初期実装に含める。詳細は `docs/seo-strategy.md` を必ず参照すること
2. **動画の重複排除**: TikTok URLは複数形式がある(`vm.tiktok.com/xxx`, `www.tiktok.com/@user/video/123...`, `vt.tiktok.com/xxx`)。短縮URLはリダイレクト解決して**動画ID単位で正規化**し、同一動画として集計する
3. **スパム対策**: 同一IP×同一動画の投稿は24時間に1回までカウント。レートリミット(IP単位で1分あたりN回)を実装する
4. **コンテンツモデレーション**: NGワードフィルタ、通報ボタン、管理者による非表示フラグを初期実装に含める(広告審査対策として必須)

## 機能仕様

詳細は `docs/requirements.md` を参照。実装前に必ず読むこと。

## ディレクトリ規約

```
src/
  app/            # App Router ページ
    page.tsx      # トップ = 24時間ランキング
    ranking/[period]/  # daily / weekly / monthly / all
    video/[id]/   # 動画個別ページ(SEO用ロングテール)
    api/submit/   # リンク投稿API
    api/report/   # 通報API
  components/
  lib/            # URL正規化、oEmbed、レートリミット等
prisma/
docs/
```

## コーディング規約

- TypeScript strict モード
- サーバー側のバリデーションは zod を使用
- 環境変数は `.env.example` に必ず追記
- コミットは機能単位で日本語メッセージ可

## サブエージェントの使い分け

- 実装タスク → `fullstack-dev`
- SEO記事・メタ文言・構造化データ → `seo-writer`
- 実装後のレビュー → `code-reviewer`(機能実装が終わったら必ず実行)

## やらないこと(スコープ外)

- 動画ファイルのダウンロード・保存・プロキシ配信(TikTok規約違反になるため絶対に実装しない)
- 動画の埋め込み再生以外の動画データ取得・スクレイピング
- ユーザー登録機能(v1では不要。投稿は匿名)
