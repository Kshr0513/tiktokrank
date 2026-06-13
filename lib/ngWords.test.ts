import { describe, it, expect } from "vitest";
import { containsNgWord } from "./ngWords";

describe("containsNgWord", () => {
  describe("正規化", () => {
    it("カタカナとひらがなを同一視する", () => {
      expect(containsNgWord("エロ動画")).toBe(true);
      expect(containsNgWord("えろ動画")).toBe(true);
    });

    it("全角英字を半角と同一視する", () => {
      expect(containsNgWord("ＰＯＲＮ動画")).toBe(true);
    });

    it("大文字小文字を区別しない", () => {
      expect(containsNgWord("PORN")).toBe(true);
      expect(containsNgWord("Porn")).toBe(true);
    });
  });

  describe("アダルト", () => {
    it("ポルノ", () => expect(containsNgWord("ポルノ映像")).toBe(true));
    it("無修正", () => expect(containsNgWord("無修正リーク")).toBe(true));
    it("porn", () => expect(containsNgWord("porn video")).toBe(true));
    it("xxx",  () => expect(containsNgWord("xxx clips")).toBe(true));
    it("nude", () => expect(containsNgWord("nude dance")).toBe(true));
    it("hentai", () => expect(containsNgWord("hentai anime")).toBe(true));
  });

  describe("違法薬物", () => {
    it("大麻", () => expect(containsNgWord("大麻吸ってみた")).toBe(true));
    it("コカイン", () => expect(containsNgWord("コカイン試してみた")).toBe(true));
    it("marijuana", () => expect(containsNgWord("marijuana smoking")).toBe(true));
    it("mdma", () => expect(containsNgWord("mdmaパーティー")).toBe(true));
  });

  describe("自傷・危険行為", () => {
    it("リストカット", () => expect(containsNgWord("リストカットしてる")).toBe(true));
    it("自傷行為", () => expect(containsNgWord("自傷行為の跡")).toBe(true));
    it("首吊り", () => expect(containsNgWord("首吊り方法")).toBe(true));
  });

  describe("詐欺・フィッシング", () => {
    it("フィッシング", () => expect(containsNgWord("フィッシング詐欺")).toBe(true));
    it("phishing", () => expect(containsNgWord("phishing scam")).toBe(true));
  });

  describe("正常なコンテンツは通過する", () => {
    it("一般的なダンス動画", () => expect(containsNgWord("かわいいダンス練習")).toBe(false));
    it("料理動画", () => expect(containsNgWord("しゃぶしゃぶの作り方")).toBe(false));
    it("ゲーム実況", () => expect(containsNgWord("マインクラフト実況プレイ")).toBe(false));
    it("英語の普通のタイトル", () => expect(containsNgWord("my morning routine")).toBe(false));
    it("TikTokユーザー名", () => expect(containsNgWord("@dancequeen_japan")).toBe(false));
    it("ニュース関連", () => expect(containsNgWord("麻薬取締の現場")).toBe(false));
    it("メンタルヘルス啓発（false positive チェック）", () =>
      expect(containsNgWord("メンタルヘルスの大切さ")).toBe(false));
  });
});
