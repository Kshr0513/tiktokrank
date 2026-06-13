# Claude Code 開発キット — TikTok保存ランキング

このフォルダ一式を新しいプロジェクトフォルダのルートに置いて、そのフォルダで `claude` を起動してください。

## ファイル構成

```
CLAUDE.md                      # Claude Codeが毎回読むプロジェクト指示書
docs/
  requirements.md              # 要件定義(ページ構成・DB・スパム対策)
  seo-strategy.md              # SEO戦略(キーワード設計・技術SEO・リスク管理)
.claude/agents/
  fullstack-dev.md             # 実装担当エージェント
  seo-writer.md                # SEOコンテンツ担当エージェント
  code-reviewer.md             # レビュー担当エージェント
```

## 進め方(推奨フェーズ)

そのままコピペで使えるプロンプト例です。1フェーズずつ進めて、都度動作確認するのがおすすめです。

### フェーズ1: 雛形とDB

```
docs/requirements.md を読んで、Next.js (App Router, TypeScript, Tailwind) のプロジェクトを初期化し、
Prismaスキーマ(Video / Submission / Report)とマイグレーションまで作成して。
ローカルはSQLiteで動く構成にして。
```

### フェーズ2: 投稿APIとURL正規化

```
fullstack-devエージェントで、TikTok URLの正規化処理(src/lib/tiktok.ts)と
投稿API(/api/submit)を実装して。短縮URLのリダイレクト解決、動画ID抽出、
oEmbedでのメタデータ取得、IPハッシュ化、レートリミット、24時間重複カウント制限まで含めて。
テストも書いて。
```

### フェーズ3: ランキングページ

```
fullstack-devエージェントで、トップページと /ranking/[period](daily/weekly/monthly/all)を
ISRで実装して。順位・サムネイル・タイトル・投稿者・投稿数・TikTokリンクボタン・順位変動を表示。
広告枠はAdSlotコンポーネントのプレースホルダーで配置。モバイルファーストで。
```

### フェーズ4: SEO実装

```
seo-writerエージェントでメタタグ文言とJSON-LD(ItemList / VideoObject / FAQPage)の内容を作成し、
その後fullstack-devエージェントで metadata API、sitemap.xml、robots.txt、OGP、
個別動画ページ(/video/[id])として実装して。
```

### フェーズ5: モデレーションと固定ページ

```
通報機能(/api/report)、NGワードフィルタ、Basic認証付き/adminページ、
about / terms / privacy / contact ページを実装して。
```

### 各フェーズの締め

```
code-reviewerエージェントで今回の変更をレビューして。Criticalがあれば修正まで。
```

## 運営者が自分でやること(コード外)

- ドメイン取得・Vercel/Supabaseのセットアップとデプロイ
- 広告ネットワークの審査申請(terms/privacy/contactが揃ってから)
- Google Search Console / GA4 の登録
- X公式アカウント運用(docs/seo-strategy.md のサイト外施策を参照)
- seo-writerが生成した記事のファクトチェックと公開判断
