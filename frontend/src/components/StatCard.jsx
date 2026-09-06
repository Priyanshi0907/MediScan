export default function StatCard({ label, value, Icon, tone = "default" }) {
  const toneMap = {
    default: "text-[#12241a]",
    warn: "text-amber-warn",
    danger: "text-red-500",
    good: "text-brand",
  };
  return (
    <div className="bg-sand-50 rounded-xl border border-gray-100 p-4">
      <span className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-500 mb-3">
        <Icon size={16} />
      </span>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-display font-extrabold text-lg ${toneMap[tone]}`}>{value}</p>
    </div>
  );
}
