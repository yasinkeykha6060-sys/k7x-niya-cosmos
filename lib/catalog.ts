import { z } from "zod";
import bodiesJson from "@/data/bodies.json";
import craftJson from "@/data/spacecraft.json";
import starsJson from "@/data/stars.json";
import systemsJson from "@/data/systems.json";
import exoJson from "@/data/exoplanets.json";
import timelineJson from "@/data/timeline.json";
import glossaryJson from "@/data/glossary.json";
import citiesJson from "@/data/cities.json";
import constellationsJson from "@/data/constellations.json";
import deepskyJson from "@/data/deepsky.json";
import personalJson from "@/data/personal.json";
import { bodySchema, craftSchema, exoSchema, starSchema, systemSchema, type Body, type Craft, type Exoplanet, type Star, type SystemRec } from "./schema";

export type { Body, Craft, Star };

function parse<T>(name: string, schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`${name}: ${result.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  }
  return result.data;
}

export const bodies: Body[] = parse("bodies", z.array(bodySchema), bodiesJson);
export const spacecraft: Craft[] = parse("spacecraft", z.array(craftSchema), craftJson);
export const stars: Star[] = parse("stars", z.array(starSchema), starsJson);
export const systems: SystemRec[] = parse("systems", z.array(systemSchema), systemsJson);
export const exoplanets: Exoplanet[] = parse("exoplanets", z.array(exoSchema), exoJson);

export const timeline = timelineJson as { year: string; titleFa: string; titleEn: string; org: string; kind: string; summaryFa: string; slug?: string }[];
export const glossary = glossaryJson as { slug: string; nameFa: string; nameEn: string; summaryFa: string }[];
export const cities = citiesJson as { id: string; nameFa: string; nameEn: string; lat: number; lon: number }[];
export const constellations = constellationsJson as { id: string; nameEn: string; nameFa: string; lines: number[][][] }[];
export const deepsky = deepskyJson as { id: string; nameEn: string; nameFa: string; raDeg: number; decDeg: number; mag?: number; kind: string; summaryFa: string }[];
export const personal = personalJson;

const ids = new Set<string>();
for (const item of [...bodies, ...spacecraft, ...stars, ...systems, ...exoplanets]) {
  if (ids.has(item.id)) throw new Error(`duplicate id ${item.id}`);
  ids.add(item.id);
}

export function bySlug<T extends { slug: string }>(list: T[], slug: string): T | undefined {
  return list.find((item) => item.slug === slug);
}

export function childrenOf(id: string): Body[] {
  return bodies.filter((body) => body.parentId === id);
}

export type SearchHit = { href: string; title: string; en: string; kind: string };

export function searchIndex(): SearchHit[] {
  const hits: SearchHit[] = [
    { href: "/yasin-niyayesh/", title: "یاسین", en: "Yasin YN-001", kind: "شخصی" },
    { href: "/yasin-niyayesh/", title: "نیایش", en: "Niyayesh", kind: "شخصی" },
    { href: "/yasin-niyayesh/", title: "YN-001", en: "YN-001 b", kind: "شخصی" },
    { href: "/yasin-niyayesh/", title: "نیایا", en: "Niaya YN-001 c", kind: "شخصی" },
    { href: "/simulator/", title: "شبیه‌ساز", en: "simulator", kind: "ابزار" },
    { href: "/catalog/", title: "آلبوم", en: "catalog planets stars", kind: "فهرست" },
  ];
  for (const body of bodies) {
    const root = body.kind === "planet" ? "planets" : body.kind === "moon" ? "moons" : body.kind === "dwarf-planet" ? "dwarf-planets" : body.kind === "small-body" ? "small-bodies" : "stars";
    const href = body.kind === "star" && !stars.some((star) => star.slug === body.slug) ? "/solar-system/" : `/${root}/${body.slug}/`;
    hits.push({ href, title: body.nameFa, en: body.nameEn, kind: body.kind });
  }
  for (const craft of spacecraft) hits.push({ href: `/spacecraft/${craft.slug}/`, title: craft.nameFa, en: craft.nameEn, kind: "spacecraft" });
  for (const star of stars) {
    if (!star.page) continue;
    hits.push({ href: `/stars/${star.slug}/`, title: star.nameFa, en: `${star.nameEn} ${star.traditionalFa ?? ""}`.trim(), kind: "star" });
  }
  for (const con of constellations) hits.push({ href: "/sky/", title: con.nameFa, en: con.nameEn, kind: "constellation" });
  for (const obj of deepsky) hits.push({ href: "/sky/", title: obj.nameFa, en: obj.nameEn, kind: "deepsky" });
  for (const system of systems) hits.push({ href: `/systems/${system.slug}/`, title: system.nameFa, en: system.nameEn, kind: "system" });
  for (const exo of exoplanets) hits.push({ href: `/exoplanets/${exo.slug}/`, title: exo.nameFa, en: exo.nameEn, kind: "exoplanet" });
  for (const term of glossary) hits.push({ href: `/glossary/#${term.slug}`, title: term.nameFa, en: term.nameEn, kind: "glossary" });
  return hits;
}
