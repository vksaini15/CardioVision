const MODEL_METRICS = [
  {
    id: "cad",
    name: "Overall CAD",
    accuracy: 85.25,
    precision: 88.64,
    recall: 90.70,
    f1: 89.66,
    rocAuc: 87.60,
  },
  {
    id: "lad",
    name: "LAD",
    accuracy: 78.69,
    precision: 79.49,
    recall: 86.11,
    f1: 82.67,
    rocAuc: 84.33,
  },
  {
    id: "lcx",
    name: "LCX",
    accuracy: 63.93,
    precision: 54.17,
    recall: 54.17,
    f1: 54.17,
    rocAuc: 73.42,
  },
  {
    id: "rca",
    name: "RCA",
    accuracy: 67.21,
    precision: 55.56,
    recall: 65.22,
    f1: 60.00,
    rocAuc: 73.57,
  },
];

function Metric({ label, value }) {
  return (
    <div className="model-performance__metric">
      <span>{label}</span>
      <strong>{value.toFixed(1)}%</strong>
    </div>
  );
}

export default function ModelPerformance() {
  return (
    <section
      className="panel model-performance"
      aria-labelledby="model-performance-title"
    >
      <div className="panel__header">
        <div>
          <h2 className="panel__title" id="model-performance-title">
            Model Performance
          </h2>
          <p className="panel__hint">
            Held-out test-set evaluation
          </p>
        </div>
      </div>

      <div className="model-performance__list">
        {MODEL_METRICS.map((model) => (
          <article className="model-performance__card" key={model.id}>
            <div className="model-performance__name">
              {model.name}
            </div>

            <div className="model-performance__metrics">
              <Metric label="Accuracy" value={model.accuracy} />
              <Metric label="Precision" value={model.precision} />
              <Metric label="Recall" value={model.recall} />
              <Metric label="F1" value={model.f1} />
              <Metric label="ROC-AUC" value={model.rocAuc} />
            </div>
          </article>
        ))}
      </div>

      <p className="model-performance__note">
        Metrics are dataset-specific evaluation results and should not be
        interpreted as clinical validation.
      </p>
    </section>
  );
}