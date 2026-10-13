
import "./LandingPage.css";

export default function LandingPage({ onGetStarted }) {
  return (
    <main className="cv-landing">
      <header className="cv-nav">
        <a className="cv-brand" href="#home" aria-label="CardioVision home">
          <span className="cv-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M16 27S4 20 4 11.5C4 5 12 3 16 10c4-7 12-5 12 1.5C28 20 16 27 16 27Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M6 16h6l3-5 4 10 3-5h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>CardioVision</span>
        </a>
        <span className="cv-nav-label">CORONARY ANALYSIS</span>
      </header>

      <section className="cv-hero" id="home">
        <div className="cv-hero-copy">
          <p className="cv-eyebrow">
            <span className="cv-status-dot" />
            CARDIOVASCULAR ANALYSIS PLATFORM
          </p>

          <h1>
            Understand the heart.
            <br />
            <span>Visualize the risk.</span>
          </h1>

          <p className="cv-description">
            Explore coronary artery predictions through an interactive
            heart visualization and an intuitive patient analysis dashboard.
          </p>

          <button
            className="cv-start-button"
            onClick={onGetStarted}
            type="button"
          >
            Get Started <span aria-hidden="true">→</span>
          </button>

          <p className="cv-disclaimer">
            A research and educational tool — not a substitute for
            professional medical advice.
          </p>
        </div>

        <div className="cv-visual" aria-label="Illustration of a heart and heartbeat">
          <div className="cv-visual-heading">
            <span>THE HUMAN HEART</span>
            <span className="cv-visual-line" />
          </div>

          <div className="cv-heart-art">
            <svg viewBox="0 0 320 320" role="img" aria-label="Minimal heart illustration">
              <defs>
                <linearGradient id="cvHeartGradient" x1="45" y1="30" x2="260" y2="290">
                  <stop offset="0%" stopColor="#e98a8a" />
                  <stop offset="100%" stopColor="#b83240" />
                </linearGradient>
              </defs>
              <path
                d="M160 272 C143 254 63 195 48 139 C33 83 88 45 130 75 C145 85 154 99 160 111 C170 83 191 65 218 65 C263 65 287 108 270 151 C252 197 188 250 160 272Z"
                fill="url(#cvHeartGradient)"
                opacity=".16"
              />
              <path
                d="M160 263 C138 242 71 190 57 145 C43 103 77 75 110 84 C135 91 148 113 160 132 C173 103 196 79 222 83 C256 87 272 119 258 153 C241 193 185 243 160 263Z"
                fill="none"
                stroke="#b83240"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M143 121 C128 103 130 77 145 54 C153 42 169 39 178 50 C187 60 179 76 174 91 L169 119 M194 91 C202 67 222 58 239 67 C253 74 249 94 235 105 L211 125 M160 130 L160 188 M160 154 L126 177 M160 179 L199 199 M126 177 L113 218 M199 199 L211 227"
                fill="none"
                stroke="#b83240"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M51 171 L101 171 L118 151 L136 191 L154 163 L174 171 L269 171"
                fill="none"
                stroke="#b83240"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity=".85"
              />
              <circle cx="160" cy="171" r="5" fill="#b83240" />
            </svg>
          </div>

          <div className="cv-visual-footer">
            <span>INSIGHT</span>
            <span>VISUALIZATION</span>
            <span>ANALYSIS</span>
          </div>
        </div>
      </section>

      <section className="cv-features" aria-label="Platform features">
        <article className="cv-feature">
          <span className="cv-feature-number">01</span>
          <div>
            <h2>Patient analysis</h2>
            <p>Enter patient measurements in one organized dashboard.</p>
          </div>
        </article>

        <article className="cv-feature">
          <span className="cv-feature-number">02</span>
          <div>
            <h2>Heart visualization</h2>
            <p>Explore the heart through an interactive 3D view.</p>
          </div>
        </article>

        <article className="cv-feature">
          <span className="cv-feature-number">03</span>
          <div>
            <h2>Coronary predictions</h2>
            <p>Review model-generated outputs for coronary arteries.</p>
          </div>
        </article>
      </section>

      <footer className="cv-footer">
        <span>CardioVision</span>
        <span>Research • Visualization • Insight</span>
        <span>Built by VK Saini</span>
      </footer>
    </main>
  );
}