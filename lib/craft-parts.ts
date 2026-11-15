export type CraftPart = {
  name: string;
  shape: "cyl" | "box" | "sphere" | "cone";
  pos: [number, number, number];
  rot?: [number, number, number];
  size: number[];
  color: string;
  stage: number;
};

const dish = (y = 0.2): CraftPart[] => [
  { name: "بدنه", shape: "box", pos: [0, y, 0], size: [0.7, 0.55, 0.7], color: "#d7d2c8", stage: 0 },
  { name: "آنتن بهره بالا", shape: "cyl", pos: [0, y + 0.55, 0.15], rot: [1.15, 0, 0], size: [0.55, 0.55, 0.06], color: "#f4efe4", stage: 0 },
  { name: "بوم مغناطیس‌سنج", shape: "cyl", pos: [-1.1, y, 0], rot: [0, 0, Math.PI / 2], size: [0.03, 0.03, 1.5], color: "#c5c0b6", stage: 0 },
  { name: "ژنراتور رادیوایزوتوپ", shape: "cyl", pos: [0.85, y - 0.1, 0], size: [0.12, 0.12, 0.45], color: "#6e6a64", stage: 0 },
];

const rocket = (cores: number): CraftPart[] => {
  const parts: CraftPart[] = [];
  const xs = cores === 3 ? [-0.85, 0, 0.85] : [0];
  xs.forEach((x, i) => {
    parts.push(
      { name: i === 1 || cores === 1 ? "مرحله‌ی اول" : "بوستر کناری", shape: "cyl", pos: [x, 0, 0], size: [0.28, 0.32, 2.4], color: "#f4f1ea", stage: 1 },
      { name: "موتورهای مرحله‌ی اول", shape: "cone", pos: [x, -1.35, 0], rot: [Math.PI, 0, 0], size: [0.22, 0.28], color: "#2c2a28", stage: 1 },
    );
  });
  parts.push(
    { name: "مرحله‌ی دوم", shape: "cyl", pos: [0, 1.7, 0], size: [0.22, 0.24, 1.1], color: "#efeae2", stage: 2 },
    { name: "فیرینگ", shape: "cone", pos: [0, 2.55, 0], size: [0.24, 0.7], color: "#f7f4ee", stage: 3 },
  );
  return parts;
};

const station = (modules: number): CraftPart[] => {
  const parts: CraftPart[] = [
    { name: "خرپا", shape: "box", pos: [0, 0, 0], size: [3.2, 0.12, 0.12], color: "#c9c4ba", stage: 0 },
  ];
  for (let i = 0; i < modules; i += 1) {
    parts.push({ name: `ماژول ${i + 1}`, shape: "cyl", pos: [-0.7 + i * 0.7, 0.28, 0], rot: [0, 0, Math.PI / 2], size: [0.22, 0.22, 0.62], color: i === 0 ? "#e7e2d8" : "#d5d8e0", stage: 0 });
  }
  parts.push(
    { name: "آرایه‌ی خورشیدی چپ", shape: "box", pos: [-1.15, 0, 0.7], size: [1.3, 0.02, 0.45], color: "#1d3c66", stage: 0 },
    { name: "آرایه‌ی خورشیدی راست", shape: "box", pos: [1.15, 0, 0.7], size: [1.3, 0.02, 0.45], color: "#1d3c66", stage: 0 },
  );
  return parts;
};

const capsule = (service: boolean): CraftPart[] => [
  { name: "کپسول خدمه", shape: "cone", pos: [0, 0.45, 0], size: [0.38, 0.7], color: "#efeae2", stage: 0 },
  { name: "سپر حرارتی", shape: "cyl", pos: [0, 0.05, 0], size: [0.4, 0.4, 0.08], color: "#6a5244", stage: 0 },
  ...(service ? [{ name: "ماژول خدمات", shape: "cyl" as const, pos: [0, -0.4, 0] as [number, number, number], size: [0.36, 0.36, 0.55], color: "#cfc8bc", stage: 0 }] : []),
];

