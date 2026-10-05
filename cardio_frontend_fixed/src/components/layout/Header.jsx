import StatusIndicator from "../status/StatusIndicator.jsx";

// Simple original mark: a ring with a pulse line. It is a logo, not a heart model.
function BrandMark() {
  return (
    <svg className="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 21h8l3-7 5 14 3-7h9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header({ status }) {
  return (
    <header className="app-header">
      <div className="brand">
        <BrandMark />
        <div>
          <h1 className="brand__title">CardioVision</h1>
          <p className="brand__subtitle">Cardiovascular Risk Visualization &amp; Prediction</p>
        </div>
      </div>
      <StatusIndicator state={status.state} detail={status.detail} />
    </header>
  );
}
