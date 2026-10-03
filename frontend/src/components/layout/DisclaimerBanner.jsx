export const DISCLAIMER_TEXT =
  "Educational and decision-support tool. Not a substitute for formal diagnostic imaging or professional medical evaluation.";

export default function DisclaimerBanner() {
  return (
    <div className="disclaimer" role="note" aria-label="Medical disclaimer">
      <svg className="disclaimer__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 5.5v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="10" cy="14" r="1" fill="currentColor" />
      </svg>
      <p className="disclaimer__text">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
