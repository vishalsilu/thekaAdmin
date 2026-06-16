import React from 'react';

const SiteDataRepeater = ({
  title,
  items = [],
  onAdd,
  onRemove,
  renderItem,
  addLabel,
  emptyLabel,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <h4 className="text-lg font-semibold text-stone-900">{title}</h4>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-full border border-stone-300 bg-black px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-stone-800"
      >
        {addLabel || `Add ${title}`}
      </button>
    </div>

    {items.length === 0 ? (
      <p className="text-sm text-stone-500">{emptyLabel || `No ${title.toLowerCase()} added yet.`}</p>
    ) : (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="font-semibold text-stone-800">{title} {index + 1}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-sm font-medium uppercase tracking-[0.08em] text-rose-600 transition hover:text-rose-800"
              >
                Remove
              </button>
            </div>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default SiteDataRepeater;
