export function LabeledDivider({ label }) {
  return (
    <div className="relative w-full flex items-center justify-center bg-slate-950">
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

      <span className="relative px-1 text-xs uppercase text-purple-300 font-medium bg-slate-950">
        {label}
      </span>
    </div>
  );
}
