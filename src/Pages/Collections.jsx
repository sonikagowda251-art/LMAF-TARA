
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SEASONS } from "../utils/data";

const covers = {
  Winter: "photo-1544923246-77307dd654cb",
  Summer: "photo-1503342217505-b0a15ec3261c",
  Rainy: "photo-1515886657613-9f3515b0c78f",
  Spring: "photo-1490481651871-ab68de25d43d",
};

const blurb = {
  Winter: "Wools, knits & insulated layers built for the cold.",
  Summer: "Breathable cottons, linen & light silhouettes.",
  Rainy: "Water-resistant shells, trench coats & quick-dry wear.",
  Spring: "Fresh pastels, denim jackets & easy layering.",
};

export default function Collections() {
  return (
    <div className="pm-collections fk-page">
      <header className="pm-collections-head">
        <p className="pm-kicker">The Four Seasons</p>
        <h1 className="pm-serif">Collections</h1>
        <p>Premium clothing, curated for every chapter of the year.</p>
      </header>

      <div className="pm-collections-grid">
        {SEASONS.map((s) => (
          <Link
            key={s.name}
            to={`/search?department=${encodeURIComponent(s.name)}`}
            className="pm-collection-card"
            style={{
              backgroundImage: `url(https://images.unsplash.com/${covers[s.name]}?w=900&q=75&auto=format&fit=crop)`,
            }}
          >
            <div className="pm-cat-grad" />
            <div className="pm-collection-text">
              <span className="pm-collection-icon">{s.icon}</span>
              <h2>{s.name}</h2>
              <p>{blurb[s.name]}</p>
              <span className="pm-collection-link">
                Shop {s.name} <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
