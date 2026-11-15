const FA = "۰۱۲۳۴۵۶۷۸۹";

export function toDigits(value: string, mode: "fa" | "en"): string {
  if (mode === "en") return value;
  return value.replace(/\d/g, (d) => FA[Number(d)] ?? d);
}

export function formatNum(value: number, mode: "fa" | "en", digits = 2): string {
  const abs = Math.abs(value);
  const text = abs >= 1e6 || (abs > 0 && abs < 0.01)
    ? value.toExponential(digits)
    : value.toLocaleString("en-US", { maximumFractionDigits: digits });
  return toDigits(text, mode);
}

export function formatDate(iso: string, mode: "fa" | "en"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return toDigits(iso, mode);
  const text = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(date);
  return toDigits(text, mode);
}
