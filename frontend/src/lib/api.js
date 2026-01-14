const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchTools() {
  const res = await fetch(`${API_BASE_URL}/api/tools`);
  if (!res.ok) throw new Error("Failed to fetch tools");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE_URL}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}
