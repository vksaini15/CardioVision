import { STATE_LABELS } from "./systemStatus.js";

/** Per-subsystem status list (viewer, prediction service, ...). */
export default function SystemStatusPanel({ items }) {
  return (
    <section className="panel" aria-labelledby="system-status-title">
      <div className="panel__header">
        <h2 className="panel__title" id="system-status-title">System status</h2>
      </div>
      <ul className="status-list">
        {items.map((item) => (
          <li className="status-list__item" key={item.id}>
            <span className="status-list__name">{item.name}</span>
            <span className="status-list__state" data-state={item.state}>
              {STATE_LABELS[item.state]}
              {item.detail ? <span className="visually-hidden">: {item.detail}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
