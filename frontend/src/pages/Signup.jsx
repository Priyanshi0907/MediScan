import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create account");
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <ShieldPlus size={20} className="text-white" strokeWidth={2.25} />
          </span>
          <span className="font-display font-extrabold text-xl text-[#12241a]">MEDiScan</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="font-display font-extrabold text-2xl text-[#12241a] mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">Start analyzing symptoms with AI in a minute.</p>

          {error && (
            <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Full name</label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Priyanshi Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/15 outline-none text-sm"
                />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account? <Link to="/login" className="text-brand font-semibold">Log in</Link>
          </p>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6 max-w-sm mx-auto">
          By signing up you acknowledge MEDiScan is an educational tool and does not provide medical diagnoses.
        </p>
      </div>
    </div>
  );
}
