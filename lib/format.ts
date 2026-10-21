export type Prof = { id: string; first_name: string | null; last_name: string | null };

export const displayName = (p?: Prof) =>
  p ? [p.first_name, p.last_name].filter(Boolean).join(" ") || p.id.slice(0, 8) : "unknown";

export const fmtDate = (s: string) => new Date(s).toLocaleDateString();