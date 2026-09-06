import { useEffect, useState } from "react";
import {
  Activity, Sparkles, PieChart as PieIcon,
  BarChart2, ShieldCheck, ArrowRight, Loader2,
  HeartPulse, Stethoscope, Compass, AlertTriangle,
  CheckCircle2, ShieldAlert
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

const COLORS = ["#1e4d2b", "#2d6a4f", "#40916c", "#52b788", "#74c69d", "#95d5b2", "#b7e4c7"];

export default function HealthInsights() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.history(token);
        setItems(data.items || []);
      } catch (err) {
        console.error("Failed to load insights history", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#1e4d2b]" />
      </div>
    );
  }

  // Aggregate symptoms frequency & conditions
  const symptomCounts = {};
  const diseaseCounts = {};
  const riskCounts = { Low: 0, Moderate: 0, High: 0 };
  let totalConfidence = 0;

  items.forEach((item) => {
    (item.detected_symptoms || []).forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
    if (item.top_disease) {
      diseaseCounts[item.top_disease] = (diseaseCounts[item.top_disease] || 0) + 1;
    }
    if (item.risk_level && riskCounts[item.risk_level] !== undefined) {
      riskCounts[item.risk_level]++;
    }
    totalConfidence += item.confidence || 0;
  });

  const topSymptoms = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topDiseases = Object.entries(diseaseCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const avgConfidence = items.length ? Math.round(totalConfidence / items.length) : 0;
  const mostCommonSymptom = topSymptoms.length ? topSymptoms[0].name : "None recorded";

  // Derive Longitudinal Personalized Recommendations based on past history
  const allDiseasesStr = Object.keys(diseaseCounts).join(" ").toLowerCase();
  const allSymptomsStr = Object.keys(symptomCounts).join(" ").toLowerCase();

  const isRespiratory = allDiseasesStr.includes("asthma") || allDiseasesStr.includes("bronchitis") || allDiseasesStr.includes("pneumonia") || allSymptomsStr.includes("breath") || allSymptomsStr.includes("cough");
  const isNeurological = allDiseasesStr.includes("migraine") || allDiseasesStr.includes("headache") || allSymptomsStr.includes("headache") || allSymptomsStr.includes("nausea");
  const isDigestive = allDiseasesStr.includes("gastritis") || allDiseasesStr.includes("appendicitis") || allDiseasesStr.includes("gerd") || allSymptomsStr.includes("stomach") || allSymptomsStr.includes("abdominal");
  const isInfectious = allDiseasesStr.includes("malaria") || allDiseasesStr.includes("dengue") || allDiseasesStr.includes("fever") || allSymptomsStr.includes("fever") || allSymptomsStr.includes("chills");

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] font-display">Health Insights</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Personalized health recommendations and pattern analytics synthesized from your analysis history
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e4d2b] text-white rounded-xl text-sm font-semibold hover:bg-[#163b21] transition-colors shadow-xs shrink-0 self-start"
        >
          <Sparkles size={16} /> New Analysis
        </Link>
      </div>

      {/* Informational Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#edf5f0] border border-[#cbe2d4] flex items-start gap-3.5">
        <ShieldCheck size={22} className="text-[#1e4d2b] mt-0.5 shrink-0" />
        <div className="text-xs text-[#1e4d2b] leading-relaxed">
          <strong>Personalized Pattern Notice:</strong> Recommendations below are synthesized from your {items.length} historical symptom submissions. They are <strong>informational health guidelines</strong> to assist your conversations with licensed medical providers.
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-12 text-center max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#edf5f0] border border-[#d2e8db] flex items-center justify-center text-[#1e4d2b] mx-auto mb-4">
            <Activity size={28} />
          </div>
          <h2 className="text-lg font-bold text-[#111827]">No analysis data recorded yet</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Run your first symptom analysis to unlock personalized health recommendations, recurrent symptom tracking, and condition distributions.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e4d2b] text-white rounded-xl text-sm font-semibold hover:bg-[#163b21] transition-colors shadow-xs"
          >
            Analyze Symptoms <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Analyses</p>
              <p className="font-display font-extrabold text-2xl text-[#111827] mt-1.5">{items.length}</p>
              <p className="text-xs text-gray-400 mt-1">Recorded assessments</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Confidence</p>
              <p className="font-display font-extrabold text-2xl text-[#1e4d2b] mt-1.5">{avgConfidence}%</p>
              <p className="text-xs text-gray-400 mt-1">Average model match</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequent Symptom</p>
              <p className="font-display font-extrabold text-lg text-[#111827] mt-1.5 capitalize truncate">{mostCommonSymptom}</p>
              <p className="text-xs text-gray-400 mt-1">Highest frequency marker</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Profile</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${riskCounts.High > 0 ? "bg-red-500" : "bg-emerald-500"}`} />
                <p className="font-display font-extrabold text-base text-[#111827]">
                  {riskCounts.High > 0 ? `${riskCounts.High} Urgent Case${riskCounts.High > 1 ? "s" : ""}` : "Optimal / Stable"}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">{riskCounts.Low} low risk sessions</p>
            </div>
          </div>

          {/* ── PERSONALIZED RECOMMENDATIONS & LONGITUDINAL INSIGHTS ── */}
          <div className="bg-white rounded-3xl border border-[#cbe2d4] shadow-xs p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#edf5f0] flex items-center justify-center text-[#1e4d2b] shrink-0 border border-[#d2e8db]">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h2 className="font-display font-extrabold text-lg text-[#111827]">
                    Personalized Health Recommendations for {user?.name || "You"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    AI-driven care advice, trigger mitigation, and specialist roadmap based on your history
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#edf5f0] text-[#1e4d2b] text-xs font-bold border border-[#d2e8db] shrink-0 self-start sm:self-auto">
                {items.length} Analyses Analyzed
              </span>
            </div>

            {/* Recommendation Cards Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Specialist Guidance */}
              <div className="p-5 rounded-2xl bg-[#edf5f0]/60 border border-[#d2e8db] space-y-3">
                <div className="flex items-center gap-2.5 text-[#1e4d2b]">
                  <Stethoscope size={19} />
                  <p className="font-bold text-sm text-[#111827]">Recommended Specialist Follow-up</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isNeurological && "Based on recurrent headache/nausea patterns, consider consulting a Neurologist for an evaluation of migraine triggers."}
                  {isDigestive && !isNeurological && "Given your digestive and abdominal records, a consultation with a Gastroenterologist or Physician is recommended."}
                  {isRespiratory && !isNeurological && !isDigestive && "With your respiratory symptom records (wheezing, breathlessness), scheduling a Pulmonologist checkup is advised."}
                  {isInfectious && !isNeurological && !isDigestive && !isRespiratory && "Given your fever and chills records, consult an Infectious Disease Specialist or Physician."}
                  {!isNeurological && !isDigestive && !isRespiratory && !isInfectious && "Schedule a routine preventative health checkup with a General Physician to review your general vitals."}
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-[#1e4d2b]">
                  <CheckCircle2 size={14} /> Bring your exported PDF history reports to your appointment
                </div>
              </div>

              {/* Lifestyle & Trigger Management */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-800">
                  <Compass size={19} />
                  <p className="font-bold text-sm text-[#111827]">Personalized Lifestyle &amp; Trigger Plan</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {isNeurological && "Maintain consistent sleep schedules, limit prolonged screen exposure, hydrate (2.5L/day), and record dietary triggers like caffeine or aged cheeses."}
                  {isDigestive && !isNeurological && "Adopt smaller, frequent bland meals (toast, oats, bananas). Limit late-night eating, acidic citrus, and spicy or fried foods."}
                  {isRespiratory && !isNeurological && !isDigestive && "Minimize exposure to cold air, dust, and aerosol pollutants. Use warm steam inhalation and maintain humidity."}
                  {isInfectious && !isNeurological && !isDigestive && !isRespiratory && "Prioritize electrolyte hydration (ORS, coconut water, broths) and strict physical rest until fever resolves."}
                  {!isNeurological && !isDigestive && !isRespiratory && !isInfectious && "Prioritize 7-8 hours of restful sleep, 30 minutes of moderate physical activity, and clean hydration."}
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Track trigger correlations across future entries
                </div>
              </div>

              {/* Longitudinal Symptom Pattern Insight */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                <div className="flex items-center gap-2.5 text-teal-800">
                  <HeartPulse size={19} />
                  <p className="font-bold text-sm text-[#111827]">Longitudinal Symptom Pattern</p>
                </div>
                <div className="text-xs text-gray-600 space-y-1.5">
                  <p className="leading-relaxed">
                    Most recurrent symptom: <span className="font-bold text-[#111827] capitalize">{mostCommonSymptom}</span> (present in {Math.round((symptomCounts[mostCommonSymptom] / items.length) * 100) || 0}% of submissions).
                  </p>
                  <p className="leading-relaxed text-gray-500">
                    Tracking symptom frequency over time helps doctors distinguish between acute, isolated episodes and chronic underlying conditions.
                  </p>
                </div>
              </div>

              {/* Safety & Warning Triggers */}
              <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200/80 space-y-3">
                <div className="flex items-center gap-2.5 text-red-700">
                  <ShieldAlert size={19} />
                  <p className="font-bold text-sm text-red-900">Urgent Warning Signals</p>
                </div>
                <p className="text-xs text-red-800/90 leading-relaxed">
                  Seek emergency medical evaluation immediately if you develop sudden shortness of breath, severe chest or abdominal rigidity, high fever above 102°F, or sudden neurological weakness.
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs font-semibold text-red-700">
                  <AlertTriangle size={14} /> Do not delay urgent care if red flag symptoms manifest
                </div>
              </div>
            </div>
          </div>

          {/* Visual Breakdown Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Frequently Analyzed Symptoms */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                    <BarChart2 size={18} className="text-[#1e4d2b]" /> Frequently Analyzed Symptoms
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Recurrence frequency count of detected symptoms</p>
                </div>
              </div>

              {topSymptoms.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-gray-400">
                  No symptom data available
                </div>
              ) : (
                <div className="h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSymptoms} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <XAxis type="number" allowDecimals={false} stroke="#9ca3af" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#4b5563" fontSize={11} width={90} />
                      <Tooltip
                        contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                      />
                      <Bar dataKey="count" fill="#1e4d2b" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Condition Distribution Pie */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                    <PieIcon size={18} className="text-[#1e4d2b]" /> Conditions Profile
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Top predicted condition distribution in history</p>
                </div>
              </div>

              {topDiseases.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-xs text-gray-400">
                  No condition data available
                </div>
              ) : (
                <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-full sm:w-1/2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topDiseases}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {topDiseases.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2">
                    {topDiseases.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-gray-700 truncate max-w-[140px]">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          {d.name}
                        </span>
                        <span className="font-semibold text-gray-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
