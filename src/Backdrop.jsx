// Decorative Himalayan backdrop (purely cosmetic, aria-hidden), layered:
//   official Nepal map in the sky → real Gautam Buddha photo → real Mount
//   Everest photo as the foreground range.
//
// Images (Wikimedia Commons, freely licensed) live in /public:
//   nepal-map.svg  — official New Map of Nepal (Dept. of Survey, 2020)
//   buddha.jpg     — Tian Tan Buddha, front view
//   everest.jpg    — Mount Everest seen from the air
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      {/* Official Nepal map, faint in the sky */}
      <img className="bd-map" src="/nepal-map.svg" alt="" />

      {/* Real Mount Everest photo as the foreground range */}
      <img className="bd-everest" src="/everest.jpg" alt="" />

      {/* Real Gautam Buddha photo, seated over the peaks, feathered into the scene */}
      <img className="bd-buddha" src="/buddha.jpg" alt="" />
    </div>
  )
}
