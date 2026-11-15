"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { bodies, bySlug, childrenOf, spacecraft, type Body } from "@/lib/catalog";
import { GlobeView, bodyGlobeNote } from "@/components/scene/globe-view";
import { Num } from "./num";

const KIND: Record<Body["kind"], string> = {
  star: "ستاره",
  planet: "سیاره",
  "dwarf-planet": "سیاره‌ی کوتوله",
  moon: "قمر",
  "small-body": "جرم کوچک",
};

function hrefFor(body: Body): string {
  if (body.kind === "planet") return `/planets/${body.slug}/`;
  if (body.kind === "moon") return `/moons/${body.slug}/`;
  if (body.kind === "dwarf-planet") return `/dwarf-planets/${body.slug}/`;
  if (body.kind === "small-body") return `/small-bodies/${body.slug}/`;
  return `/stars/${body.slug}/`;
}

export function BodyPage({ body }: { body: Body }) {
  const earth = bySlug(bodies, "earth");
  const parent = body.parentId ? bySlug(bodies, body.parentId) : undefined;
  const kids = childrenOf(body.id);
  const [live, setLive] = useState<string>("");

  useEffect(() => {
    if (!body.astroBody) return;
    let stop = false;
    import("astronomy-engine").then((A) => {
      if (stop) return;
      const now = new Date();
      const key = body.astroBody as keyof typeof A.Body;
      const target = A.Body[key];
      if (!target) return;
      if (target === A.Body.Earth) {
        const au = A.HelioDistance(A.Body.Earth, now);
        const km = au * A.KM_PER_AU;
        const sec = km / 299792.458;
        setLive(`فاصله تا خورشید ${km.toExponential(3)} km، نور ${Math.round(sec / 60)} دقیقه.`);
        return;
      }
      const info = A.Illumination(target, now);
      const km = info.geo_dist * A.KM_PER_AU;
      const sunKm = info.helio_dist * A.KM_PER_AU;
      const sec = km / 299792.458;
      const phase = target === A.Body.Moon || target === A.Body.Mercury || target === A.Body.Venus ? ` فاز ${(info.phase_fraction * 100).toFixed(1)}٪.` : "";
      setLive(`همین حالا تا زمین ${km.toExponential(3)} km (نور ${sec < 120 ? sec.toFixed(1) + " ثانیه" : Math.round(sec / 60) + " دقیقه"}) و تا خورشید ${sunKm.toExponential(3)} km.${phase}`);
    });
    return () => { stop = true; };
  }, [body.astroBody]);

  const rows: { label: string; value: number; unit: string; digits?: number }[] = [];
  if (body.radiusKm) rows.push({ label: "شعاع میانگین", value: body.radiusKm, unit: "km", digits: 1 });
  if (body.massKg) rows.push({ label: "جرم", value: body.massKg, unit: "kg", digits: 4 });
  if (body.densityKgM3) rows.push({ label: "چگالی", value: body.densityKgM3, unit: "kg/m³", digits: 0 });
  if (body.gravityMs2) rows.push({ label: "گرانش سطحی", value: body.gravityMs2, unit: "m/s²" });
  if (body.escapeKms) rows.push({ label: "سرعت گریز", value: body.escapeKms, unit: "km/s" });
  if (body.rotationHours) rows.push({ label: "دوره‌ی چرخش", value: body.rotationHours, unit: "h" });
  if (body.axialTiltDeg !== undefined) rows.push({ label: "انحراف محور", value: body.axialTiltDeg, unit: "°" });
  if (body.orbitalPeriodDays) rows.push({ label: "دوره‌ی گردش", value: body.orbitalPeriodDays, unit: "day" });
  if (body.semiMajorAxisKm) rows.push({ label: "نیم‌قطر میانگین", value: body.semiMajorAxisKm, unit: "km", digits: 0 });
  if (body.eccentricity !== undefined) rows.push({ label: "خروج از مرکز", value: body.eccentricity, unit: "", digits: 4 });
  if (body.moonCount !== undefined) rows.push({ label: "شمار قمرها", value: body.moonCount, unit: "", digits: 0 });
  if (body.blackBodyK) rows.push({ label: "دمای جسم سیاه", value: body.blackBodyK, unit: "K" });
  if (body.meanTempK) rows.push({ label: "دما", value: body.meanTempK, unit: "K" });

  return (
    <article className="page">
      <p className="meta">{KIND[body.kind]}{parent ? ` · ${parent.nameFa}` : ""}</p>
      <h1>{body.nameFa}</h1>
      <p className="lede"><span className="ltr">{body.nameEn}</span></p>
      <GlobeView
        texture={body.texture}
        night={body.nightTexture}
        clouds={body.cloudTexture}
        ring={body.slug === "saturn" ? "saturn" : body.ring ? "faint" : undefined}
        tilt={body.axialTiltDeg}
        spinHours={body.rotationHours}
        color={bodyGlobeNote(body.slug, body.texture).color ?? (body.slug === "sun" ? "#ffd27a" : undefined)}
        emissive={body.slug === "sun"}
        axes={body.radiusAxesKm}
        note={bodyGlobeNote(body.slug, body.texture).note}
      />
      <p>{body.summaryFa}</p>
      {body.tempNoteFa && <p className="note">{body.tempNoteFa}</p>}
      {live && <p><bdi className="num">{live}</bdi></p>}
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}><th>{row.label}</th><td><Num value={row.value} digits={row.digits ?? 2} unit={row.unit} /></td></tr>
          ))}
          {body.radiusAxesKm && <tr><th>نیم‌محورها</th><td className="num">{body.radiusAxesKm.join(" × ")} km</td></tr>}
        </tbody>
      </table>
      {earth?.radiusKm && body.radiusKm && body.id !== "earth" && (
        <p>نسبت شعاع به زمین: <Num value={body.radiusKm / earth.radiusKm} digits={3} /></p>
      )}
      {earth?.massKg && body.massKg && body.id !== "earth" && (
        <p>نسبت جرم به زمین: <Num value={body.massKg / earth.massKg} digits={4} /></p>
      )}
      {earth?.gravityMs2 && body.gravityMs2 && body.id !== "earth" && (
        <p>نسبت گرانش به زمین: <Num value={body.gravityMs2 / earth.gravityMs2} digits={3} /></p>
      )}
      {body.atmosphereFa && <p>{body.atmosphereFa}</p>}
      {body.weatherFa && <p>{body.weatherFa}</p>}
      {body.historyFa && <p>{body.historyFa}</p>}
      {body.interior && body.interior.length > 0 && (
        <section>
          <h2>ساختار</h2>
          {body.interior.map((layer) => <p key={layer.nameEn}>{layer.nameFa} <span className="ltr">{layer.nameEn}</span>{layer.noteFa ? ` — ${layer.noteFa}` : ""}</p>)}
        </section>
      )}
      {body.sites && body.sites.length > 0 && (
        <section>
          <h2>نقاط سطح</h2>
          {body.sites.map((site) => <p key={site.nameEn}>{site.nameFa} (<Num value={site.lat} digits={3} />°, <Num value={site.lon} digits={3} />°) — {site.summaryFa}</p>)}
        </section>
      )}
      {kids.length > 0 && (
        <section>
          <h2>قمرها</h2>
          <div className="grid cards">
            {kids.map((kid) => <Link key={kid.id} className="card" href={hrefFor(kid)}><h3>{kid.nameFa}</h3><p className="meta ltr">{kid.nameEn}</p></Link>)}
          </div>
        </section>
      )}
      {body.visitors && (
        <section>
          <h2>بازدیدکننده‌ها</h2>
          {body.visitors.map((id) => {
            const craft = bySlug(spacecraft, id);
            return craft ? <p key={id}><Link href={`/spacecraft/${craft.slug}/`}>{craft.nameFa}</Link></p> : null;
          })}
        </section>
      )}
      <h2>منبع</h2>
      <ul>
        {body.sources.map((source) => <li key={source.url}><a href={source.url}>{source.name}</a>{source.retrieved ? <span className="meta"> · {source.retrieved}</span> : null}</li>)}
      </ul>
      <p><Link href="/compare/">مقایسه</Link></p>
    </article>
  );
}

export function BodyRoute({ slug, kind }: { slug: string; kind: Body["kind"] }) {
  const body = bodies.find((item) => item.slug === slug && item.kind === kind);
  if (!body) return <p className="page">این صفحه در داده‌ها نیست.</p>;
  return <BodyPage body={body} />;
}
