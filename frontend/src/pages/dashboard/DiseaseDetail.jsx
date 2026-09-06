import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ThermometerSun, Info, ShieldAlert, BookMarked, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function DiseaseDetail() {
  const { slug } = useParams();
  const { token } = useAuth();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.diseaseDetail(slug, token);
        setDisease(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="py-20 flex justify-center text-gray-400"><Loader2 className="animate-spin" /></div>;
  if (error || !disease) return <p className="text-sm text-red-500">{error || "Disease not found."}</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/dashboard/library" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand">
        <ArrowLeft size={15} /> Back to Disease Library
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <span className="inline-block text-xs font-medium text-brand bg-brand-light rounded-full px-2.5 py-1 mb-3">{disease.category}</span>
        <h1 className="font-display font-extrabold text-2xl text-[#12241a] mb-2">{disease.name}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">{disease.description}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand"><ThermometerSun size={17} /></span>
          <p className="font-semibold text-[#12241a]">Common symptoms</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {disease.symptoms.map((s) => (
            <span key={s} className="bg-sand-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand"><BookMarked size={17} /></span>
          <p className="font-semibold text-[#12241a]">General care information</p>
        </div>
        <ul className="space-y-2.5">
          {disease.general_care.map((tip) => (
            <li key={tip} className="flex gap-2.5 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" /> {tip}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-400 mt-4">
          Source: {disease.source}. General information only — not a treatment plan or prescription.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-6">
        <div>
          <p className="text-xs text-gray-500">Training examples for this class</p>
          <p className="font-display font-extrabold text-lg text-[#12241a]">{disease.training_examples}</p>
        </div>
        <div className="w-px h-10 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-500">Model confidence range</p>
          <p className="font-display font-extrabold text-lg text-[#12241a]">{disease.confidence_range}</p>
        </div>
      </div>

      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl px-4 py-3.5">
        <ShieldAlert size={16} className="mt-0.5 shrink-0" />
        <span>
          This page provides educational information only, not medical advice or a treatment plan. Medication, dosage, and
          treatment decisions must be made with a licensed healthcare professional.
        </span>
      </div>
    </div>
  );
}
