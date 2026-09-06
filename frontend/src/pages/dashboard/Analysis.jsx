import { useState } from "react";
import {
  FileText, Search, Sparkles, AlertTriangle, ThermometerSun, Target,
  ShieldAlert, CheckCircle2, Loader2, Siren, Download, HeartPulse,
  Stethoscope, Compass
} from "lucide-react";


import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "../../components/StatCard";
import ConfidenceBar from "../../components/ConfidenceBar";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { generatePdfReport } from "../../utils/generatePdfReport";

const MAX_LEN = 1000;
const PLACEHOLDER = "Describe your symptoms in natural language (e.g. 'I've had a headache since yesterday and I'm feeling nauseous')...";

const SAMPLES = [
  "I've had a headache since yesterday and I'm feeling nauseous",
  "High fever with shivering chills, body ache and dry cough",
  "Burning sensation during urination and feeling frequent urge to pee",
  "Shortness of breath with wheezing and persistent chest tightness",
  "Severe sharp lower right abdominal pain with nausea and fever",
];

export default function Analysis() {
  const { user, token } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const onAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.predict(text, token);
      setResult(data);

      // Dispatch live real-time notification
      window.dispatchEvent(
        new CustomEvent("mediscan_new_notification", {
          detail: {
            id: Date.now().toString(),
            title: `Analysis: ${data.top_prediction?.disease || "Completed"}`,
            message: `Identified ${data.top_prediction?.confidence}% match with ${data.risk_level} risk level.`,
            time: "Just now",
            read: false,
            type: "analysis",
          },
        })
      );
    } catch (err) {
      setError(err.message || "Something went wrong while analyzing your text.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!result) return;
    generatePdfReport({
      prediction: {
        ...result,
        input_text: text,
      },
      user,
      date: new Date().toISOString(),
    });

    // Dispatch notification
    window.dispatchEvent(
      new CustomEvent("mediscan_new_notification", {
        detail: {
          id: Date.now().toString(),
          title: "PDF Report Generated",
          message: `Clinical summary downloaded for ${result.top_prediction?.disease}.`,
          time: "Just now",
          read: false,
          type: "report",
        },
      })
    );
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const recs = result?.recommendations;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] font-display">Disease Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            AI-powered medical text analysis, clinical symptom extraction, and calibrated condition scoring
          </p>
        </div>

        {result && (
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e4d2b] text-white text-sm font-semibold hover:bg-[#163b21] transition-all shadow-xs shrink-0 self-start"
          >
            <Download size={16} /> Download PDF Report
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: INPUT */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] shrink-0 border border-[#d2e8db]">
                <FileText size={19} />
              </span>
              <div>
                <p className="font-bold text-[#111827]">Patient Symptoms / Medical Text</p>
                <p className="text-xs text-gray-500">Enter your symptoms or clinical observations in plain English</p>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={text}
                maxLength={MAX_LEN}
                onChange={(e) => setText(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={6}
                className="w-full resize-none rounded-xl border border-gray-200 bg-sand-50/60 focus:bg-white focus:border-[#1e4d2b] focus:ring-2 focus:ring-[#1e4d2b]/15 outline-none p-4 text-sm text-[#111827] placeholder:text-gray-400"
              />
              <span className="absolute bottom-3 right-4 text-xs text-gray-400">
                {text.length} / {MAX_LEN}
              </span>
            </div>

            {/* Quick Sample Chips */}
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Quick Test Samples:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setText(s)}
                    className="text-[11.5px] px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors truncate max-w-full text-left"
                  >
                    "{s.slice(0, 38)}..."
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={onAnalyze}
              disabled={loading || !text.trim()}
              className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e4d2b] text-white font-semibold hover:bg-[#163b21] transition-colors disabled:opacity-50 shadow-xs"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {loading ? "Analyzing Symptoms…" : "Analyze Symptoms"}
            </button>
          </div>

          {/* Overview Stat Cards */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] shrink-0 border border-[#d2e8db]">
                <Target size={19} />
              </span>
              <p className="font-bold text-[#111827]">Analysis Overview</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Text Length" value={`${result ? result.word_count : wordCount} words`} Icon={FileText} />
              <StatCard label="Symptoms Found" value={result ? result.detected_symptoms.length : "–"} Icon={ThermometerSun} />
              <StatCard label="Conditions Matched" value={result ? result.total_conditions_matched : "–"} Icon={Target} />
              <StatCard
                label="Risk Level"
                value={result ? result.risk_level : "–"}
                Icon={ShieldAlert}
                tone={result?.risk_level === "High" ? "danger" : result?.risk_level === "Moderate" ? "warn" : "good"}
              />
            </div>
          </div>

          {/* ── AFFECTED BODY SYSTEMS PIE CHART (LEFT COLUMN) ── */}
          {result && result.affected_systems && result.affected_systems.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] shrink-0 border border-[#d2e8db]">
                  <HeartPulse size={19} />
                </span>
                <div>
                  <p className="font-bold text-[#111827]">Affected Body Systems</p>
                  <p className="text-xs text-gray-500">Anatomical domain correlation distribution</p>
                </div>
              </div>

              {/* Pie Chart Representation */}
              <div className="h-52 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={result.affected_systems}
                      dataKey="percentage"
                      nameKey="system"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {result.affected_systems.map((entry, index) => {
                        const COLORS = ["#1e4d2b", "#10b981", "#059669", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4"];
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val}% Match`, `${name} System`]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend & Percentage breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                {result.affected_systems.map((item, index) => {
                  const COLORS = ["#1e4d2b", "#10b981", "#059669", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4"];
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={item.system} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 border border-gray-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-xs font-semibold text-gray-700 truncate">{item.system}</span>
                      </div>
                      <span className="text-xs font-bold text-[#111827] ml-2">{item.percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: RESULT */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] shrink-0 border border-[#d2e8db]">
                  <Sparkles size={19} />
                </span>
                <div>
                  <p className="font-bold text-[#111827]">Prediction Result</p>
                  <p className="text-xs text-gray-500">Multiclass ML prediction &amp; clinical evidence</p>
                </div>
              </div>
            </div>

            {!result && !loading && (
              <div className="text-center py-16 text-sm text-gray-400">
                Enter your symptoms on the left and click <span className="font-semibold text-gray-700">Analyze Symptoms</span> to see comprehensive clinical predictions and recommendations.
              </div>
            )}

            {loading && (
              <div className="text-center py-16 text-sm text-gray-500 flex flex-col items-center gap-3">
                <Loader2 size={26} className="animate-spin text-[#1e4d2b]" />
                <p className="font-medium">Extracting medical entities and calculating condition scores…</p>
              </div>
            )}

            {result && (
              <>
                <div className="flex items-start justify-between mb-3 bg-[#edf5f0]/60 p-4 rounded-xl border border-[#d2e8db]">
                  <div>
                    <p className="text-xs font-semibold text-[#1e4d2b] uppercase tracking-wider mb-1">Most Likely Condition</p>
                    <p className="font-display font-extrabold text-2xl text-[#111827]">{result.top_prediction.disease}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-extrabold text-3xl text-[#1e4d2b]">{result.top_prediction.confidence}%</p>
                    <p className="text-xs text-gray-500 font-medium">Confidence Match</p>
                  </div>
                </div>

                <div className="mb-4">
                  <ConfidenceBar value={result.top_prediction.confidence} />
                </div>

                {result.emergency_warning && (
                  <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3">
                    <Siren size={18} className="mt-0.5 shrink-0 text-red-600" />
                    <span>{result.emergency_warning}</span>
                  </div>
                )}

                {/* Detected Symptoms */}
                <div className="mt-5">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Detected Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {result.detected_symptoms.length === 0 ? (
                      <span className="text-xs text-gray-400 italic">No specific medical terms isolated</span>
                    ) : (
                      result.detected_symptoms.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1.5 bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4] text-xs font-semibold px-3 py-1 rounded-full shadow-2xs"
                        >
                          <CheckCircle2 size={13} /> {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Other Differential Conditions */}
                <div className="mt-5">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Differential Diagnoses (Other Possible Conditions)</p>
                  <div className="space-y-2.5">
                    {result.other_predictions.map((p, i) => (
                      <div key={p.disease} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-gray-800 font-semibold">{i + 2}. {p.disease}</span>
                          <span className="text-gray-500">{p.confidence}% likelihood</span>
                        </div>
                        <ConfidenceBar value={p.confidence} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="mt-5 bg-sand-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">Clinical Rationale</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{result.explanation}</p>
                </div>

                {/* ── Personalized AI Recommendations ── */}
                {recs && (
                  <div className="mt-6 rounded-2xl border border-[#cbe2d4] bg-white p-5 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Sparkles size={17} className="text-[#1e4d2b]" />
                      <p className="text-sm font-bold text-[#111827]">Personalized AI Health Guidance</p>
                    </div>

                    {/* Specialist Consult */}
                    <div className="flex items-start gap-3 bg-[#edf5f0]/60 p-3.5 rounded-xl border border-[#d2e8db]">
                      <Stethoscope size={18} className="text-[#1e4d2b] mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-[#111827]">Recommended Specialist Consultation</p>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{recs.doctor_consult}</p>
                      </div>
                    </div>

                    {/* Immediate Care */}
                    <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <HeartPulse size={18} className="text-emerald-700 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-[#111827]">Immediate Care &amp; Comfort Measures</p>
                        <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                          {(recs.immediate_care || []).map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Diet & Lifestyle */}
                    <div className="flex items-start gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <Compass size={18} className="text-teal-700 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-[#111827]">Diet &amp; Recovery Guidance</p>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{recs.diet_lifestyle}</p>
                      </div>
                    </div>

                    {/* Warning Signs */}
                    <div className="flex items-start gap-3 bg-red-50/70 p-3.5 rounded-xl border border-red-100 text-red-900">
                      <ShieldAlert size={18} className="text-red-600 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-red-800">Warning Signs (When to seek urgent care)</p>
                        <p className="text-red-700/90 mt-0.5 leading-relaxed">{recs.red_flags}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl px-4 py-3.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>This is an educational AI prototype and does NOT constitute a clinical diagnosis. Always consult a qualified medical professional for diagnosis or treatment.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
