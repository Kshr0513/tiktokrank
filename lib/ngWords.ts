const NG_WORDS: string[] = [
  // Add domain-specific NG words here
];

export function containsNgWord(text: string): boolean {
  const lower = text.toLowerCase();
  return NG_WORDS.some((w) => lower.includes(w.toLowerCase()));
}
