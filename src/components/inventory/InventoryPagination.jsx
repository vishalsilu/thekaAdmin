const InventoryPagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(page * pageSize, total);

  const pages = [];
  const maxButtons = totalPages === 0 ? 0 : Math.min(totalPages, 5);
  for (let i = 1; i <= maxButtons; i += 1) pages.push(i);

  return (
    <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
      <p className="m-0 text-xs text-stone-500">
        Showing {from} to {to} of {total} results
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="h-9 min-w-9 border border-stone-200 bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page <= 1 || total === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            className={`h-9 min-w-9 border px-3 text-sm font-semibold ${n === page ? "border-black bg-black text-white" : "border-stone-200 bg-white"}`}
            onClick={() => onPageChange(n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="h-9 min-w-9 border border-stone-200 bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          disabled={total === 0 || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </footer>
  );
};

export default InventoryPagination;
