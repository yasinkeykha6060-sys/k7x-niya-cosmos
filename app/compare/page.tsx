"use client";

import { useMemo, useState } from "react";
import { bodies } from "@/lib/catalog";
import { Num } from "@/components/ui/num";

export default function Page() {
  const options = bodies.filter((body) => body.radiusKm);
  const [a, setA] = useState(options[2]?.slug ?? "earth");
  const [b, setB] = useState(options[0]?.slug ?? "mercury");
  const [c, setC] = useState("");
  const picked = useMemo(() => [a, b, c].map((slug) => options.find((body) => body.slug === slug)).filter(Boolean), [a, b, c, options]);
  const max = Math.max(...picked.map((body) => body?.radiusKm ?? 1));
  return (
    <div className="page">
      <h1>مقایسه</h1>
      <div className="timebar" style={{ position: "static" }}>
        {[a, b, c].map((value, index) => (
          <select key={index} value={value} onChange={(e) => [setA, setB, setC][index](e.target.value)}>
            <option value="">—</option>
            {options.map((body) => <option key={body.slug} value={body.slug}>{body.nameFa}</option>)}
          </select>
        ))}
      </div>
      <div className="bars">
        {picked.map((body) => body && (
          <div key={body.id}>
            <div className="bar" style={{ height: `${(body.radiusKm! / max) * 160}px` }} />
            <div>{body.nameFa}</div>
          </div>
        ))}
      </div>
      <table>
        <thead><tr><th>ویژگی</th>{picked.map((body) => body && <th key={body.id}>{body.nameFa}</th>)}</tr></thead>
        <tbody>
          {(["radiusKm", "massKg", "gravityMs2", "blackBodyK"] as const).map((key) => (
            <tr key={key}>
              <th>{key}</th>
              {picked.map((body) => <td key={body?.id}>{body && typeof body[key] === "number" ? <Num value={body[key] as number} digits={3} /> : "—"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