const rover = (): CraftPart[] => [
  { name: "بدنه", shape: "box", pos: [0, 0.35, 0], size: [0.9, 0.28, 0.7], color: "#f2efe8", stage: 3 },
  { name: "دکل", shape: "cyl", pos: [0.15, 0.75, 0], size: [0.04, 0.04, 0.55], color: "#ddd6cc", stage: 3 },
  { name: "بازوی نمونه‌بردار", shape: "cyl", pos: [0.55, 0.4, 0.2], rot: [0, 0, Math.PI / 2.4], size: [0.03, 0.03, 0.5], color: "#c9c3b8", stage: 3 },
  { name: "چرخ‌ها", shape: "cyl", pos: [0, 0.12, 0.42], rot: [Math.PI / 2, 0, 0], size: [0.14, 0.14, 1.05], color: "#2a2928", stage: 3 },
];

const telescope = (mirror: boolean): CraftPart[] => [
  { name: "بدنه‌ی اپتیکی", shape: "cyl", pos: [0, 0.2, 0], size: [0.38, 0.38, 1.5], color: "#e8e4dc", stage: 0 },
  { name: "دریچه‌ی دیافراگم", shape: "cyl", pos: [0, 1.05, 0], size: [0.4, 0.4, 0.06], color: "#b7b2a8", stage: 0 },
  ...(mirror
    ? [
        { name: "آینه‌ی اصلی", shape: "cyl" as const, pos: [0, -0.2, 0.7] as [number, number, number], rot: [Math.PI / 2, 0, 0] as [number, number, number], size: [0.7, 0.7, 0.04], color: "#f7f3ea", stage: 0 },
        { name: "سپر خورشیدی", shape: "box" as const, pos: [0, -0.7, 0] as [number, number, number], size: [1.8, 0.04, 0.9], color: "#d9a441", stage: 0 },
      ]
    : [{ name: "آرایه‌ی خورشیدی", shape: "box" as const, pos: [0.9, 0.2, 0] as [number, number, number], size: [0.7, 0.02, 0.35], color: "#1d3c66", stage: 0 }]),
];

