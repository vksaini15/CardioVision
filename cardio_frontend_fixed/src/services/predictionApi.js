const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON response.
  }

  if (!response.ok) {
    const message =
      body?.detail ||
      body?.message ||
      `Request failed with HTTP ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export async function checkHealth() {
  return request("/health", { method: "GET" });
}

export async function predictPatient(features) {
  return request("/api/predict", {
    method: "POST",
    body: JSON.stringify(features),
  });
}


export async function explainPatient(target, features) {
  return request("/api/explain", {
    method: "POST",
    body: JSON.stringify({ target, features }),
  });
}
