import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const SOURCE = {
  name: "d3-celestial stars.6.json، برگرفته از پایگاه HYG",
  url: "https://github.com/ofrohn/d3-celestial",
  retrieved: "2026-11-15",
};
const MESS_SOURCE = {
  name: "d3-celestial messier.json",
  url: "https://github.com/ofrohn/d3-celestial",
  retrieved: "2026-11-15",
};

function normRa(ra) {
  let value = ra;
  while (value < 0) value += 360;
  while (value >= 360) value -= 360;
  return Math.round(value * 10000) / 10000;
}

const rawStars = JSON.parse(readFileSync("tmp-src/stars.6.json", "utf8"));
const compact = [];
for (const feature of rawStars.features) {
  const mag = Number(feature.properties.mag);
  if (!Number.isFinite(mag) || mag > 6.5) continue;
  const [ra, dec] = feature.geometry.coordinates;
  const bv = Number(feature.properties.bv);
  compact.push([
    normRa(ra),
    Math.round(dec * 10000) / 10000,
    Math.round(mag * 100) / 100,
    Number.isFinite(bv) ? Math.round(bv * 1000) / 1000 : null,
  ]);
}

const named = {
  32349: ["سیریوس", "Sirius", "شعرای یمانی"],
  30438: ["سهیل", "Canopus", "سهیل"],
  71683: ["آلفا قنطورس", "Alpha Centauri", "رجل قنطورس"],
  69673: ["سماک رامح", "Arcturus", "السماک الرامح"],
  91262: ["وگا", "Vega", "نسر واقع"],
  24608: ["عیوق", "Capella", "العیوق"],
  24436: ["رجل الجبار", "Rigel", "رجل الجبار"],
  37279: ["شعرای شامی", "Procyon", "الشعری الشامیة"],
  27989: ["ابط الجوزا", "Betelgeuse", "ابط الجوزا"],
  7588: ["آخر النهر", "Achernar", "آخر النهر"],
  97649: ["اتایر", "Altair", "نسر طائر"],
  21421: ["دبران", "Aldebaran", "الدبران"],
  80763: ["قلب العقرب", "Antares", "قلب العقرب"],
  102098: ["دنب", "Deneb", "ذنب الدجاجة"],
  65474: ["سماک اعزل", "Spica", "السماک الأعزل"],
  37826: ["رأس التوأم مؤخر", "Pollux", "رأس التوأم المؤخر"],
  113368: ["فم الحوت", "Fomalhaut", "فم الحوت"],
  49669: ["قلب الاسد", "Regulus", "قلب الأسد"],
  60718: ["آلفا صلیب", "Acrux"],
  62434: ["بتا صلیب", "Mimosa"],
};

const byId = new Map(rawStars.features.map((feature) => [Number(feature.id), feature]));
const stars = [];
for (const [id, labels] of Object.entries(named)) {
  const feature = byId.get(Number(id));
  if (!feature) throw new Error(`missing HIP ${id}`);
  const [ra, dec] = feature.geometry.coordinates;
  const bv = Number(feature.properties.bv);
  const [nameFa, nameEn, traditionalFa] = labels;
  stars.push({
    id: `hip-${id}`,
    slug: nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    nameFa,
    nameEn,
    ...(traditionalFa ? { traditionalFa } : {}),
    raDeg: normRa(ra),
    decDeg: Math.round(dec * 10000) / 10000,
    mag: Number(feature.properties.mag),
    ...(Number.isFinite(bv) ? { bv } : {}),
    page: true,
    summaryFa: "مختصات و قدر از فایل ستاره‌های d3-celestial (پایگاه HYG) است. فاصله، جرم، شعاع و رده‌ی طیفی در این فایل نبود و اینجا نیامده.",
    sources: [SOURCE],
  });
}

const rawCon = JSON.parse(readFileSync("tmp-src/constellations.json", "utf8"));
const rawLines = JSON.parse(readFileSync("tmp-src/constellations.lines.json", "utf8"));
const names = new Map();
for (const feature of rawCon.features) {
  if (names.has(feature.id)) continue;
  names.set(feature.id, {
    nameEn: feature.properties.en || feature.properties.name,
    nameFa: String(feature.properties.fa || feature.properties.name).replace(/\u2005/g, " "),
  });
}
const linesById = new Map();
for (const feature of rawLines.features) {
  const polylines = feature.geometry.coordinates.map((line) =>
    line.map(([ra, dec]) => [normRa(ra), Math.round(dec * 10000) / 10000]),
  );
  const prev = linesById.get(feature.id) ?? [];
  linesById.set(feature.id, prev.concat(polylines));
}
const constellations = [...linesById.entries()].map(([id, lines]) => ({
  id,
  nameEn: names.get(id)?.nameEn ?? id,
  nameFa: names.get(id)?.nameFa ?? id,
  lines,
}));

const famous = {
  M1: "سحابی خرچنگ",
  M31: "کهکشان آندرومدا",
  M42: "سحابی جبار",
  M45: "ثریا",
  M57: "سحابی حلقه",
  M16: "سحابی عقاب",
};
const rawMess = JSON.parse(readFileSync("tmp-src/messier.json", "utf8"));
const deepsky = rawMess.features.map((feature) => {
  const [ra, dec] = feature.geometry.coordinates;
  const alt = feature.properties.alt || "";
  return {
    id: feature.id.toLowerCase(),
    nameEn: alt || feature.properties.name,
    nameFa: famous[feature.id] || feature.properties.name,
    raDeg: normRa(ra),
    decDeg: Math.round(dec * 10000) / 10000,
    ...(Number.isFinite(feature.properties.mag) ? { mag: feature.properties.mag } : {}),
    kind: feature.properties.type || "object",
    summaryFa: "جایگاه از فهرست مسیه در d3-celestial. تصویری در این نسخه کنارش نیست.",
  };
});

mkdirSync("public/sky", { recursive: true });
writeFileSync("data/stars.json", JSON.stringify(stars, null, 2));
writeFileSync("data/constellations.json", JSON.stringify(constellations));
writeFileSync("data/deepsky.json", JSON.stringify(deepsky));
writeFileSync("public/sky/stars.json", JSON.stringify(compact));
console.log(`stars ${stars.length}, sky ${compact.length}, constellations ${constellations.length}, messier ${deepsky.length}`);
