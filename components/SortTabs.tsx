interface Props {
  currentSort: "submit" | "click";
  basePath: string;
  currentPage?: number;
}

export function SortTabs({ currentSort, basePath, currentPage = 1 }: Props) {
  function buildHref(sort: "submit" | "click"): string {
    const params = new URLSearchParams();
    if (sort === "click") params.set("sort", "click");
    if (currentPage > 1) params.set("page", String(currentPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex gap-4 border-b border-gray-200 mb-3">
      <a
        href={buildHref("submit")}
        className={`pb-2 text-sm font-medium transition-colors ${
          currentSort === "submit"
            ? "text-rose-500 border-b-2 border-rose-500"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        投稿数
      </a>
      <a
        href={buildHref("click")}
        className={`pb-2 text-sm font-medium transition-colors ${
          currentSort === "click"
            ? "text-rose-500 border-b-2 border-rose-500"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        クリック数
      </a>
    </div>
  );
}
