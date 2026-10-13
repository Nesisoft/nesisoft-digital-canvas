/**
 * Branded loader shown while a lazily-loaded route chunk downloads.
 * Visual matches the inline boot loader in index.html so first-load and
 * route transitions feel like the same loader.
 */
export function RouteFallback() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09090b]">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-[999px] bg-violet-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-[999px] bg-violet-400" />
        </span>
        <span className="font-mono text-xs tracking-[0.32em] text-slate-300 sm:text-sm">
          ENGINEERING, TECHNOLOGIES AND MORE
          <span className="inline-block animate-pulse">…</span>
        </span>
      </div>
      <div className="mt-6 h-px w-40 overflow-hidden bg-white/10">
        <div className="h-full w-1/3 animate-[slide_1.2s_ease-in-out_infinite] bg-violet-400" />
      </div>
      <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(200%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
