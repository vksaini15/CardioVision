// Main visualization area.
//
// HOW TO ADD THE 3D HEART LATER
// Pass your viewer as children from App.jsx, for example:
//
//     <ViewerPanel>
//       <HeartScene />          // contains <Canvas> from @react-three/fiber
//     </ViewerPanel>
//
// The slot below fills the whole stage (position: absolute; inset: 0), so a
// <Canvas> with width/height 100% will fit. Until children are provided, an
// honest placeholder is shown. No model or result is faked here.

function PlaceholderIcon() {
  // Wireframe cube: a generic "3D scene" symbol, not a heart.
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <path
        d="M28 6 48 17v22L28 50 8 39V17L28 6Z M8 17l20 11 20-11 M28 28v22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ViewerPlaceholder() {
  return (
    <div className="viewer__placeholder">
      <span style={{ color: "var(--cv-accent)" }}>
        <PlaceholderIcon />
      </span>
      <p className="viewer__placeholder-title">3D heart view not loaded</p>
      <p className="viewer__placeholder-text">
        The interactive 3D heart will appear here. No model is loaded and no patient results are shown.
      </p>
    </div>
  );
}

export default function ViewerPanel({ children }) {
  return (
    <section className="panel viewer dashboard__viewer" aria-labelledby="viewer-title">
      <div className="viewer__bar">
        <h2 className="panel__title" id="viewer-title">3D heart view</h2>
        <p className="panel__hint">Interactive view coming soon</p>
      </div>
      <div className="viewer__stage">
        <span className="viewer__corner viewer__corner--tl" aria-hidden="true" />
        <span className="viewer__corner viewer__corner--tr" aria-hidden="true" />
        <span className="viewer__corner viewer__corner--bl" aria-hidden="true" />
        <span className="viewer__corner viewer__corner--br" aria-hidden="true" />
        <div data-viewer-slot>{children ?? <ViewerPlaceholder />}</div>
      </div>
    </section>
  );
}
