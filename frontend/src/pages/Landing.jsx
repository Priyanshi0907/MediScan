import { Link } from "react-router-dom";
import {
  ArrowRight, Brain, BrainCircuit, ShieldCheck, FileText, Users, ClipboardList,
  Stethoscope, Lock, HeartPulse, Zap, MessageSquareText, Search,
  ListChecks, Sparkles, History, BookOpenText,
} from "lucide-react";
import LandingNavbar from "../components/LandingNavbar";
import Logo from "../components/Logo";
import heroScanImg from "../assets/hero_scan.png";

const heroStats = [
  { label: "Analyses Performed", value: "10K+", Icon: Users },
  { label: "Diseases Covered", value: "50+", Icon: ClipboardList },
  { label: "Accuracy Rate", value: "95%", Icon: ShieldCheck },
  { label: "AI Health Support", value: "24/7", Icon: Stethoscope },
];

const trustRow = [
  { label: "Your Health. Our Priority.", sub: "Early insights, better outcomes.", Icon: ShieldCheck },
  { label: "Secure & Private", sub: "Your data is safe with us.", Icon: Lock },
  { label: "Medically Informed", sub: "Built with medical knowledge.", Icon: HeartPulse },
  { label: "Instant Results", sub: "Get insights in seconds.", Icon: Zap },
];

const features = [
  { Icon: MessageSquareText, title: "Symptom / Medical Text Input", desc: "Describe symptoms in plain, natural language — no rigid forms or checkbox lists." },
  { Icon: Brain, title: "Disease Prediction", desc: "An NLP + ML pipeline analyzes the text and predicts the most likely condition with a confidence score." },
  { Icon: ListChecks, title: "Multiple Possible Conditions", desc: "See the top possible diseases ranked by likelihood, not just a single, overconfident guess." },
  { Icon: Search, title: "Symptom Detection", desc: "Key symptoms are automatically extracted and highlighted from your description." },
  { Icon: Sparkles, title: "Explainable Analysis", desc: "Understand exactly why a prediction was made, based on the symptoms detected." },
  { Icon: History, title: "Analysis History", desc: "Every analysis is saved so you can revisit and track patterns in your health over time." },
  { Icon: BookOpenText, title: "Disease Library", desc: "A searchable reference of conditions, common symptoms, and general care information." },
  { Icon: FileText, title: "Structured Reports", desc: "Export a clean, structured report of any analysis to share or keep for your records." },
];

const steps = [
  { n: "01", title: "Describe your symptoms", desc: "Type what you're experiencing in your own words — as much or as little detail as you have." },
  { n: "02", title: "NLP extracts key symptoms", desc: "Our text pipeline cleans the input and identifies the medically relevant symptoms within it." },
  { n: "03", title: "ML model predicts conditions", desc: "A trained classification model scores your symptoms against dozens of known conditions." },
  { n: "04", title: "Review your results", desc: "See the top possible conditions, confidence scores, and a plain-language explanation." },
];

