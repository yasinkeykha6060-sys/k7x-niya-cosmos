"use client";

import { formatNum } from "@/lib/format";
import { usePrefs } from "./prefs";

export function Num({ value, digits = 2, unit }: { value: number; digits?: number; unit?: string }) {
  const { digits: mode } = usePrefs();
  return (
    <bdi className="num" dir="ltr">
      {formatNum(value, mode, digits)}
      {unit ? ` ${unit}` : ""}
    </bdi>
  );
}
