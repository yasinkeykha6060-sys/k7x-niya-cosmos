export function siteBase(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
}

export function asset(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteBase()}${clean}`;
}
