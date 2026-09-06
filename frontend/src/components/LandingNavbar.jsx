import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];


export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[74px] flex items-center justify-between">
        <a href="#home" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className={`relative text-[14.5px] font-medium tracking-tight transition-colors ${
                i === 0
                  ? "text-[#1e4d2b] font-semibold"
                  : "text-gray-700 hover:text-[#1e4d2b]"
              }`}
            >
              {l.label}
              {i === 0 && (
                <span className="block h-[2.5px] w-8 bg-[#1e4d2b] rounded-full mx-auto mt-1" />
              )}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-6 py-2 rounded-lg border border-gray-300/90 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-all shadow-xs"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 rounded-lg bg-[#1e4d2b] text-white text-sm font-medium hover:bg-[#163b21] transition-all shadow-xs"
          >
            Sign Up
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block text-gray-700 font-medium py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <Link
              to="/login"
              className="flex-1 text-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center px-4 py-2 rounded-lg bg-[#1e4d2b] text-white text-sm font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