const BY_SLUG: Record<string, CraftPart[]> = {
  "saturn-v": [
    { name: "موتورهای اف-۱", shape: "cone", pos: [0, -2.15, 0], rot: [Math.PI, 0, 0], size: [0.42, 0.35], color: "#2a2928", stage: 1 },
    { name: "مرحله‌ی اس-آی‌سی", shape: "cyl", pos: [0, -1.15, 0], size: [0.38, 0.42, 1.7], color: "#f4f1ea", stage: 1 },
    { name: "مرحله‌ی اس-۲", shape: "cyl", pos: [0, 0.35, 0], size: [0.38, 0.4, 1.15], color: "#f7f4ee", stage: 2 },
    { name: "مرحله‌ی اس-۴بی", shape: "cyl", pos: [0, 1.35, 0], size: [0.34, 0.36, 0.8], color: "#efeae2", stage: 3 },
    { name: "فضاپیمای آپولو", shape: "cone", pos: [0, 2.05, 0], size: [0.22, 0.45], color: "#f3efe6", stage: 4 },
    { name: "برج فرار", shape: "cyl", pos: [0, 2.45, 0], size: [0.04, 0.04, 0.4], color: "#c9c3b8", stage: 4 },
  ],
  shuttle: [
    { name: "بوستر چپ", shape: "cyl", pos: [-0.7, 0, 0], size: [0.16, 0.16, 2.5], color: "#f2efe8", stage: 1 },
    { name: "بوستر راست", shape: "cyl", pos: [0.7, 0, 0], size: [0.16, 0.16, 2.5], color: "#f2efe8", stage: 1 },
    { name: "مخزن خارجی", shape: "cyl", pos: [0, 0.1, 0], size: [0.32, 0.32, 2.3], color: "#e0703a", stage: 2 },
    { name: "مدارگرد", shape: "box", pos: [0, 0.15, 0.55], size: [0.7, 0.28, 1.5], color: "#f7f4ee", stage: 3 },
    { name: "بال", shape: "box", pos: [0, 0.05, 0.7], size: [1.5, 0.04, 0.45], color: "#efeae2", stage: 3 },
    { name: "موتورهای اصلی", shape: "cone", pos: [0, 0.15, -0.15], rot: [Math.PI / 2, 0, 0], size: [0.1, 0.22], color: "#2a2928", stage: 3 },
  ],
  "falcon-heavy": rocket(3),
  "falcon-9": rocket(1),
  starship: [
    { name: "سوپر هوی", shape: "cyl", pos: [0, -0.7, 0], size: [0.4, 0.42, 2.2], color: "#f3f0e8", stage: 1 },
    { name: "موتورهای رپتور بوستر", shape: "cone", pos: [0, -1.95, 0], rot: [Math.PI, 0, 0], size: [0.36, 0.3], color: "#2a2928", stage: 1 },
    { name: "استارشیپ", shape: "cyl", pos: [0, 1.15, 0], size: [0.4, 0.4, 1.5], color: "#e7e4dc", stage: 2 },
    { name: "بالک جلو", shape: "box", pos: [0.48, 1.45, 0], size: [0.28, 0.28, 0.04], color: "#222", stage: 2 },
    { name: "بالک عقب", shape: "box", pos: [0.5, 0.55, 0], size: [0.34, 0.4, 0.04], color: "#222", stage: 2 },
  ],
  "ariane-5": [
    { name: "بوستر چپ", shape: "cyl", pos: [-0.55, -0.2, 0], size: [0.16, 0.16, 1.8], color: "#f4f1ea", stage: 1 },
    { name: "بوستر راست", shape: "cyl", pos: [0.55, -0.2, 0], size: [0.16, 0.16, 1.8], color: "#f4f1ea", stage: 1 },
    { name: "مرحله‌ی اصلی", shape: "cyl", pos: [0, 0, 0], size: [0.32, 0.34, 2.2], color: "#f7f4ee", stage: 2 },
    { name: "مرحله‌ی فوقانی", shape: "cyl", pos: [0, 1.45, 0], size: [0.24, 0.24, 0.5], color: "#e6e1d8", stage: 3 },
    { name: "فیرینگ", shape: "cone", pos: [0, 2.05, 0], size: [0.26, 0.7], color: "#f4f1ea", stage: 3 },
  ],
  sls: [
    { name: "بوستر چپ", shape: "cyl", pos: [-0.6, -0.1, 0], size: [0.16, 0.16, 2.2], color: "#f2efe8", stage: 1 },
    { name: "بوستر راست", shape: "cyl", pos: [0.6, -0.1, 0], size: [0.16, 0.16, 2.2], color: "#f2efe8", stage: 1 },
    { name: "مرحله‌ی اصلی", shape: "cyl", pos: [0, 0, 0], size: [0.36, 0.38, 2.3], color: "#e0703a", stage: 2 },
    { name: "مرحله‌ی فوقانی", shape: "cyl", pos: [0, 1.5, 0], size: [0.28, 0.28, 0.55], color: "#f4f1ea", stage: 3 },
    { name: "اوریون", shape: "cone", pos: [0, 2.1, 0], size: [0.22, 0.4], color: "#f7f4ee", stage: 4 },
  ],
  iss: station(5),
  tiangong: [
    { name: "تیان‌هه", shape: "cyl", pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], size: [0.24, 0.24, 1.3], color: "#f4f1ea", stage: 0 },
    { name: "ماژول آزمایشگاهی", shape: "cyl", pos: [0, 0.45, 0], size: [0.2, 0.2, 0.7], color: "#e4e7ee", stage: 0 },
    { name: "ماژول آزمایشگاهی دوم", shape: "cyl", pos: [0, -0.45, 0], size: [0.2, 0.2, 0.7], color: "#e4e7ee", stage: 0 },
    { name: "آرایه‌ی خورشیدی", shape: "box", pos: [0.9, 0, 0], size: [0.8, 0.02, 0.4], color: "#1d3c66", stage: 0 },
  ],
  mir: station(4),
  skylab: [
    { name: "کارگاه", shape: "cyl", pos: [0, 0, 0], size: [0.4, 0.4, 1.8], color: "#f4f1ea", stage: 0 },
    { name: "تلسکوپ آپولو", shape: "cyl", pos: [0, 1.15, 0], size: [0.22, 0.22, 0.5], color: "#d9d4ca", stage: 0 },
    { name: "آرایه‌ی خورشیدی", shape: "box", pos: [0.7, 0, 0], size: [0.7, 0.02, 0.4], color: "#1d3c66", stage: 0 },
  ],
  "apollo-11": [
    { name: "ماژول فرمان", shape: "cone", pos: [0, 0.9, 0], size: [0.32, 0.4], color: "#f4f1ea", stage: 0 },
    { name: "ماژول خدمات", shape: "cyl", pos: [0, 0.35, 0], size: [0.3, 0.3, 0.6], color: "#cfc8bc", stage: 0 },
    { name: "مرحله‌ی صعود عقاب", shape: "box", pos: [1.1, 0.55, 0], size: [0.4, 0.35, 0.4], color: "#e7e2d8", stage: 1 },
    { name: "مرحله‌ی نزول عقاب", shape: "box", pos: [1.1, 0.2, 0], size: [0.55, 0.28, 0.55], color: "#b7b1a6", stage: 1 },
    { name: "پایه‌های فرود", shape: "cyl", pos: [1.1, 0.02, 0], size: [0.02, 0.02, 0.25], color: "#8d887f", stage: 1 },
  ],
  soyuz: [
    { name: "ماژول مداری", shape: "sphere", pos: [0, 0.7, 0], size: [0.28], color: "#e8e4dc", stage: 0 },
    { name: "ماژول بازگشت", shape: "sphere", pos: [0, 0.25, 0], size: [0.26], color: "#d7d2c8", stage: 0 },
    { name: "ماژول خدمات", shape: "cyl", pos: [0, -0.25, 0], size: [0.24, 0.24, 0.45], color: "#c9c3b8", stage: 0 },
    { name: "آرایه‌ی خورشیدی", shape: "box", pos: [0.55, -0.2, 0], size: [0.6, 0.02, 0.28], color: "#1d3c66", stage: 0 },
  ],
  "crew-dragon": [
    { name: "کپسول", shape: "cone", pos: [0, 0.4, 0], size: [0.4, 0.7], color: "#f7f4ee", stage: 0 },
    { name: "صندوق", shape: "cyl", pos: [0, -0.25, 0], size: [0.36, 0.36, 0.45], color: "#d9d4ca", stage: 1 },
    { name: "بالک", shape: "box", pos: [0.42, 0.15, 0], size: [0.18, 0.22, 0.04], color: "#222", stage: 0 },
  ],
  juno: [
    { name: "بدنه", shape: "box", pos: [0, 0, 0], size: [0.5, 0.5, 0.7], color: "#f4f1ea", stage: 0 },
    { name: "آرایه‌ی ۱", shape: "box", pos: [1.1, 0, 0], size: [1.4, 0.02, 0.35], color: "#1d3c66", stage: 0 },
    { name: "آرایه‌ی ۲", shape: "box", pos: [-0.55, 0.95, 0], rot: [0, 0, 2.1], size: [1.4, 0.02, 0.35], color: "#1d3c66", stage: 0 },
    { name: "آرایه‌ی ۳", shape: "box", pos: [-0.55, -0.95, 0], rot: [0, 0, -2.1], size: [1.4, 0.02, 0.35], color: "#1d3c66", stage: 0 },
  ],
  parker: [
    { name: "سپر حرارتی", shape: "cyl", pos: [0, 0.45, 0], size: [0.7, 0.7, 0.08], color: "#f4f1ea", stage: 0 },
    { name: "بدنه", shape: "box", pos: [0, 0, 0], size: [0.4, 0.45, 0.4], color: "#d7d2c8", stage: 0 },
    { name: "آرایه‌ی خورشیدی", shape: "box", pos: [0.7, 0.1, 0], size: [0.7, 0.02, 0.3], color: "#1d3c66", stage: 0 },
  ],
  "osiris-rex": [
    { name: "بدنه", shape: "box", pos: [0, 0, 0], size: [0.55, 0.45, 0.55], color: "#f4f1ea", stage: 0 },
    { name: "بازوی نمونه‌بردار", shape: "cyl", pos: [0, -0.45, 0], size: [0.04, 0.04, 0.45], color: "#c9c3b8", stage: 0 },
    { name: "کپسول نمونه", shape: "cyl", pos: [0, 0.4, 0], size: [0.16, 0.16, 0.18], color: "#e7e2d8", stage: 1 },
    { name: "آرایه‌ی خورشیدی", shape: "box", pos: [0.7, 0, 0], size: [0.7, 0.02, 0.32], color: "#1d3c66", stage: 0 },
  ],
  cassini: [
    ...dish(0),
    { name: "هویگنس", shape: "cone", pos: [0, -0.45, 0], size: [0.18, 0.22], color: "#d9a441", stage: 1 },
  ],
  perseverance: [
    ...rover(),
    { name: "سپر حرارتی", shape: "cyl", pos: [0, -0.55, 0], size: [0.7, 0.7, 0.08], color: "#6a5244", stage: 1 },
    { name: "چتر", shape: "cone", pos: [0, 1.3, 0], size: [0.55, 0.35], color: "#f4f1ea", stage: 2 },
    { name: "جرثقیل آسمانی", shape: "box", pos: [0, 0.95, 0], size: [0.45, 0.16, 0.35], color: "#cfc8bc", stage: 2 },
  ],
  curiosity: rover(),
  "viking-1": [
    { name: "مدارگرد", shape: "box", pos: [0, 0.8, 0], size: [0.7, 0.25, 0.5], color: "#e7e2d8", stage: 0 },
    { name: "فرودگر", shape: "box", pos: [0, 0.2, 0], size: [0.5, 0.25, 0.4], color: "#f4f1ea", stage: 1 },
    { name: "پایه‌ها", shape: "cyl", pos: [0, 0, 0], size: [0.02, 0.02, 0.25], color: "#8d887f", stage: 1 },
  ],
  ingenuity: [
    { name: "بدنه", shape: "box", pos: [0, 0.35, 0], size: [0.22, 0.12, 0.22], color: "#f4f1ea", stage: 0 },
    { name: "ملخ", shape: "box", pos: [0, 0.55, 0], size: [0.7, 0.02, 0.08], color: "#222", stage: 0 },
    { name: "پاها", shape: "cyl", pos: [0, 0.12, 0], size: [0.02, 0.02, 0.22], color: "#c9c3b8", stage: 0 },
  ],
  hubble: telescope(false),
  jwst: telescope(true),
  "kepler-telescope": telescope(false),
  chandra: telescope(false),
  gaia: [
    { name: "ماژول خدمات", shape: "cyl", pos: [0, -0.2, 0], size: [0.4, 0.4, 0.4], color: "#d7d2c8", stage: 0 },
    { name: "سپر خورشیدی", shape: "cyl", pos: [0, 0.25, 0], size: [0.9, 0.9, 0.06], color: "#e7e2d8", stage: 0 },
    { name: "محموله‌ی اپتیکی", shape: "box", pos: [0, 0.55, 0], size: [0.45, 0.3, 0.45], color: "#f4f1ea", stage: 0 },
  ],
};

const BY_CATEGORY: Record<string, CraftPart[]> = {
  launcher: rocket(1),
  station: station(3),
  crew: capsule(true),
  probe: dish(),
  mars: rover(),
  telescope: telescope(false),
};

export function craftParts(slug: string, category: string): CraftPart[] {
  return BY_SLUG[slug] ?? BY_CATEGORY[category] ?? dish();
}
