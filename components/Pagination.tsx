interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex justify-center gap-1 mt-6" aria-label="ページナビゲーション">
      {pages.map((p) => (
        <a
          key={p}
          href={`${basePath}?page=${p}`}
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
