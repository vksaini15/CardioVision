import React from "react";
import HeartScene from "./HeartScene.jsx";

class ViewerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="viewer__placeholder" role="status" aria-live="polite">
          <div className="viewer__placeholder-title">3D heart model could not be loaded.</div>
          <div className="viewer__placeholder-text">
            The rest of the CardioVision dashboard remains available. The 3D viewer failed safely.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ViewerPanel({ results = {} }) {
  return (
    <section className="panel viewer dashboard__viewer" aria-labelledby="viewer-title">
      <div className="viewer__bar">
        <h2 className="panel__title" id="viewer-title">
          3D heart view
        </h2>
        <p className="panel__hint">
          Interactive anatomical model · rotate · zoom · pan
        </p>
      </div>

      <div className="viewer__stage">
        <span className="viewer__corner viewer__corner--tl" aria-hidden="true" />
        <span className="viewer__corner viewer__corner--tr" aria-hidden="true" />
        <span className="viewer__corner viewer__corner--bl" aria-hidden="true" />
        <span className="viewer__corner viewer__corner--br" aria-hidden="true" />

        <ViewerErrorBoundary>
          <HeartScene results={results} />
        </ViewerErrorBoundary>
      </div>
    </section>
  );
}

export default ViewerPanel;
