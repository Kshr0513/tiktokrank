import type { NextConfig } from "next";

const securityHeaders = [
  // クリックジャッキング防止
  { key: "X-Frame-Options", value: "DENY" },
  // MIMEタイプスニッフィング防止
  { key: "X-Content-Type-Options", value: "nosniff" },
  // リファラー情報を最小限に
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 不要なブラウザ機能を無効化
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // XSS対策（コンテンツはすべて同一オリジンから配信）
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js のインラインスクリプト対応（nonce未使用のため unsafe-inline）
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // TikTokサムネイル画像の読み込みを許可
      "img-src 'self' data: https://*.tiktok.com https://*.tiktokcdn.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.tiktok.com",
      },
      {
        protocol: "https",
        hostname: "**.tiktokcdn.com",
      },
    ],
  },
};

export default nextConfig;
