import React from "react";
import { Dna, Brain, Heart, Activity } from "lucide-react";

export default function BodyScanIllustration() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto aspect-[4/5] flex items-center justify-center select-none">
      {/* Background Radar / Halo Circular Grid */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Soft radial glow */}
        <div className="w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#e4f1e9]/90 to-[#d5e9dc]/60 blur-2xl" />

        {/* Outer Circular Grid / Radar */}
        <svg
          viewBox="0 0 400 400"
          className="absolute w-[390px] h-[390px] opacity-75"
          fill="none"
        >
          {/* Concentric rings */}
          <circle
            cx="200"
            cy="200"
            r="185"
            stroke="#2d6a4f"
            strokeOpacity="0.25"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <circle
            cx="200"
            cy="200"
            r="150"
            stroke="#2d6a4f"
            strokeOpacity="0.2"
            strokeWidth="1"
          />
          <circle
            cx="200"
            cy="200"
            r="110"
            stroke="#2d6a4f"
            strokeOpacity="0.15"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          <circle
            cx="200"
            cy="200"
            r="70"
            stroke="#2d6a4f"
            strokeOpacity="0.12"
            strokeWidth="1"
          />

          {/* Radar Crosshairs / Grid lines */}
          <line
            x1="200"
            y1="10"
            x2="200"
            y2="390"
            stroke="#2d6a4f"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
          <line
            x1="10"
            y1="200"
            x2="390"
            y2="200"
            stroke="#2d6a4f"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
          <line
            x1="65"
            y1="65"
            x2="335"
            y2="335"
            stroke="#2d6a4f"
            strokeOpacity="0.08"
            strokeWidth="1"
          />
          <line
            x1="65"
            y1="335"
            x2="335"
            y2="65"
            stroke="#2d6a4f"
            strokeOpacity="0.08"
            strokeWidth="1"
          />

          {/* Circular Orbit Path for Badges */}
          <circle
            cx="200"
            cy="200"
            r="158"
            stroke="#2d6a4f"
            strokeOpacity="0.3"
            strokeWidth="1.2"
          />
        </svg>

        {/* Decorative background plus symbols */}
        <div className="absolute top-2 -right-4 text-[#2d6a4f]/25 font-light text-6xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-20 -right-2 text-[#2d6a4f]/15 font-light text-5xl pointer-events-none select-none">
          +
        </div>
        <div className="absolute top-44 -right-6 text-[#2d6a4f]/20 font-light text-7xl pointer-events-none select-none">
          +
        </div>
      </div>

      {/* Human Anatomy Hologram Vector */}
      <svg
        viewBox="0 0 260 420"
        className="relative z-10 w-full h-[92%] drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a7553" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#245a3d" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1e4d2b" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="organGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7fd39a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b965c" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="lungGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#c5ebd3" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Full Body Silhouette */}
        <g id="bodySilhouette">
          {/* Head & Neck */}
          <path
            d="M130 24 C143 24 151 34 151 49 C151 63 144 74 139 77 C141 83 143 90 144 94 C158 98 178 107 186 122 C194 136 195 168 193 194 C191 210 186 230 182 238 C179 244 174 245 171 237 C168 227 172 195 174 175 C176 156 169 146 165 142 C165 160 164 198 163 218 C162 238 162 254 158 266 C155 275 149 282 147 296 C145 310 147 342 148 372 C149 392 148 406 142 408 C137 410 133 400 133 388 C133 365 132 328 130 305 C128 328 127 365 127 388 C127 400 123 410 118 408 C112 406 111 392 112 372 C113 342 115 310 113 296 C111 282 105 275 102 266 C98 254 98 238 97 218 C96 198 95 160 95 142 C91 146 84 156 86 175 C88 195 92 227 89 237 C86 245 81 244 78 238 C74 230 69 210 67 194 C65 168 66 136 74 122 C82 107 102 98 116 94 C117 90 119 83 121 77 C116 74 109 63 109 49 C109 34 117 24 130 24 Z"
            fill="url(#bodyGrad)"
            stroke="#2d6a4f"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />

          {/* Subtle Muscle / Clavicle / Sternum lines */}
          <path
            d="M118 96 C124 101 130 102 136 102 C142 102 148 101 154 96"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="1.2"
            fill="none"
          />
          <line
            x1="130"
            y1="102"
            x2="130"
            y2="148"
            stroke="#ffffff"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
        </g>

        {/* Anatomical Organs Inside Body */}
        {/* Brain Outline in Head */}
        <g opacity="0.8">
          <path
            d="M123 35 C121 39 123 44 121 48 C120 52 124 57 127 58 C129 55 130 48 130 35 Z"
            fill="#d1f0dc"
            opacity="0.75"
          />
          <path
            d="M137 35 C139 39 137 44 139 48 C140 52 136 57 133 58 C131 55 130 48 130 35 Z"
            fill="#d1f0dc"
            opacity="0.75"
          />
          <path
            d="M122 42 C125 43 127 41 129 44 M122 49 C126 48 128 50 129 53 M138 42 C135 43 133 41 131 44 M138 49 C134 48 132 50 131 53"
            stroke="#245a3d"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </g>

        {/* Lungs (Chest) */}
        <g id="lungs">
          {/* Left Lung */}
          <path
            d="M125 110 C120 110 112 118 110 130 C108 142 110 155 116 160 C122 163 125 158 126 148 C127 138 126 122 125 110 Z"
            fill="url(#lungGrad)"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.9"
          />
          {/* Right Lung */}
          <path
            d="M135 110 C140 110 148 118 150 130 C152 142 150 155 144 160 C138 163 135 158 134 148 C133 138 134 122 135 110 Z"
            fill="url(#lungGrad)"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.9"
          />
          {/* Trachea and Bronchial Tree */}
          <path
            d="M130 102 L130 118 M130 118 L122 128 M130 118 L138 128 M122 128 L117 138 M122 128 L124 140 M138 128 L143 138 M138 128 L136 140"
            stroke="#1d4d2b"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* Heart */}
        <g id="heart" transform="translate(131, 134)">
          <path
            d="M0 0 C-4 -6 -10 -2 -8 4 C-6 10 0 15 2 17 C4 15 10 10 8 4 C6 -2 0 -6 0 0 Z"
            fill="#ffffff"
            opacity="0.9"
            stroke="#245a3d"
            strokeWidth="0.8"
          />
          <circle cx="0" cy="5" r="2" fill="#2d6a4f" opacity="0.8" />
        </g>

        {/* Stomach & Digestive System */}
        <g id="stomach" transform="translate(120, 168)">
          <path
            d="M14 0 C6 -1 0 5 2 14 C4 23 16 25 18 20 C20 15 20 6 14 0 Z"
            fill="#ffffff"
            opacity="0.85"
            stroke="#245a3d"
            strokeWidth="0.8"
          />
          {/* Intestines winding path */}
          <path
            d="M5 24 C1 28 8 32 12 30 C16 28 8 36 12 39 C16 42 20 36 15 34"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.8"
          />
        </g>
      </svg>

      {/* Floating Orbit Organ Badges */}
      {/* 1. DNA (Top Left) */}
      <div
        className="absolute top-[8%] left-[7%] w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2d6a4f] hover:scale-105 transition-transform"
        title="DNA / Genetics"
      >
        <Dna size={20} strokeWidth={2.2} />
      </div>

      {/* 2. Lungs (Mid Left) */}
      <div
        className="absolute top-[38%] left-[-2%] w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2d6a4f] hover:scale-105 transition-transform"
        title="Respiratory System"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 4v7M12 11l-3 4M12 11l3 4" />
          <path d="M8 12c-2.5 0-4 2-4 5.5s1.5 4.5 4 4.5c2 0 3-1.5 3-4V12H8zM16 12c2.5 0 4 2 4 5.5s-1.5 4.5-4 4.5c-2 0-3-1.5-3-4V12h3z" />
        </svg>
      </div>

      {/* 3. Stomach (Bottom Left) */}
      <div
        className="absolute bottom-[28%] left-[2%] w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2d6a4f] hover:scale-105 transition-transform"
        title="Digestive System"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 3v3c-3 0-6 3-5 8 1 5 6 7 8 5s2-5 1-8c-.5-1.5-.5-3 1-4" />
          <path d="M14 18c0 2-2 3-4 3" />
        </svg>
      </div>

      {/* 4. Heart (Bottom Center-Left) */}
      <div
        className="absolute bottom-[9%] left-[24%] w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2d6a4f] hover:scale-105 transition-transform"
        title="Cardiovascular System"
      >
        <Heart size={20} strokeWidth={2.2} fill="#2d6a4f" />
      </div>

      {/* 5. Brain (Top Right) */}
      <div
        className="absolute top-[18%] right-[10%] w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#2d6a4f] hover:scale-105 transition-transform"
        title="Neurological System"
      >
        <Brain size={20} strokeWidth={2.2} />
      </div>
    </div>
  );
}

