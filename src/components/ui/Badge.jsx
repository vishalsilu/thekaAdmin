const Badge = ({ children, variant = "neutral" }) => {
  const classes =
    variant === "active"
      ? "border border-stone-200 bg-stone-100 text-stone-700"
      : variant === "draft"
        ? "border border-black bg-black text-white"
        : "border border-stone-200 bg-white text-stone-700";

  return (
    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${classes}`}>
      {children}
    </span>
  );
};

export default Badge;
