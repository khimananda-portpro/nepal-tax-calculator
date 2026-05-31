// Decorative Himalayan backdrop (purely cosmetic, aria-hidden):
//   official Nepal map floating in the sky → sunrise glow → seated Buddha
//   silhouette → layered mountain range with a snow-capped Everest.
//
// The Nepal map is the official "New Map of Nepal" (Department of Survey, 2020,
// including Limpiyadhura/Kalapani), sourced from Wikimedia Commons and stored
// as /public/nepal-map.svg.
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      {/* Official Nepal map, filling the sky above the peaks */}
      <img className="bd-map" src="/nepal-map.svg" alt="" />

      {/* Sunrise glow behind the Buddha / over the peaks */}
      <div className="bd-sun" />

      {/* Gautam Buddha — born in Lumbini, Nepal — seated in meditation */}
      <svg className="bd-buddha" viewBox="0 0 240 280" preserveAspectRatio="xMidYMax meet">
        <g className="bd-figure">
          <ellipse cx="120" cy="24" rx="10" ry="13" />
          <circle cx="120" cy="56" r="30" />
          <path
            d="M120,84 C96,86 80,99 72,124 C61,156 45,182 41,214
               C40,231 51,239 73,241 L167,241
               C189,239 200,231 199,214 C195,182 179,156 168,124
               C160,99 144,86 120,84 Z"
          />
        </g>
      </svg>

      {/* Himalayan range */}
      <svg className="bd-mountains" viewBox="0 0 1440 360" preserveAspectRatio="none">
        <polygon
          className="range range-back"
          points="0,250 170,150 330,220 500,110 680,200 860,90 1040,190 1230,130 1440,220 1440,360 0,360"
        />
        <polygon
          className="range range-mid"
          points="0,290 200,200 380,270 560,170 720,40 900,190 1100,250 1300,180 1440,270 1440,360 0,360"
        />
        <polygon className="snow" points="664,108 720,40 778,110 748,86 720,64 692,86" />
        <polygon className="snow" points="520,210 560,170 604,212 582,196 560,182 538,196" />
        <polygon className="snow" points="852,128 900,90 948,130 924,114 900,102 876,114" />
        <polygon
          className="range range-front"
          points="0,330 260,250 500,315 720,235 960,305 1200,245 1440,315 1440,360 0,360"
        />
      </svg>
    </div>
  )
}
