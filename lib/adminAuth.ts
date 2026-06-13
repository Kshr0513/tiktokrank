import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  // 長さが違う場合もタイミング情報を漏らさないようにパディング比較
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  const maxLen = Math.max(bufA.length, bufB.length);
  const padA = Buffer.concat([bufA, Buffer.alloc(maxLen - bufA.length)]);
  const padB = Buffer.concat([bufB, Buffer.alloc(maxLen - bufB.length)]);
  return timingSafeEqual(padA, padB) && bufA.length === bufB.length;
}

export function checkBasicAuth(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  // ':' を含むパスワードに対応するため indexOf で分割
  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) return false;
  const user = decoded.slice(0, colonIndex);
  const pass = decoded.slice(colonIndex + 1);

  const expectedUser = process.env.ADMIN_USER ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return false;

  return safeCompare(user, expectedUser) && safeCompare(pass, expectedPass);
}
