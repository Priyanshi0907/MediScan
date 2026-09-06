import { useEffect, useState } from "react";
import { TrendingUp, Download, Loader2, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import ConfidenceBar from "../../components/ConfidenceBar";

export default function Reports() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.reports(token);
        setReports(data.items || []);
        if (data.items?.length) setActive(data.items[0]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const downloadReport = (r) => {
    const lines = [
      `MEDiScan — Analysis Report`,
      `Generated: ${new Date(r.created_at).toLocaleString()}`,
      `Patient: ${user?.name || "N/A"}`,
      ``,
      `Input text:`,
      r.input_text,
      ``,
      `Detected symptoms: ${r.detected_symptoms.join(", ")}`,
      ``,
      `Top prediction: ${r.top_disease} (${r.confidence}%)`,
      `Other possible conditions:`,
      ...(r.other_predictions || []).map((p) => `  - ${p.disease}: ${p.confidence}%`),
      ``,
      `Disclaimer: This is an AI-generated prediction and not a medical diagnosis.`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mediscan-report-${r.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="py-20 flex justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid lg:grid-cols-5 gap-6 items-start">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand"><TrendingUp size={19} /></span>
          <p className="font-semibold text-[#12241a]">Reports</p>
        </div>
        {reports.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">No reports yet — run an analysis first.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reports.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setActive(r)}
                  className={`w-full text-left py-3.5 px-2 -mx-2 rounded-lg transition-colors ${active?.id === r.id ? "bg-brand-light/60" : "hover:bg-sand-50"}`}
                >
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  <p className="font-semibold text-sm text-[#12241a]">{r.top_disease}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6">
        {!active ? (
          <p className="text-sm text-gray-400 py-10 text-center">Select a report to view the full summary.</p>
        ) : (
          <>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand"><FileText size={19} /></span>
                <div>
                  <p className="font-semibold text-[#12241a]">Analysis Summary</p>
                  <p className="text-xs text-gray-500">{new Date(active.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => downloadReport(active)}
                className="flex items-center gap-1.5 text-sm font-semibold text-brand border border-brand/30 rounded-lg px-3.5 py-2 hover:bg-brand-light"
              >
                <Download size={15} /> Export
              </button>
            </div>

            <p className="text-sm font-semibold text-[#12241a] mb-1.5">Input text</p>
            <p className="text-sm text-gray-600 bg-sand-50 rounded-xl p-3.5 mb-5 leading-relaxed">{active.input_text}</p>

            <p className="text-sm font-semibold text-[#12241a] mb-2">Detected symptoms</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {active.detected_symptoms.map((s) => (
                <span key={s} className="bg-brand-light text-brand text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
              ))}
            </div>

            <p className="text-sm font-semibold text-[#12241a] mb-3">Top predictions</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#12241a]">{active.top_disease}</span>
                  <span className="text-gray-500">{active.confidence}%</span>
                </div>
                <ConfidenceBar value={active.confidence} />
              </div>
              {active.other_predictions?.map((p) => (
                <div key={p.disease}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{p.disease}</span>
                    <span className="text-gray-500">{p.confidence}%</span>
                  </div>
                  <ConfidenceBar value={p.confidence} size="sm" />
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-6">
              This report reflects an AI-generated prediction and is not a medical diagnosis.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
