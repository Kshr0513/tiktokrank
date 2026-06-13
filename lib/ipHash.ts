import { createHash } from "crypto";

export function hashIp(ip: string): string {
  const salt = process.env.IP_SALT;
  if (!salt) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("IP_SALT environment variable is not set");
    }
    // ローカル開発時のみ固定値を使用
    return createHash("sha256").update(ip + "dev-only-salt").digest("hex");
  }
  return createHash("sha256").update(ip + salt).digest("hex");
}
