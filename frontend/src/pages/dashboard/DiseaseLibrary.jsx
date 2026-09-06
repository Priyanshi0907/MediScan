import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, ArrowRight, Loader2 } from "lucide-react";


import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function DiseaseLibrary() {
  const { token } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.diseases(token);
        setDiseases(data.items || []);
      } catch (err) {
        console.error("Failed to load disease library", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const categories = ["All", ...new Set(diseases.map((d) => d.category))];
  const filtered = diseases.filter((d) => {
    const q = query.toLowerCase();
    const matchesQuery =
      d.name.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.symptoms && d.symptoms.some((s) => s.toLowerCase().includes(q)));
    const matchesCategory = category === "All" || d.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Search Control */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] border border-[#d2e8db] shrink-0">
              <BookOpen size={20} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-[#111827]">Disease &amp; Clinical Knowledge Library</h1>
              <p className="text-xs text-gray-500">
                Explore {diseases.length} comprehensive medical conditions, symptoms, and clinical care tips
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-[#edf5f0] text-[#1e4d2b] rounded-full border border-[#cbe2d4] self-start sm:self-auto">
            {filtered.length} condition{filtered.length !== 1 ? "s" : ""} available
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by disease name (e.g. Migraine, Asthma), symptom (e.g. nausea, cough), or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#1e4d2b] focus:ring-1 focus:ring-[#1e4d2b]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                category === c
                  ? "bg-[#1e4d2b] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Disease Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center text-gray-400">
          <Loader2 className="animate-spin text-[#1e4d2b]" size={32} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <Link
              key={d.slug}
              to={`/dashboard/library/${d.slug}`}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:border-[#1e4d2b] hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-[#111827] group-hover:text-[#1e4d2b] transition-colors leading-snug">
                    {d.name}
                  </h3>
                  <span className="shrink-0 text-[10.5px] font-semibold text-[#1e4d2b] bg-[#edf5f0] border border-[#cbe2d4] rounded-full px-2 py-0.5">
                    {d.category}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 mb-3.5 leading-relaxed">
                  {d.description}
                </p>

                {/* Symptom Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(d.symptoms || []).slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
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

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#1e4d2b]">
                <span>View condition details</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200/80">
              <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-gray-700">No diseases found matching "{query}"</p>
              <p className="text-xs text-gray-500 mt-1">Try a different symptom keyword or select "All" categories.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
