// The four prediction tasks. The `id` values match the backend task keys
// (cad, lad, lcx, rca), so results can be looked up by id later.

export const PREDICTION_TARGETS = [
  {
    id: "cad",
    name: "Overall CAD risk",
    description: "Narrowing in at least one of the three main coronary arteries",
    primary: true,
  },
  { id: "lad", name: "LAD", description: "Left anterior descending artery" },
  { id: "lcx", name: "LCX", description: "Left circumflex artery" },
  { id: "rca", name: "RCA", description: "Right coronary artery" },
];
