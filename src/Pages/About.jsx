
import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="about-page">
      <section className="page-heading">
        <p className="eyebrow">OUR BRAND • OUR STORY</p>
        <h1>About LMAF TARA</h1>
        <p>Style • Elegance • You</p>
      </section>

      <section className="about-content">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000"
            alt="Fashion collection from LMAF TARA"
          />
        </div>

        <div className="about-text">
          <p className="eyebrow">WELCOME TO OUR WORLD</p>
          <h2>Fashion that feels like you.</h2>
          <p>
            LMAF TARA is a clothing brand concept created for people who
            want to express themselves through their personal style.
          </p>
          <p>
            Our vision is to bring together timeless essentials,
            contemporary trends, and versatile styles for different
            occasions and everyday moments.
          </p>
          <p>
            We believe fashion is more than clothing. It is confidence,
            individuality, and the freedom to express who you are.
          </p>
          <Link to="/shop" className="btn btn-dark">
            Explore Our Collection
          </Link>
        </div>
      </section>

      <section className="about-values">
        <div>
          <h3>Our Vision</h3>
          <p>To make personal style feel effortless and inspiring.</p>
        </div>
        <div>
          <h3>Our Mission</h3>
          <p>To offer versatile fashion for different tastes and moments.</p>
        </div>
        <div>
          <h3>Our Promise</h3>
          <p>To build a shopping experience centred on style and simplicity.</p>
        </div>
      </section>
    </main>
  );
}
