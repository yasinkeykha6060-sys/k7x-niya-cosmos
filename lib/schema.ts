import { z } from "zod";

export const sourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  retrieved: z.string().min(4).optional(),
});

export const bodySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  kind: z.enum(["star", "planet", "dwarf-planet", "moon", "small-body"]),
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  summaryFa: z.string().min(1),
  parentId: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  historyFa: z.string().optional(),
  weatherFa: z.string().optional(),
  radiusKm: z.number().positive().optional(),
  radiusAxesKm: z.tuple([z.number(), z.number(), z.number()]).optional(),
  massKg: z.number().positive().optional(),
  densityKgM3: z.number().positive().optional(),
  gravityMs2: z.number().positive().optional(),
  escapeKms: z.number().positive().optional(),
  rotationHours: z.number().optional(),
  axialTiltDeg: z.number().optional(),
  orbitalPeriodDays: z.number().positive().optional(),
  semiMajorAxisKm: z.number().positive().optional(),
  eccentricity: z.number().min(0).optional(),
  inclinationDeg: z.number().optional(),
  moonCount: z.number().int().nonnegative().optional(),
  blackBodyK: z.number().positive().optional(),
  meanTempK: z.number().positive().optional(),
  tempMinK: z.number().optional(),
  tempMaxK: z.number().optional(),
  tempNoteFa: z.string().optional(),
  pressureBar: z.number().nonnegative().optional(),
  atmosphereFa: z.string().optional(),
  interior: z.array(z.object({ nameFa: z.string(), nameEn: z.string(), noteFa: z.string().optional() })).optional(),
  sites: z.array(z.object({
    nameFa: z.string(), nameEn: z.string(), lat: z.number(), lon: z.number(), summaryFa: z.string(), source: sourceSchema,
  })).optional(),
  visitors: z.array(z.string()).optional(),
  texture: z.string().optional(),
  nightTexture: z.string().optional(),
  cloudTexture: z.string().optional(),
  ring: z.boolean().optional(),
  astroBody: z.string().optional(),
  sources: z.array(sourceSchema).min(1),
});

export const craftSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  category: z.enum(["launcher", "station", "crew", "probe", "mars", "telescope"]),
  agency: z.string().min(1),
  summaryFa: z.string().min(1),
  missionFa: z.string().min(1),
  launchDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["active", "ended", "testing"]),
  statusAsOf: z.string().min(4),
  heightM: z.number().positive().optional(),
  achievements: z.array(z.string()).min(1),
  animation: z.enum(["ascent", "landing", "flybys"]).optional(),
  targets: z.array(z.string()).optional(),
  sources: z.array(sourceSchema).min(1),
});

export const starSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  traditionalFa: z.string().optional(),
  raDeg: z.number(),
  decDeg: z.number(),
  mag: z.number(),
  bv: z.number().optional(),
  distLy: z.number().positive().optional(),
  spect: z.string().optional(),
  con: z.string().optional(),
  page: z.boolean().optional(),
  summaryFa: z.string().optional(),
  image: z.string().optional(),
  imageCredit: z.string().min(1).optional(),
  imageNote: z.string().optional(),
  sources: z.array(sourceSchema).min(1),
});

export const systemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  summaryFa: z.string().min(1),
  fictional: z.boolean().optional(),
  distanceLy: z.number().positive().optional(),
  distanceNoteFa: z.string().optional(),
  planetIds: z.array(z.string()),
  sources: z.array(sourceSchema).min(1),
});

export const exoSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nameFa: z.string().min(1),
  nameEn: z.string().min(1),
  systemId: z.string().min(1),
  summaryFa: z.string().min(1),
  discoveryYear: z.number().int().optional(),
  methodFa: z.string().optional(),
  sources: z.array(sourceSchema).min(1),
});

export type Source = z.infer<typeof sourceSchema>;
export type Body = z.infer<typeof bodySchema>;
export type Craft = z.infer<typeof craftSchema>;
export type Star = z.infer<typeof starSchema>;
export type SystemRec = z.infer<typeof systemSchema>;
export type Exoplanet = z.infer<typeof exoSchema>;
