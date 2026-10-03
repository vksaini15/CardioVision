import { STATE_LABELS } from "./systemStatus.js";

/**
 * Headline system status (shown in the header).
 * `state` is one of: standby | loading | ready | error.
 * role="status" makes screen readers announce changes politely.
 */
export default function StatusIndicator({ state, detail }) {
  return (
    <div className="status" data-state={state} role="status" aria-live="polite">
      <span className="status__dot" aria-hidden="true" />
      <span className="status__label">{STATE_LABELS[state]}</span>
      {detail ? <span className="status__detail">{detail}</span> : null}
    </div>
  );
}
