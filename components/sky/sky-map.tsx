"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cities, constellations, deepsky, stars } from "@/lib/catalog";
import { asset } from "@/lib/paths";

type Point = [number, number, number, number | null];

function starColor(bv: number | null, red: boolean): string {
  if (red) return "#ffb0b0";
  if (bv == null) return "#fff4e6";
  if (bv < 0) return "#c9d7ff";
  if (bv < 0.4) return "#fff4e6";
  if (bv < 0.8) return "#ffe2b0";
  return "#ffb07a";
}

export function SkyMap() {
  const [city, setCity] = useState(cities[0]?.id ?? "tehran");
  const [when, setWhen] = useState("");
  const [red, setRed] = useState(false);
  const [names, setNames] = useState(true);
  const [found, setFound] = useState("");
  const [list, setList] = useState<string[]>([]);
  const [compass, setCompass] = useState<number | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const canvas = document.getElementById("sky-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    let dead = false;
    let timer = 0;
    const paint = async () => {
      const A = await import("astronomy-engine");
      const response = await fetch(asset("/sky/stars.json"));
      const points = (await response.json()) as Point[];
      if (dead) return;
      const g = canvas.getContext("2d");
      if (!g) return;
      const place = cities.find((item) => item.id === city) ?? cities[0];
      const date = when ? new Date(when) : new Date();
      const observer = new A.Observer(place.lat, place.lon, 0);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.fillStyle = red ? "#140606" : "#07050f";
      g.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;
      const rot = ((compass ?? 0) * Math.PI) / 180;
      const project = (az: number, alt: number) => {
        const z = (90 - alt) / 90;
        const a = (az * Math.PI) / 180 - rot;
        return { x: cx + Math.sin(a) * z * radius, y: cy - Math.cos(a) * z * radius, up: alt > 0 };
      };
      g.strokeStyle = red ? "#5a2020" : "rgba(201,167,255,0.35)";
      g.beginPath();
      g.arc(cx, cy, radius, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = red ? "#ffb4b4" : "#f4eef8";
      g.font = "16px Vazirmatn, Tahoma, sans-serif";
      g.textAlign = "center";
      ["N", "E", "S", "W"].forEach((label, i) => {
        const p = project(i * 90, 2);
        g.fillText(label, p.x, p.y);
      });
      g.strokeStyle = red ? "rgba(255,160,160,0.35)" : "rgba(201,167,255,0.4)";
      if (names) {
        for (const con of constellations) {
          g.beginPath();
          for (const line of con.lines) {
            let started = false;
            for (const pair of line) {
              const hor = A.Horizon(date, observer, pair[0] / 15, pair[1], "normal");
              const p = project(hor.azimuth, hor.altitude);
              if (!p.up) { started = false; continue; }
              if (!started) { g.moveTo(p.x, p.y); started = true; }
              else g.lineTo(p.x, p.y);
            }
          }
          g.stroke();
        }
      }
      for (const point of points) {
        const hor = A.Horizon(date, observer, point[0] / 15, point[1], "normal");
        const p = project(hor.azimuth, hor.altitude);
        if (!p.up) continue;
        const size = Math.max(0.6, 3.1 - point[2] * 0.4);
        g.fillStyle = starColor(point[3], red);
        g.globalAlpha = Math.max(0.28, 1 - point[2] / 7.2);
        g.beginPath();
        g.arc(p.x, p.y, size, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
      const visible: string[] = [];
      const query = found.trim();
      for (const star of stars) {
        const hor = A.Horizon(date, observer, star.raDeg / 15, star.decDeg, "normal");
        const p = project(hor.azimuth, hor.altitude);
        const label = `${star.nameFa} ${star.nameEn} ${star.traditionalFa ?? ""}`;
        if (query && label.toLowerCase().includes(query.toLowerCase()) && p.up) {
          g.strokeStyle = "#ff8fc2";
          g.strokeRect(p.x - 10, p.y - 10, 20, 20);
          g.fillStyle = "#ffd27a";
          g.fillText(star.nameFa, p.x, p.y - 14);
        } else if (names && p.up && star.mag < 1.2) {
          g.fillStyle = red ? "#ffb4b4" : "#f4eef8";
          g.fillText(star.nameFa, p.x, p.y - 10);
        }
        if (hor.altitude > 10) visible.push(`${star.nameFa}  ارتفاع ${hor.altitude.toFixed(0)}°`);
      }
      const bodies = [A.Body.Sun, A.Body.Moon, A.Body.Mercury, A.Body.Venus, A.Body.Mars, A.Body.Jupiter, A.Body.Saturn];
      const labels: Record<string, string> = { Sun: "خورشید", Moon: "ماه", Mercury: "تیر", Venus: "ناهید", Mars: "بهرام", Jupiter: "مشتری", Saturn: "زحل" };
      for (const body of bodies) {
        const eq = A.Equator(body, date, observer, true, true);
        const hor = A.Horizon(date, observer, eq.ra, eq.dec, "normal");
        const p = project(hor.azimuth, hor.altitude);
        if (p.up) {
          g.fillStyle = body === A.Body.Sun ? "#ffd27a" : "#f4eef8";
          g.beginPath();
          g.arc(p.x, p.y, body === A.Body.Sun || body === A.Body.Moon ? 5 : 3.2, 0, Math.PI * 2);
          g.fill();
          if (names) g.fillText(labels[body] ?? body, p.x, p.y - 8);
          visible.push(`${labels[body] ?? body}  ارتفاع ${hor.altitude.toFixed(0)}°`);
        }
        if (body === A.Body.Sun || body === A.Body.Moon) {
          const rise = A.SearchRiseSet(body, observer, +1, date, 1);
          const set = A.SearchRiseSet(body, observer, -1, date, 1);
          if (rise) visible.push(`${labels[body]} طلوع ${rise.date.toISOString().slice(11, 16)} UTC`);
          if (set) visible.push(`${labels[body]} غروب ${set.date.toISOString().slice(11, 16)} UTC`);
        }
      }
      for (const obj of deepsky) {
        const hor = A.Horizon(date, observer, obj.raDeg / 15, obj.decDeg, "normal");
        if (hor.altitude > 15 && (obj.mag == null || obj.mag < 7)) visible.push(`${obj.nameFa} بالای افق`);
        if (query && `${obj.nameFa} ${obj.nameEn}`.toLowerCase().includes(query.toLowerCase())) {
          const p = project(hor.azimuth, hor.altitude);
          if (p.up) {
            g.strokeStyle = "#ffd27a";
            g.strokeRect(p.x - 8, p.y - 8, 16, 16);
            g.fillText(obj.nameFa, p.x, p.y - 12);
          }
        }
      }
      setList(visible.slice(0, 16));
    };
    paint();
    if (!when) timer = window.setInterval(paint, 60000);
    return () => { dead = true; window.clearInterval(timer); };
  }, [city, when, red, names, found, compass]);

  const enableCompass = async () => {
    const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    if (typeof orientation.requestPermission === "function") {
      const result = await orientation.requestPermission();
      if (result !== "granted") { setNote("اجازه داده نشد."); return; }
    }
    const onOrient = (event: DeviceOrientationEvent) => {
      if (event.alpha != null) setCompass(event.alpha);
    };
    window.addEventListener("deviceorientation", onOrient);
    setNote("جهت دستگاه، اگر حسگر بدهد، نقشه‌ را می‌چرخاند.");
  };

  return (
    <div className="page">
      <h1>آسمان</h1>
      <p className="lede">سمت و ارتفاع با astronomy-engine. ستاره‌ها از کاتالوگ HYG در d3-celestial هستند، تا قدر ۶٫۵، بدون تصحیح حرکت تقدیمی. مختصات شهرها تا حدود یک صدم درجه گرد شده.</p>
      <div className="timebar" style={{ position: "static" }}>
        <select value={city} onChange={(e) => setCity(e.target.value)}>{cities.map((item) => <option key={item.id} value={item.id}>{item.nameFa}</option>)}</select>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        <button className="btn" type="button" onClick={() => setWhen("")}>اکنون</button>
        <button className="btn" type="button" onClick={() => setRed((v) => !v)}>{red ? "شب قرمز" : "رنگ عادی"}</button>
        <button className="btn" type="button" onClick={() => setNames((v) => !v)}>{names ? "خطوط روشن" : "خطوط خاموش"}</button>
        <button className="btn" type="button" onClick={enableCompass}>قطب‌نما</button>
        <input type="search" placeholder="پیدا کن" value={found} onChange={(e) => setFound(e.target.value)} />
      </div>
      {note && <p className="meta">{note}</p>}
      <canvas id="sky-canvas" style={{ width: "100%", height: "70dvh", borderRadius: 12, border: "1px solid var(--line)" }} />
      <h2>امشب چه چیزهایی بالای افق‌اند</h2>
      <ul>{list.map((item) => <li key={item} className="num">{item}</li>)}</ul>
      <p><Link href="/stars/life/">چرخه‌ی عمر ستاره</Link></p>
      <h2>ستاره‌های نام‌دار</h2>
      <div className="grid cards">
        {stars.map((star) => <Link key={star.id} className="card" href={`/stars/${star.slug}/`}><h3>{star.nameFa}</h3><p className="meta ltr">{star.nameEn}</p></Link>)}
      </div>
    </div>
  );
}
