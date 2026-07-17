// Lookup helpers over the boycott dataset. Pure functions, no I/O.

import { COMPANIES } from "@/lib/boycott-data";

const norm = (s = "") => s.toLowerCase().trim().replace(/\s+/g, " ");

// Free-text search across company names, brands, and categories.
export function searchCompanies(query) {
  const q = norm(query);
  if (!q) return COMPANIES;
  return COMPANIES.filter((c) => {
    const haystack = norm([c.name, c.category, ...(c.brands || [])].join(" "));
    return haystack.includes(q);
  });
}

export function getCompanyBySlug(slug) {
  return COMPANIES.find((c) => c.slug === slug) || null;
}
