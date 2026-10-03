// System status model. One vocabulary is used everywhere in the UI:
//   "standby" -> waiting / not connected     "loading" -> work in progress
//   "ready"   -> working                      "error"   -> failed
//
// Nothing is connected yet, so every subsystem starts on "standby".
// When the 3D viewer and the prediction API exist, replace this list with
// real state (for example from a hook) and the whole UI updates.

export const STATE_LABELS = {
  standby: "Standby",
  loading: "Loading",
  ready: "Ready",
  error: "Error",
};

export const INITIAL_SYSTEM_STATUS = [
  { id: "viewer", name: "3D heart viewer", state: "standby", detail: "Not loaded" },
  { id: "predictions", name: "Prediction service", state: "standby", detail: "Not connected" },
];

/** Collapse the per-subsystem states into one headline state for the header. */
export function summarizeStatus(items) {
  const pick = (state) => items.filter((item) => item.state === state);
  const names = (list) => list.map((item) => item.name.toLowerCase().replace("3d", "3D")).join(" and ");

  if (pick("error").length) {
    return { state: "error", detail: `${names(pick("error"))} unavailable` };
  }
  if (pick("loading").length) {
    return { state: "loading", detail: `Loading ${names(pick("loading"))}` };
  }
  if (pick("standby").length) {
    return { state: "standby", detail: `Waiting for ${names(pick("standby"))}` };
  }
  return { state: "ready", detail: "All systems ready" };
}
