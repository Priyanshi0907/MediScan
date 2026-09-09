import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Scale,
  AlertTriangle,
  Lightbulb,
  Stethoscope,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Plus,
  FileSearch,
  Layers,
  Sparkles,
  Flame,
  Zap,
  Check,
  HeartPulse
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import ConditionComparisonModal from "../../components/ConditionComparisonModal";

export default function DiseaseDetail() {
  const { slug } = useParams();
  const { token } = useAuth();
  const [disease, setDisease] = useState(null);
  const [allDiseases, setAllDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Comparison state
  const [compareSlugs, setCompareSlugs] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Bookmark / Save state
  const [isSaved, setIsSaved] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Load disease details and all diseases list
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [detailData, listData] = await Promise.all([
          api.diseaseDetail(slug, token),
          api.diseases(token).catch(() => ({ items: [] }))
        ]);
        setDisease(detailData);
        setAllDiseases(listData.items || []);

        // Initialize compare selection with current disease + 1 related condition if available
        const initialCompare = [slug];
        if (detailData.differential_diagnosis && detailData.differential_diagnosis.length > 0) {
          initialCompare.push(detailData.differential_diagnosis[0].slug);
        }
        setCompareSlugs(initialCompare);

        // Check bookmark status
        try {
          const saved = JSON.parse(localStorage.getItem("mediscan_saved_diseases") || "[]");
          setIsSaved(saved.includes(slug));
        } catch {
          setIsSaved(false);
        }
      } catch (err) {
        setError(err.message || "Failed to load condition details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, token]);

  const toggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("mediscan_saved_diseases") || "[]");
      let nextSaved;
      if (saved.includes(slug)) {
        nextSaved = saved.filter((s) => s !== slug);
        setIsSaved(false);
      } else {
        nextSaved = [...saved, slug];
        setIsSaved(true);
      }
      localStorage.setItem("mediscan_saved_diseases", JSON.stringify(nextSaved));
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCompareSlug = (targetSlug) => {
    setCompareSlugs((prev) => {
      if (prev.includes(targetSlug)) {
        // keep current disease at least
        if (prev.length === 1 && targetSlug === slug) return prev;
        return prev.filter((s) => s !== targetSlug);
      } else {
        if (prev.length >= 4) return prev;
        return [...prev, targetSlug];
      }
    });
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-[#1e4d2b]" size={36} />
        <p className="text-sm font-semibold text-gray-600">Loading condition profile...</p>
      </div>
    );
  }

  if (error || !disease) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center bg-white rounded-2xl border border-gray-200 p-8">
        <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Condition Not Found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">{error || "The requested disease record does not exist."}</p>
        <Link
          to="/dashboard/library"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e4d2b] text-white text-xs font-semibold rounded-xl hover:bg-[#163b21] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Library
        </Link>
      </div>
    );
  }

  const status = disease.status || disease.urgency || "Primary Care";
  const isEmergency = status.toLowerCase().includes("emergency");
  const isUrgent = status.toLowerCase().includes("urgent");
  const isChronic = status.toLowerCase().includes("chronic");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "causes_triggers", label: "Causes & Triggers" },
    { id: "diagnosis", label: "Diagnosis" },
    { id: "management", label: "Management" },
    { id: "compare", label: "Compare" }
  ];

  const topRelatedConditions = (disease.differential_diagnosis || []).slice(0, 6);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Back Navigation & Quick Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/library"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#1e4d2b] transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Disease Library
        </Link>

        {savedToast && (
          <span className="text-xs font-bold text-[#1e4d2b] bg-[#edf5f0] border border-[#cbe2d4] px-3 py-1 rounded-full animate-in fade-in duration-200">
            {isSaved ? "Saved to your library" : "Removed from saved library"}
          </span>
        )}
      </div>

      {/* Hero Condition Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-4 relative overflow-hidden">
        {/* Decorative Background Tint */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-linear-to-bl from-[#edf5f0]/50 via-transparent to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="space-y-3">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {disease.category}
              </span>

              {/* Status Badge: Red (Emergency), Orange (Urgent), Yellow (Chronic), Normal (Primary Care) */}
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isEmergency
                    ? "bg-red-50 text-red-700 border-red-200"
                    : isUrgent
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : isChronic
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-[#edf5f0] text-[#1e4d2b] border-[#cbe2d4]"
                }`}
              >
                {status}
              </span>
            </div>

            {/* Condition Title */}
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4] flex items-center justify-center shrink-0">
                <Stethoscope size={22} />
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#111827]">
                {disease.name}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 relative z-10">
            <button
              onClick={toggleSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSaved
                  ? "bg-[#edf5f0] text-[#1e4d2b] border-[#cbe2d4] shadow-2xs"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {isSaved ? "Saved in Library" : "Save to library"}
            </button>

            <button
              onClick={() => {
                setActiveTab("compare");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1e4d2b] text-white hover:bg-[#163b21] transition-colors shadow-xs"
            >
              <Scale size={15} />
              Compare
            </button>
          </div>
        </div>

        {/* Clinical One-Liner Summary */}
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal pt-1 relative z-10">
          {disease.description}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-2xl px-4 pt-2 shadow-2xs">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "border-[#1e4d2b] text-[#1e4d2b]"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 4-Card Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Card 1: Key Points */}
              <div className="bg-[#f7fbf8] rounded-2xl border border-[#d2e8db] p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1e4d2b] font-bold text-sm">
                  <Lightbulb size={18} className="text-[#1e4d2b]" />
                  <span className="font-display">Key Points</span>
                </div>
                <div className="space-y-2.5 text-xs text-gray-700">
                  <div>
                    <span className="font-bold text-gray-900">Common cause: </span>
                    <span>{disease.key_points?.common_cause || disease.description}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Common symptoms: </span>
                    <span>{disease.key_points?.common_symptoms || (disease.symptoms || []).join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Diagnosis: </span>
                    <span>{disease.key_points?.diagnosis || "Comprehensive clinical history and targeted diagnostic evaluation."}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Treatment: </span>
                    <span>{disease.key_points?.treatment || "Standard evidence-based medical and supportive care."}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Red Flags */}
              <div className="bg-[#fff5f5] rounded-2xl border border-red-200/80 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <AlertTriangle size={18} className="text-red-600" />
                  <span className="font-display">Red Flags</span>
                </div>
                <ul className="space-y-2 text-xs text-red-950 font-medium">
                  {(disease.red_flags || [
                    "Persistent high-grade fever",
                    "Rapid worsening of localized symptoms",
                    "Altered mental status or confusion",
                    "Intolerance to oral hydration"
                  ]).map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 3: Symptoms (Clean chips, weights removed) */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#111827] font-bold text-sm">
                  <HeartPulse size={18} className="text-[#1e4d2b]" />
                  <span className="font-display">Key Symptoms</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(disease.symptoms || []).map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fafaf8] border border-gray-200 text-xs font-semibold text-gray-800"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e4d2b]" />
                      {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 4: Risk Factors */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#111827] font-bold text-sm">
                  <ShieldAlert size={18} className="text-[#1e4d2b]" />
                  <span className="font-display">Risk Factors</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  {(disease.risk_factors || [
                    "Family history of condition",
                    "Environmental exposures",
                    "Lifestyle stressors",
                    "Age-associated physiological susceptibility"
                  ]).map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* General Care & Guidance Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3 shadow-2xs">
              <h3 className="font-display font-bold text-base text-[#111827]">
                Clinical Care &amp; Patient Guidance
              </h3>
              <ul className="space-y-2.5">
                {(disease.general_care || []).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                    <CheckCircle2 size={16} className="text-[#1e4d2b] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                Source: {disease.source || "MediScan Clinical Guidelines"}. General educational reference.
              </p>
            </div>
          </div>
        )}

        {/* 2. CAUSES & TRIGGERS TAB (Replaced redundant symptoms tab) */}
        {activeTab === "causes_triggers" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="grid md:grid-cols-3 gap-5">
              {/* Root Causes */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1e4d2b] font-bold text-sm">
                  <Lightbulb size={18} />
                  <span className="font-display">Root Causes &amp; Etiology</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  {(disease.causes_and_triggers?.root_causes || [
                    "Inflammatory and cellular cascade mechanisms",
                    "Pathogen colonization or tissue disruption",
                    "Underlying physiological dysregulation"
                  ]).map((cause, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e4d2b] mt-1.5 shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Known Triggers */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <Flame size={18} className="text-amber-600" />
                  <span className="font-display">Triggers &amp; Aggravating Factors</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  {(disease.causes_and_triggers?.triggers || [
                    "Physical stress and inadequate recovery",
                    "Dietary or environmental exposures",
                    "Hormonal or metabolic fluctuations"
                  ]).map((trig, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{trig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Complications */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                  <AlertTriangle size={18} className="text-red-600" />
                  <span className="font-display">Progression &amp; Risks</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  {(disease.causes_and_triggers?.complications || [
                    "Progression to persistent or recurring episodes",
                    "Localized tissue damage or secondary complications",
                    "Impact on everyday functional capacity"
                  ]).map((comp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. DIAGNOSIS TAB */}
        {activeTab === "diagnosis" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="grid md:grid-cols-3 gap-5">
              {/* Labs */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1e4d2b] font-bold text-sm">
                  <FileSearch size={18} />
                  <span className="font-display">Laboratory Tests</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  {(disease.investigations?.labs || ["Complete Blood Count (CBC)", "Inflammatory Markers (CRP/ESR)"]).map((lab, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e4d2b] mt-1.5 shrink-0" />
                      <span>{lab}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Imaging */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1e4d2b] font-bold text-sm">
                  <Layers size={18} />
                  <span className="font-display">Diagnostic Imaging</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  {(disease.investigations?.imaging || ["Ultrasound / Plain Radiograph", "Targeted CT/MRI"]).map((img, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e4d2b] mt-1.5 shrink-0" />
                      <span>{img}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical Examination */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-[#1e4d2b] font-bold text-sm">
                  <Stethoscope size={18} />
                  <span className="font-display">Clinical Examination</span>
                </div>
                <ul className="space-y-2 text-xs text-gray-700">
                  {(disease.investigations?.clinical_signs || ["Vital signs triage", "Targeted focal examination"]).map((sign, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e4d2b] mt-1.5 shrink-0" />
                      <span>{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 4. MANAGEMENT TAB */}
        {activeTab === "management" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-5 shadow-2xs">
              <div>
                <h2 className="font-display font-bold text-lg text-[#111827]">
                  Clinical Management &amp; Treatment Pathway
                </h2>
                <p className="text-xs text-gray-500">
                  Standard evidence-based clinical protocols and therapeutic tiers
                </p>
              </div>

              <div className="space-y-4">
                {/* Immediate Care */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                    Immediate / Stabilization Phase
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {(disease.management?.immediate || ["Evaluate clinical stability", "Provide prompt symptomatic relief"]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* First-line Therapy */}
                <div className="p-4 rounded-xl bg-[#edf5f0]/60 border border-[#cbe2d4] space-y-2">
                  <h4 className="font-bold text-xs text-[#1e4d2b] uppercase tracking-wider">
                    First-Line Clinical Therapy
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-800">
                    {(disease.management?.first_line || ["Standard medical therapy guidelines"]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1e4d2b] mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Supportive & Preventive */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                    Supportive &amp; Lifestyle Maintenance
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {(disease.management?.supportive || ["Adequate hydration and rest"]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. COMPARE TAB (Combined single section with top 6 related conditions) */}
        {activeTab === "compare" && (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-5 shadow-2xs animate-in fade-in duration-150">
            {/* Header with Title and Top-Right Compare Selected Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4] flex items-center justify-center shrink-0">
                  <Scale size={20} />
                </span>
                <div>
                  <h3 className="font-display font-bold text-base text-[#111827]">
                    Related Conditions &amp; Clinical Differential
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select conditions to compare duration, red flags, symptoms, and diagnostics side-by-side
                  </p>
                </div>
              </div>

              {/* Compare Selected Button on Top Right */}
              <button
                onClick={() => setIsCompareModalOpen(true)}
                disabled={compareSlugs.length < 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1e4d2b] hover:bg-[#163b21] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto shrink-0"
              >
                <Scale size={14} />
                <span>Compare Selected ({compareSlugs.length}) →</span>
              </button>
            </div>

            {/* Top 6 Related Conditions Grid with + Disease for Comparison */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {topRelatedConditions.map((cond) => {
                const isSelected = compareSlugs.includes(cond.slug);
                return (
                  <div
                    key={cond.slug}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-[#f7fbf8] border-[#1e4d2b] shadow-xs"
                        : "bg-[#fafaf8] border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-[#111827]">{cond.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md shrink-0">
                          {cond.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {cond.distinguishing_factor}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-gray-200/70 flex items-center justify-between gap-2">
                      <Link
                        to={`/dashboard/library/${cond.slug}`}
                        className="text-xs font-bold text-gray-600 hover:text-[#1e4d2b] inline-flex items-center gap-1"
                      >
                        View profile <ChevronRight size={13} />
                      </Link>

                      {/* + Disease for comparison button allowing multi-condition comparisons */}
                      <button
                        onClick={() => handleToggleCompareSlug(cond.slug)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all inline-flex items-center gap-1 shrink-0 ${
                          isSelected
                            ? "bg-[#1e4d2b] text-white border-[#1e4d2b] shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-[#1e4d2b]"
                        }`}
                      >
                        {isSelected ? <Check size={12} /> : <Plus size={12} />}
                        <span>{isSelected ? "Selected" : "Compare"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Educational Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs rounded-2xl p-4">
        <ShieldAlert size={18} className="mt-0.5 text-amber-600 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold">Medical &amp; Clinical Monograph Disclaimer: </span>
          <span>
            This condition profile is provided for educational and clinical reference only. Diagnostic evaluations, red flags, and
            management protocols should be evaluated by qualified medical professionals.
          </span>
        </div>
      </div>

      {/* Condition Comparison Modal */}
      <ConditionComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        initialSlugs={compareSlugs.length >= 1 ? compareSlugs : [slug]}
        allDiseasesList={allDiseases}
      />
    </div>
  );
}
