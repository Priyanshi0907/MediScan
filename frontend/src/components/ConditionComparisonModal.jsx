import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Plus,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Printer,
  Copy,
  Check,
  Stethoscope,
  ChevronDown,
  Loader2,
  ExternalLink
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  enrichCondition,
  getConditionStatus
} from "../utils/clinicalKnowledge";

export default function ConditionComparisonModal({
  isOpen,
  onClose,
  initialSlugs = [],
  allDiseasesList = []
}) {
  const { token } = useAuth();
  const [selectedSlugs, setSelectedSlugs] = useState(initialSlugs);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Sync selectedSlugs when initialSlugs changes
  useEffect(() => {
    if (initialSlugs && initialSlugs.length > 0) {
      setSelectedSlugs(initialSlugs);
    }
  }, [initialSlugs]);

  // Fetch condition comparison data
  useEffect(() => {
    if (!isOpen || selectedSlugs.length === 0) return;

    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.compareDiseases(selectedSlugs, token);
        if (isMounted) {
          const items = (res.conditions || []).map(enrichCondition);
          setConditions(items);
        }
      } catch (err) {
        console.warn("api.compareDiseases unavailable, using fallback:", err);
        try {
          const fallbackResults = await Promise.all(
            selectedSlugs.map(async (s) => {
              try {
                const detail = await api.diseaseDetail(s, token);
                return enrichCondition(detail);
              } catch {
                const found = (allDiseasesList || []).find((d) => d.slug === s);
                return enrichCondition(found || { slug: s, name: s });
              }
            })
          );
          if (isMounted) {
            setConditions(fallbackResults.filter(Boolean));
          }
        } catch (fallbackErr) {
          console.error("Comparison fallback failed", fallbackErr);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedSlugs, token, allDiseasesList]);

  if (!isOpen) return null;

  const handleRemoveCondition = (slug) => {
    if (selectedSlugs.length <= 1) return;
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  };

  const handleAddCondition = (slug) => {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= 4) return;
    setSelectedSlugs((prev) => [...prev, slug]);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Compile all unique symptoms across compared conditions
  const allSymptomsMap = new Map();
  conditions.forEach((c) => {
    (c.clinical_features || []).forEach((feat) => {
      const sympName = feat.symptom;
      if (!allSymptomsMap.has(sympName)) {
        allSymptomsMap.set(sympName, feat);
      }
    });
    // Fallback if clinical_features not present
    (c.symptoms || []).forEach((s) => {
      const titleName = s.charAt(0).toUpperCase() + s.slice(1);
      if (!allSymptomsMap.has(titleName)) {
        allSymptomsMap.set(titleName, {
          symptom: titleName,
          weight: "3/5",
          importance: "Moderate",
          clinical_contribution: "3/5 (Moderate)"
        });
      }
    });
  });
  const allSymptoms = Array.from(allSymptomsMap.keys());

  const handleCopySummary = () => {
    if (!conditions.length) return;
    const summary = conditions
      .map(
        (c) =>
          `=== ${c.name} (${c.category}) ===\n• Acuity: ${c.urgency}\n• Typical Duration: ${c.typical_duration}\n• Seek Care: ${c.when_to_seek_care}\n• Red Flags: ${(c.red_flags || []).join(", ")}\n• Treatment: ${c.key_points?.treatment || ""}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredAddOptions = allDiseasesList.filter(
    (d) =>
      !selectedSlugs.includes(d.slug) &&
      (d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-sand-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#edf5f0] text-[#1e4d2b] border border-[#d2e8db] flex items-center justify-center">
              <Scale size={18} />
            </span>
            <div>
              <h2 className="font-display font-bold text-lg text-[#111827]">
                Condition Clinical Comparison
              </h2>
              <p className="text-xs text-gray-500">
                Side-by-side differential analysis of key clinical attributes and symptom weights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="Copy clinical comparison summary"
            >
              {copied ? <Check size={14} className="text-[#1e4d2b]" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Summary"}
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="Print clinical comparison"
            >
              <Printer size={14} />
              Print
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        {/* Condition Selector Strip */}
        <div className="px-6 py-3 bg-[#fafaf8] border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
              Comparing ({conditions.length}):
            </span>
            {conditions.map((cond) => (
              <span
                key={cond.slug}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-white border border-gray-200/90 text-[#111827] rounded-full shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#1e4d2b]" />
                {cond.name}
                {selectedSlugs.length > 1 && (
                  <button
                    onClick={() => handleRemoveCondition(cond.slug)}
                    className="hover:text-red-600 text-gray-400 ml-1 p-0.5"
                    title="Remove from comparison"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            ))}

            {/* Add Condition Dropdown */}
            {selectedSlugs.length < 4 && (
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4] rounded-full hover:bg-[#dff0e4] transition-colors"
                >
                  <Plus size={13} />
                  Add Condition
                  <ChevronDown size={12} className="ml-0.5 opacity-60" />
                </button>

                {searchOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50">
                    <input
                      type="text"
                      placeholder="Search to add condition..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#1e4d2b] mb-1.5"
                      autoFocus
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredAddOptions.slice(0, 15).map((d) => (
                        <button
                          key={d.slug}
                          onClick={() => handleAddCondition(d.slug)}
                          className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-100 rounded-lg flex items-center justify-between text-gray-800"
                        >
                          <span className="font-semibold truncate">{d.name}</span>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                            {d.category}
                          </span>
                        </button>
                      ))}
                      {filteredAddOptions.length === 0 && (
                        <p className="text-[11px] text-gray-400 p-2 text-center">
                          No conditions found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="text-[11px] font-medium text-gray-400">
            Compare up to 4 conditions simultaneously
          </span>
        </div>

        {/* Main Comparison Table Area */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Loader2 className="animate-spin text-[#1e4d2b]" size={36} />
              <p className="text-sm font-semibold text-gray-600">
                Loading clinical comparison matrix...
              </p>
            </div>
          ) : conditions.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <Scale size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-bold">No conditions selected for comparison</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[700px]">
                {/* Table Header */}
                <thead>
                  <tr className="bg-sand-100/70 border-b border-gray-200">
                    <th className="py-3.5 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-[22%] sticky left-0 bg-sand-100/90 backdrop-blur-xs z-10">
                      ATTRIBUTE
                    </th>
                    {conditions.map((c) => (
                      <th
                        key={c.slug}
                        className="py-3.5 px-4 text-xs font-bold text-[#111827] uppercase tracking-wider"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <Link
                            to={`/dashboard/library/${c.slug}`}
                            className="hover:text-[#1e4d2b] flex items-center gap-1 group transition-colors"
                            title="Open condition detail page"
                          >
                            <span>{c.name}</span>
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          {selectedSlugs.length > 1 && (
                            <button
                              onClick={() => handleRemoveCondition(c.slug)}
                              className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200/70 text-xs">
                  {/* Category */}
                  <tr className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-100">
                      Category
                    </td>
                    {conditions.map((c) => (
                      <td key={c.slug} className="py-3 px-4 text-gray-800 font-medium">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-semibold">
                          {c.category}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Status: Red (Emergency), Orange (Urgent), Yellow (Chronic), Normal (Primary Care) */}
                  <tr className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-100">
                      Condition Status
                    </td>
                    {conditions.map((c) => {
                      const condStatus = getConditionStatus(c);
                      const isEmergency = condStatus.toLowerCase().includes("emergency");
                      const isUrgent = condStatus.toLowerCase().includes("urgent");
                      const isChronic = condStatus.toLowerCase().includes("chronic");
                      return (
                        <td key={c.slug} className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              isEmergency
                                ? "bg-red-50 text-red-700 border-red-200"
                                : isUrgent
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : isChronic
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-[#edf5f0] text-[#1e4d2b] border-[#cbe2d4]"
                            }`}
                          >
                            {condStatus}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Red-flag Symptoms */}
                  <tr className="bg-red-50/30 hover:bg-red-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-red-900 sticky left-0 bg-red-50/40 z-10 border-r border-red-100">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-red-600" />
                        <span>Red-flag Symptoms</span>
                      </div>
                    </td>
                    {conditions.map((c) => {
                      const flags = c.red_flags || [];
                      return (
                        <td key={c.slug} className="py-3.5 px-4 text-gray-800">
                          {flags.length > 0 ? (
                            <ul className="space-y-1">
                              {flags.map((rf, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 text-xs text-red-800 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                  <span>{rf}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* When to Seek Care */}
                  <tr className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-100">
                      When to Seek Care
                    </td>
                    {conditions.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4 text-gray-700 leading-relaxed">
                        {c.when_to_seek_care || "Consult a healthcare provider for diagnosis."}
                      </td>
                    ))}
                  </tr>

                  {/* Primary Diagnosis & Workup */}
                  <tr className="hover:bg-sand-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-100">
                      Diagnostic Workup
                    </td>
                    {conditions.map((c) => (
                      <td key={c.slug} className="py-3.5 px-4 text-gray-700 leading-relaxed">
                        {c.key_points?.diagnosis || "Clinical assessment & diagnostic tests"}
                      </td>
                    ))}
                  </tr>

                  {/* Section Divider: Symptom Comparison Matrix */}
                  <tr className="bg-[#1e4d2b]/10 border-y border-[#1e4d2b]/20">
                    <td
                      colSpan={conditions.length + 1}
                      className="py-2.5 px-4 text-xs font-extrabold text-[#1e4d2b] uppercase tracking-wider"
                    >
                      Symptom Comparison Matrix
                    </td>
                  </tr>

                  {/* Individual Symptom Rows */}
                  {allSymptoms.map((symptomName) => {
                    return (
                      <tr key={symptomName} className="hover:bg-sand-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-gray-800 sticky left-0 bg-white z-10 border-r border-gray-100">
                          {symptomName}
                        </td>
                        {conditions.map((c) => {
                          const hasSympInList =
                            (c.symptoms || []).some(
                              (s) => s.toLowerCase() === symptomName.toLowerCase()
                            ) ||
                            (c.clinical_features || []).some(
                              (f) => f.symptom.toLowerCase() === symptomName.toLowerCase()
                            );

                          if (hasSympInList) {
                            return (
                              <td key={c.slug} className="py-2.5 px-4">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e4d2b] bg-[#edf5f0] border border-[#cbe2d4] px-2.5 py-0.5 rounded-md">
                                  <CheckCircle2 size={13} className="text-[#1e4d2b]" />
                                  Present
                                </span>
                              </td>
                            );
                          } else {
                            return (
                              <td key={c.slug} className="py-2.5 px-4 text-gray-300 font-bold">
                                —
                              </td>
                            );
                          }
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-sand-50/90 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Stethoscope size={15} className="text-[#1e4d2b]" />
            <span>
              Comparison matrix highlights symptom overlap and diagnostic differences across conditions.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-[#1e4d2b] hover:bg-[#163b21] text-white font-semibold rounded-xl transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
