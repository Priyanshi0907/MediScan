export default function Logo({ dark = false, size = "md" }) {
  const isSm = size === "sm";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${
          isSm ? "w-8 h-8" : "w-9 h-9"
        } rounded-lg flex items-center justify-center border ${
          dark
            ? "border-white/20 bg-white/10 text-white"
            : "border-[#1e4d2b] bg-white text-[#1e4d2b]"
        } shadow-sm`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`${isSm ? "w-4 h-4" : "w-5 h-5"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="14" strokeWidth="2.5" />
          <line x1="9" y1="11" x2="15" y2="11" strokeWidth="2.5" />
        </svg>
      </div>
      <div className="text-left leading-none">
        <p
          className={`font-display font-extrabold tracking-tight ${
            isSm ? "text-base" : "text-xl"
          } ${dark ? "text-white" : "text-[#111827]"}`}
        >
          MED<span className="font-semibold">i</span>Scan
        </p>
        <p
          className={`text-[10.5px] mt-0.5 tracking-normal font-normal ${
            dark ? "text-white/60" : "text-[#64748b]"
          }`}
        >
          Disease Analysis System
        </p>
      </div>
    </div>
  );
}

