import { useEffect, useState, useCallback } from "react";
import {
  Clock, Search, Trash2, Loader2, Download, CheckCircle2
} from "lucide-react";


import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { generatePdfReport } from "../../utils/generatePdfReport";

export default function History() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.history(token, query ? { q: query } : undefined);
      const historyList = data.items || [];
      setItems(historyList);
      if (historyList.length > 0 && !selected) {
        setSelected(historyList[0]);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  }, [token, query, selected]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  const onDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this analysis record?")) return;
    try {
      await api.deleteHistoryItem(id, token);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selected?.id === id) {
        setSelected(items.find((i) => i.id !== id) || null);
      }
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const onClearAll = async () => {
    if (items.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all analysis history records? This action cannot be undone.")) {
      return;
    }
    try {
      await api.deleteAllHistory(token);
      setItems([]);
      setSelected(null);
    } catch (err) {
      alert("Failed to clear history: " + err.message);
    }
  };

  const handleExportPdf = (item, e) => {
    if (e) e.stopPropagation();
    generatePdfReport({
      prediction: item,
      user,
      date: item.created_at,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#111827] font-display">My History</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Review, search, and export structured clinical PDF reports of your past symptom analyses
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* LEFT: TIMELINE LIST */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] border border-[#d2e8db]">
                <Clock size={18} />
              </span>
              <p className="font-bold text-[#111827]">Analysis Records ({items.length})</p>
            </div>

            <div className="flex items-center gap-2">
              <form onSubmit={onSearch} className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search condition or text…"
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#1e4d2b] w-48 sm:w-52"
                />
              </form>

              {items.length > 0 && (
                <button
                  onClick={onClearAll}
                  type="button"
                  title="Clear all history records"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors shrink-0"
                >
                  <Trash2 size={13} /> Clear All
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center text-gray-400">
              <Loader2 className="animate-spin text-[#1e4d2b]" size={28} />
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              No analysis history found. Submit your first symptoms in the Analyzer to see them recorded here.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item) => {
                const isSel = selected?.id === item.id;
                return (
                  <li key={item.id}>
                    <div
                      onClick={() => setSelected(item)}
                      className={`w-full flex items-center justify-between gap-3 py-3.5 px-3 rounded-xl transition-all cursor-pointer ${
                        isSel ? "bg-[#edf5f0]/80 border border-[#cbe2d4]" : "hover:bg-gray-50/80"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] text-gray-400">
                            {new Date(item.created_at).toLocaleDateString(undefined, {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              item.risk_level === "High"
                                ? "bg-red-100 text-red-700"
                                : item.risk_level === "Moderate"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {item.risk_level || "Low"} Risk
                          </span>
                        </div>
                        <p className="font-bold text-[#111827] text-sm truncate mt-0.5">{item.top_disease}</p>
                        <p className="text-xs text-gray-500 truncate max-w-sm">"{item.input_text}"</p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-bold text-[#1e4d2b] bg-white border border-[#d2e8db] px-2 py-1 rounded-lg">
                          {item.confidence}%
                        </span>

                        <button
                          onClick={(e) => handleExportPdf(item, e)}
                          title="Export PDF Report"
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-white hover:border-[#1e4d2b] text-gray-600 hover:text-[#1e4d2b] transition-colors"
                        >
                          <Download size={14} />
                        </button>

                        <button
                          onClick={(e) => onDelete(item.id, e)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* RIGHT: SELECTED RECORD DETAIL CARD */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 lg:sticky lg:top-24 space-y-4">
          {!selected ? (
            <p className="text-sm text-gray-400 py-12 text-center">Select an analysis to inspect complete details.</p>
          ) : (
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-semibold text-[#1e4d2b] uppercase tracking-wider">Clinical Summary</span>
                  <h3 className="font-display font-extrabold text-xl text-[#111827]">{selected.top_disease}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleExportPdf(selected)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e4d2b] text-white text-xs font-semibold hover:bg-[#163b21] transition-colors shadow-xs"
                >
                  <Download size={13} /> Export PDF
                </button>
              </div>

              {/* Confidence & Risk */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="bg-[#edf5f0] p-3 rounded-xl border border-[#d2e8db]">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Match Confidence</p>
                  <p className="text-lg font-bold text-[#1e4d2b] mt-0.5">{selected.confidence}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Risk Level</p>
                  <p className="text-lg font-bold text-[#111827] mt-0.5">{selected.risk_level || "Low"}</p>
                </div>
              </div>

              {/* Input Text */}
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Reported Text</p>
                <p className="text-xs text-gray-600 bg-sand-50 rounded-xl p-3 border border-gray-100 leading-relaxed italic">
                  "{selected.input_text}"
                </p>
              </div>

              {/* Detected Symptoms */}
              <div className="pt-1">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Detected Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.detected_symptoms || []).map((s) => (
                    <span
                      key={s}
                      className="bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4] text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                    >
                      <CheckCircle2 size={11} /> {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Other Predictions */}
              {selected.other_predictions?.length > 0 && (
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Differential Diagnoses</p>
                  <div className="space-y-1">
                    {selected.other_predictions.map((p) => (
                      <div key={p.disease} className="flex justify-between text-xs text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                        <span className="font-medium text-gray-800">{p.disease}</span>
                        <span className="text-gray-400">{p.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rationale */}
              {selected.explanation && (
                <div className="pt-1">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Diagnostic Rationale</p>
                  <p className="text-xs text-gray-600 bg-sand-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                    {selected.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
