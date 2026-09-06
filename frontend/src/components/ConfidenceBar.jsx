export default function ConfidenceBar({ value, size = "md" }) {
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
      <div
        className="h-full bg-brand rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