export default function Landing() {
  return (
    <div className="bg-white text-[#1c1f1d] min-h-screen">
      <LandingNavbar />

      <main className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* HERO SECTION */}
        <section
          id="home"
          className="relative pt-10 pb-12 grid lg:grid-cols-12 gap-8 items-center"
        >
          {/* Faint Honeycomb Watermark Pattern on Left Edge */}
          <div className="absolute left-[-20px] top-12 w-32 h-64 pointer-events-none opacity-30 select-none">
            <svg viewBox="0 0 100 200" fill="none" stroke="#2d6a4f" strokeWidth="1">
              <polygon points="30,20 60,35 60,65 30,80 0,65 0,35" />
              <polygon points="60,65 90,80 90,110 60,125 30,110 30,80" />
              <polygon points="30,110 60,125 60,155 30,170 0,155 0,125" />
            </svg>
          </div>

          {/* Left Column: Heading, description, 3 bullets, CTAs */}
          <div className="lg:col-span-6 relative z-10">
            <h1 className="font-display font-extrabold text-[44px] sm:text-[52px] leading-[1.08] tracking-tight text-[#111827]">
              AI-Powered
              <br />
              <span className="text-[#1e4d2b]">Disease Analysis</span>
            </h1>

            <p className="mt-4 text-[15px] text-[#4b5563] max-w-lg leading-relaxed font-normal">
              Advanced medical text analysis and prediction to help you understand possible conditions and take informed decisions.
            </p>

            {/* 3 Value bullets with circular light-green badges */}
            <div className="mt-7 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#edf5f0] border border-[#d2e8db] flex items-center justify-center shrink-0 text-[#1e4d2b]">
                  <Brain size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-[#111827] text-sm leading-snug">Smart Analysis</p>
                  <p className="text-xs text-[#6b7280]">NLP &amp; ML models analyze symptoms</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#edf5f0] border border-[#d2e8db] flex items-center justify-center shrink-0 text-[#1e4d2b]">
                  <ShieldCheck size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-[#111827] text-sm leading-snug">High Accuracy</p>
                  <p className="text-xs text-[#6b7280]">Reliable predictions with confidence</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-full bg-[#edf5f0] border border-[#d2e8db] flex items-center justify-center shrink-0 text-[#1e4d2b]">
                  <FileText size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-[#111827] text-sm leading-snug">Detailed Insights</p>
                  <p className="text-xs text-[#6b7280]">Understand causes and key symptoms</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons + ECG heartbeat line */}
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#1e4d2b] text-white font-medium hover:bg-[#163b21] transition-all shadow-xs text-sm"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white font-medium text-[#111827] hover:bg-gray-50 transition-all shadow-xs text-sm"
              >
                Learn More
              </a>
              {/* ECG heartbeat waveform */}
              <div className="hidden sm:flex items-center pl-2">
                <svg className="w-24 h-8 text-[#2d6a4f]/50" viewBox="0 0 100 30" fill="none">
                  <path
                    d="M0 15 H28 L33 6 L40 24 L46 8 L52 20 L56 15 H100"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: Exact Illustration Image */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0 flex items-center justify-center">
            <img
              src={heroScanImg}
              alt="Medical Scan & Analysis Preview"
              className="w-full h-auto object-contain select-none max-w-[640px] drop-shadow-sm"
              draggable="false"
            />
          </div>
        </section>


        {/* STATS SECTION CARD */}
        <section className="my-6">
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {heroStats.map(({ label, value, Icon }) => (
              <div key={label} className="flex items-center gap-3.5 px-3 py-1">
                <div className="w-11 h-11 rounded-full bg-[#edf5f0] border border-[#d2e8db] flex items-center justify-center text-[#1e4d2b] shrink-0">
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-display font-extrabold text-2xl text-[#111827] leading-tight">
                    {value}
                  </p>
                  <p className="text-xs text-[#6b7280] font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TRUST BANNER ROW */}
        <section className="my-6">
          <div className="bg-[#f2f7f4] rounded-2xl border border-[#e2ece5] px-8 py-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center relative overflow-hidden">
            {trustRow.map(({ label, sub, Icon }, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-[#cbe2d4] flex items-center justify-center text-[#1e4d2b] shrink-0 shadow-xs">
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#111827] leading-snug">{label}</p>
                  <p className="text-[11px] text-[#6b7280] font-normal">{sub}</p>
                </div>
              </div>
            ))}
            {/* ECG heartbeat waveform on far right */}
            <div className="hidden xl:block absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-24 h-10 text-[#2d6a4f]/50" viewBox="0 0 100 30" fill="none">
                <path
                  d="M0 15 H30 L35 4 L42 26 L48 6 L54 22 L58 15 H100"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>
      </main>

      {/* FEATURES */}
      <section id="features" className="bg-sand-50 border-y border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-xl mb-14">

            <p className="text-brand font-semibold text-sm mb-3">Features</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#12241a]">Everything you need to understand your symptoms</h2>
            <p className="mt-4 text-gray-600">A focused set of tools built around one workflow: describe, detect, predict, and explain.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-brand/40 hover:shadow-sm transition-all">
                <span className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center text-brand mb-4"><Icon size={20} /></span>
                <p className="font-semibold text-[#12241a] mb-1.5">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-xl mb-14 mx-auto text-center">
            <p className="text-brand font-semibold text-sm mb-3">How It Works</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#12241a]">From symptoms to insight, in four steps</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {steps.map(({ n, title, desc }, i) => (
              <div key={n} className="relative bg-white rounded-2xl border border-gray-100 p-6">
                <span className="font-display font-extrabold text-3xl text-brand-light block mb-4" style={{ WebkitTextStroke: "1.5px #1e4d2b", color: "transparent" }}>{n}</span>
                <p className="font-semibold text-[#12241a] mb-1.5">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-9 -right-3 w-6 h-px bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-brand text-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-white/60 font-semibold text-sm mb-3">About</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-5">Built as an educational NLP &amp; ML project</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              MEDiScan combines natural language processing and machine learning to turn a plain-language description of
              symptoms into a ranked list of possible conditions — with an explanation of the reasoning behind each prediction.
            </p>
            <p className="text-white/70 leading-relaxed mb-8">
              It is a prediction and learning tool, not a diagnostic device. Every result is paired with a clear disclaimer
              and encourages consulting a licensed healthcare professional for an actual diagnosis or treatment.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="font-display font-extrabold text-2xl">TF-IDF</p>
                <p className="text-white/60 text-sm mt-1">Feature extraction</p>
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl">Multi-model</p>
                <p className="text-white/60 text-sm mt-1">Logistic Reg. · NB · SVM</p>
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl">Explainable</p>
                <p className="text-white/60 text-sm mt-1">Symptom-level reasoning</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {[
              { Icon: BrainCircuit, t: "NLP Pipeline", d: "Cleaning, tokenization, lemmatization" },
              { Icon: Sparkles, t: "Explainable AI", d: "Symptom-level justification" },
              { Icon: ShieldCheck, t: "Safety Layer", d: "Rule-based urgency warnings" },
              { Icon: Lock, t: "Private by default", d: "Your history stays yours" },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="bg-white/10 border border-white/15 rounded-2xl p-5">
                <Icon size={20} className="mb-3 text-white/90" />
                <p className="font-semibold mb-1">{t}</p>
                <p className="text-white/60 text-sm">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#12241a] mb-4">
            Start understanding your symptoms today
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Create a free account and run your first AI-powered symptom analysis in under a minute.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-brand text-white font-semibold hover:bg-brand-dark transition-colors shadow-sm">
            Get Started <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-gray-400 text-center sm:text-right max-w-sm">
            MEDiScan is an educational prototype. It does not provide medical diagnoses — always consult a qualified
            healthcare professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
