interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
}

export function Pagination({ currentPage, totalPages, basePath, extraParams }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function buildHref(p: number): string {
    const params = new URLSearchParams({ ...extraParams });
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="flex justify-center gap-1 mt-6" aria-label="ページナビゲーション">
      {pages.map((p) => (
        <a
          key={p}
          href={buildHref(p)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            p === currentPage
              ? "bg-rose-500 text-white"
              : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </a>
      ))}
    </nav>
  );
}
