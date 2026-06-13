# 要件定義書 — TikTok保存ランキング

## 1. コンセプト

「Twitter保存ランキング」と同じ利用体験をTikTokで提供する。ユーザーが共有リンクを貼ると、その動画が「今みんなが保存したい動画」としてランキングに反映される。サイトはあくまで**リンク集計サイト**であり、保存・ダウンロード行為はTikTok公式アプリ/サイト上でユーザー自身が行う。

## 2. ページ構成

| パス | 内容 | レンダリング |
|---|---|---|
| `/` | 24時間ランキング(トップ) | ISR(再生成60秒) |
| `/ranking/daily` | 24時間ランキング | ISR |
| `/ranking/weekly` | 週間ランキング | ISR |
| `/ranking/monthly` | 月間ランキング | ISR |
| `/ranking/all` | 総合ランキング | ISR |
| `/video/[videoId]` | 動画個別ページ(順位履歴・投稿数推移) | ISR |
| `/about` | サイト説明・使い方 | SSG |
| `/terms` `/privacy` | 利用規約・プライバシーポリシー(広告審査に必須) | SSG |
| `/contact` | 問い合わせ・削除依頼フォーム | SSG |

## 3. ランキング仕様

- 集計単位: 正規化済みTikTok動画ID
- スコア: 期間内のユニーク投稿数(同一IP×同一動画は24hで1カウント)
- 表示項目: 順位、サムネイル、動画タイトル、投稿者名(@xxx)、期間内投稿数、TikTokへのリンクボタン
- 順位変動表示: 前回集計比(↑↓→)
- 1ページ50件、ページネーションあり

## 4. リンク投稿フロー

1. トップの投稿フォームにTikTok URLを貼り付け
2. サーバー側で処理:
   - URL形式バリデーション(tiktok.comドメインのみ許可)
   - 短縮URL(vm/vt.tiktok.com)はHEADリクエストでリダイレクト解決
   - `/@user/video/{id}` から動画IDを抽出して正規化
   - 初出の動画なら oEmbed APIでメタデータ取得して `videos` テーブルに登録
   - `submissions` テーブルに投稿レコード追加(IPはハッシュ化して保存)
3. 成功したら現在の順位を表示して投稿完了

## 5. データモデル(Prisma想定)

```prisma
model Video {
  id          String   @id            // TikTok動画ID
  url         String                  // 正規化済みURL
  title       String?
  authorName  String?
  thumbnailUrl String?
  isHidden    Boolean  @default(false) // モデレーション用
  createdAt   DateTime @default(now())
  submissions Submission[]
  reports     Report[]
}

model Submission {
  id        Int      @id @default(autoincrement())
  videoId   String
  ipHash    String                    // SHA-256(IP + salt)
  createdAt DateTime @default(now())
  video     Video    @relation(fields: [videoId], references: [id])
  @@index([videoId, createdAt])
  @@index([ipHash, videoId, createdAt])
}

model Report {
  id        Int      @id @default(autoincrement())
  videoId   String
  reason    String
  createdAt DateTime @default(now())
  video     Video    @relation(fields: [videoId], references: [id])
}
```

## 6. スパム・不正対策

- レートリミット: IPあたり投稿API 10回/分、超過は429
- 同一IP×同一動画: 24時間1カウント(レコードは保存するが集計対象外でも可)
- Bot対策: ハニーポットフィールド + 投稿間隔チェック(CAPTCHAはv1では入れない)
- NGワード: タイトル・投稿者名にNGワードを含む動画は自動で `isHidden=true` にして管理者確認待ち

## 7. モデレーション・法的対応(広告審査の前提)

- 各ランキング項目に「通報」ボタン → `/api/report`
- 管理用: 環境変数のBasic認証付き `/admin` で通報一覧・非表示切替
- `/contact` に権利者向け削除依頼の導線を明記
- 利用規約に「当サイトは動画を保存・複製しない」「リンク先はTikTok公式」を明記

## 8. 広告枠

- v1では広告スロットコンポーネント(`<AdSlot position="..." />`)をプレースホルダーとして配置のみ
- 配置: ヘッダー下、ランキング5位ごとのインフィード、フッター上
- 広告ネットワークのタグは運営者が後から差し込む(コードに直書きしない。環境変数 or 設定ファイル化)

## 9. 非機能要件

- Lighthouse SEOスコア 95以上、Performance 80以上(モバイル)
- ランキングページのTTFB < 500ms(ISRキャッシュヒット時)
- レスポンシブ対応(利用者の大半はスマホ想定。モバイルファーストで実装)
