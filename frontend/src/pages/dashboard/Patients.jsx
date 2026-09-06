import { useEffect, useState } from "react";
import { Users, Loader2, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function Patients() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.history(token);
        setItems(data.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center text-brand font-display font-extrabold text-lg">
            {(user?.name || "U").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
          </span>
          <div>
            <p className="font-display font-extrabold text-lg text-[#12241a]">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand"><Users size={19} /></span>
          <div>
            <p className="font-semibold text-[#12241a]">Your Analysis Timeline</p>
            <p className="text-xs text-gray-500">A single-user view of every analysis you've run</p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center text-gray-400"><Loader2 className="animate-spin" /></div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No analyses recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-gray-500 shrink-0 mt-0.5">
                  <Clock size={14} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#12241a]">{item.top_disease} <span className="text-gray-400 font-normal">— {item.confidence}%</span></p>
                  <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
