// Decorative Himalayan backdrop: a faint Nepal map watermark plus a layered
// mountain range with a snow-capped Everest. Purely cosmetic (aria-hidden).
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      {/* Sun / moon glow over the peaks */}
      <div className="bd-sun" />

      {/* Faint Nepal map outline watermark */}
      <svg
        className="bd-map"
        viewBox="0 0 1000 480"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M60,262 L150,214 L214,232 L286,192 L360,214 L442,172 L520,202 L602,160
             L690,192 L782,150 L882,170 L952,140 L992,182 L942,232 L862,252 L820,292
             L742,302 L682,332 L600,322 L520,352 L442,332 L360,362 L282,342 L200,360
             L130,332 L72,320 Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>

      {/* Himalayan range */}
      <svg
        className="bd-mountains"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
      >
        {/* Farthest range */}
        <polygon
          className="range range-back"
          points="0,250 170,150 330,220 500,110 680,200 860,90 1040,190 1230,130 1440,220 1440,360 0,360"
        />
        {/* Mid range with Everest as the tallest peak (~x=720) */}
        <polygon
          className="range range-mid"
          points="0,290 200,200 380,270 560,170 720,40 900,190 1100,250 1300,180 1440,270 1440,360 0,360"
        />
        {/* Snow caps */}
        <polygon className="snow" points="664,108 720,40 778,110 748,86 720,64 692,86" />
        <polygon className="snow" points="520,210 560,170 604,212 582,196 560,182 538,196" />
        <polygon className="snow" points="852,128 900,90 948,130 924,114 900,102 876,114" />
        {/* Nearest range */}
        <polygon
          className="range range-front"
          points="0,330 260,250 500,315 720,235 960,305 1200,245 1440,315 1440,360 0,360"
        />
      </svg>
    </div>
  )
}
