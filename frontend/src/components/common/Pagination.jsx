import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';

export default function Pagination({ page, pages, total, limit, onChange }) {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> tasks
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="btn-ghost p-2 disabled:opacity-40"
        >
          <RiArrowLeftLine />
        </button>

        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          let p;
          if (pages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= pages - 2) p = pages - 4 + i;
          else p = page - 2 + i;

          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                p === page
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'btn-ghost'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="btn-ghost p-2 disabled:opacity-40"
        >
          <RiArrowRightLine />
        </button>
      </div>
    </div>
  );
}
