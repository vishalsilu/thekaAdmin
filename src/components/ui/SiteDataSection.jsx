import React from 'react';

const SiteDataSection = ({ title, subtitle, actions, className = '', children }) => (
  <section className={`rounded-3xl border border-stone-200 bg-white p-6 shadow-sm ${className}`}>
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h3 className="text-xl font-semibold uppercase tracking-[0.04em] text-stone-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

export default SiteDataSection;
