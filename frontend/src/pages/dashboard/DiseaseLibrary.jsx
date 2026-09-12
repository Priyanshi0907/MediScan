import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  ArrowRight,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Scale,
  Clock,
  CheckCircle2,
  X,
  Sparkles,
  Filter
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import ConditionComparisonModal from "../../components/ConditionComparisonModal";
import {
  getConditionStatus,
  matchesStatusFilter,
  enrichCondition
} from "../../utils/clinicalKnowledge";

export default function DiseaseLibrary() {
  const { token } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Saved diseases in localStorage
  const [savedSlugs, setSavedSlugs] = useState([]);

  // Multi-select for comparison modal
  const [selectedCompareSlugs, setSelectedCompareSlugs] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mediscan_saved_diseases") || "[]");
      setSavedSlugs(saved);
    } catch {
      setSavedSlugs([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.diseases(token);
        const rawItems = data?.items || (Array.isArray(data) ? data : []);
        setDiseases(rawItems.map((item) => enrichCondition(item)));
      } catch (err) {
        console.error("Failed to load disease library", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const toggleBookmark = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    let nextSaved;
    if (savedSlugs.includes(slug)) {
      nextSaved = savedSlugs.filter((s) => s !== slug);
    } else {
      nextSaved = [...savedSlugs, slug];
    }
    setSavedSlugs(nextSaved);
    localStorage.setItem("mediscan_saved_diseases", JSON.stringify(nextSaved));
  };

  const toggleCompare = (e, slug) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCompareSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      } else {
        if (prev.length >= 4) return prev;
        return [...prev, slug];
      }
    });
  };

  const categories = ["All", ...new Set(diseases.map((d) => d.category))];

  const filtered = diseases.filter((d) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.symptoms && d.symptoms.some((s) => s.toLowerCase().includes(q))) ||
      (d.category && d.category.toLowerCase().includes(q));

    const matchesCategory = category === "All" || d.category === category;
    const matchesStatus = matchesStatusFilter(d, statusFilter, savedSlugs);

    return matchesQuery && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Header & Search Control */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-2xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] border border-[#d2e8db] shrink-0">
              <BookOpen size={22} />
            </span>
            <div>
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#111827]">
                Disease &amp; Clinical Knowledge Library
              </h1>
              <p className="text-xs text-gray-500">
                Explore {diseases.length} comprehensive medical monographs, causes &amp; triggers, red flags, and side-by-side condition comparison
              </p>
            </div>
          </div>

          {/* Top Actions: Highlighted Saved Conditions & Compare counter */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Prominently Highlighted Saved Diseases Quick Access Button */}
            <button
              onClick={() => setStatusFilter(statusFilter === "Saved" ? "All" : "Saved")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                statusFilter === "Saved"
                  ? "bg-[#1e4d2b] text-white border-[#1e4d2b] shadow-2xs"
                  : "bg-[#edf5f0] text-[#1e4d2b] border-[#cbe2d4] hover:bg-[#deefe4]"
              }`}
            >
              {statusFilter === "Saved" ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              <span>Saved Conditions ({savedSlugs.length})</span>
            </button>

            {selectedCompareSlugs.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111827] text-white text-xs font-bold rounded-full shadow-xs hover:bg-gray-800 transition-colors"
              >
                <Scale size={13} />
                Compare ({selectedCompareSlugs.length})
              </button>
            )}

            <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
              {filtered.length} condition{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by disease name (e.g. Appendicitis, Asthma), symptoms (e.g. pain, fever, cough), or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm outline-none focus:border-[#1e4d2b] focus:ring-1 focus:ring-[#1e4d2b] bg-[#fafaf8]"
          />
        </div>

        {/* Status and Category Filter Controls (No emojis, clean labels) */}
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {[
              { id: "All", label: "All Conditions" },
              { id: "Emergency", label: "Emergency" },
              { id: "Urgent", label: "Urgent Care" },
              { id: "Chronic", label: "Chronic" },
              { id: "Primary", label: "Primary Care" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  statusFilter === f.id
                    ? "bg-[#111827] text-white shadow-2xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  category === c
                    ? "bg-[#1e4d2b] text-white shadow-2xs"
                    : "bg-sand-100 text-gray-700 hover:bg-sand-200 border border-gray-200/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Disease Cards Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
          <Loader2 className="animate-spin text-[#1e4d2b]" size={36} />
          <p className="text-xs font-semibold text-gray-500">Loading comprehensive medical monographs...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => {
            const isSaved = savedSlugs.includes(d.slug);
            const isComparing = selectedCompareSlugs.includes(d.slug);
            const condStatus = getConditionStatus(d);
            const condStatusLower = condStatus.toLowerCase();
            const isEmergency = condStatusLower.includes("emergency");
            const isUrgent = condStatusLower.includes("urgent");
            const isChronic = condStatusLower.includes("chronic");

            return (
              <div
                key={d.slug}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between group relative shadow-2xs ${
                  isComparing
                    ? "border-[#1e4d2b] ring-2 ring-[#1e4d2b]/20"
                    : "border-gray-200/80 hover:border-[#1e4d2b]/60 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top Bar on Card */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold text-[#1e4d2b] bg-[#edf5f0] border border-[#cbe2d4] rounded-md px-2 py-0.5">
                        {d.category}
                      </span>
                      {/* Status Badge: Red (Emergency), Orange (Urgent), Yellow (Chronic), Normal (Other) */}
                      <span
                        className={`text-[10px] font-bold rounded-md px-2 py-0.5 border ${
                          isEmergency
                            ? "bg-red-50 text-red-700 border-red-200"
                            : isUrgent
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : isChronic
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {condStatus}
                      </span>
                    </div>

                    {/* Card Actions: Save & Compare Toggle */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => toggleBookmark(e, d.slug)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isSaved
                            ? "bg-[#edf5f0] text-[#1e4d2b] border-[#cbe2d4]"
                            : "bg-white text-gray-400 border-gray-200 hover:text-gray-700"
                        }`}
                        title={isSaved ? "Saved to your library" : "Save condition"}
                      >
                        {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      </button>

                      <button
                        onClick={(e) => toggleCompare(e, d.slug)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isComparing
                            ? "bg-[#1e4d2b] text-white border-[#1e4d2b]"
                            : "bg-white text-gray-400 border-gray-200 hover:text-[#1e4d2b] hover:border-[#1e4d2b]"
                        }`}
                        title="Add to comparison"
                      >
                        <Scale size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Condition Title */}
                  <Link to={`/dashboard/library/${d.slug}`} className="block group-hover:text-[#1e4d2b]">
                    <h3 className="font-display font-bold text-base text-[#111827] group-hover:text-[#1e4d2b] transition-colors leading-snug mb-1.5">
                      {d.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3.5 leading-relaxed">
                    {d.description || (d.symptoms && d.symptoms.length > 0 ? `Clinical presentation characterized by ${d.symptoms.slice(0, 3).join(", ")}.` : `Comprehensive clinical monograph for ${d.name}.`)}
                  </p>

                  {/* Symptom Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(d.symptoms || []).slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10.5px] font-medium bg-[#fafaf8] border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                    {(d.symptoms || []).length > 3 && (
                      <span className="text-[10px] font-semibold text-gray-400 px-1 py-0.5">
                        +{d.symptoms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to={`/dashboard/library/${d.slug}`}
                    className="text-xs font-bold text-[#1e4d2b] hover:text-[#163b21] flex items-center gap-1 group/link"
                  >
                    <span>View profile</span>
                    <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    onClick={(e) => toggleCompare(e, d.slug)}
                    className="text-[11px] font-semibold text-gray-500 hover:text-[#1e4d2b]"
                  >
                    {isComparing ? "✓ In Compare" : "+ Compare"}
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-gray-200/80 p-8 space-y-2">
              <BookOpen size={36} className="mx-auto text-gray-300 mb-1" />
              <p className="font-display font-bold text-base text-gray-800">
                No medical monographs match your current criteria
              </p>
              <p className="text-xs text-gray-500">
                Try searching for a different keyword or reset the category/status filters.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  setStatusFilter("All");
                }}
                className="mt-3 px-4 py-1.5 text-xs font-bold bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4] rounded-xl hover:bg-[#dff0e4] transition-colors"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom Comparison Drawer */}
      {selectedCompareSlugs.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#111827]/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-gray-700/80 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 max-w-xl w-[90%] sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#1e4d2b] flex items-center justify-center text-white shrink-0">
              <Scale size={16} />
            </span>
            <div className="text-xs">
              <p className="font-bold text-white">
                {selectedCompareSlugs.length} condition{selectedCompareSlugs.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-[10.5px] text-gray-400">Ready for clinical side-by-side comparison</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setSelectedCompareSlugs([])}
              className="text-xs font-semibold text-gray-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>

            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 bg-[#1e4d2b] hover:bg-[#286339] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Compare Now</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Condition Comparison Modal */}
      <ConditionComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        initialSlugs={selectedCompareSlugs}
        allDiseasesList={diseases}
      />
    </div>
  );
}
