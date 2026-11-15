import Link from "next/link";
import { bodies, exoplanets, stars, systems, type Body } from "@/lib/catalog";
import { asset } from "@/lib/paths";

function bodyHref(body: Body): string {
  if (body.kind === "planet") return `/planets/${body.slug}/`;
  if (body.kind === "moon") return `/moons/${body.slug}/`;
  if (body.kind === "dwarf-planet") return `/dwarf-planets/${body.slug}/`;
  if (body.kind === "small-body") return `/small-bodies/${body.slug}/`;
  return "/solar-system/";
}

function Cards({ items }: { items: { href: string; title: string; en: string; note?: string; texture?: string; swatch?: string }[] }) {
  return (
    <div className="grid cards">
      {items.map((item) => (
        <Link key={item.href + item.title} className="card" href={item.href}>
          {item.texture ? <span className="thumb" style={{ backgroundImage: `url(${asset(`/textures/${item.texture}`)})` }} /> : null}
          {!item.texture && item.swatch ? <span className="thumb" style={{ background: item.swatch }} /> : null}
          <h3>{item.title}</h3>
          <p className="meta ltr">{item.en}</p>
          {item.note ? <p className="meta">{item.note}</p> : null}
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  const of = (kind: Body["kind"]) => bodies.filter((body) => body.kind === kind).map((body) => ({
    href: bodyHref(body),
    title: body.nameFa,
    en: body.nameEn,
    texture: body.texture,
    swatch: body.texture ? undefined : "#9a948c",
  }));
  return (
    <div className="page">
      <h1>آلبوم</h1>
      <p className="lede">هر کارت صفحه‌ای با مدل سه‌بعدی چرخان دارد. نقشه‌دارها همین‌جا هم دیده می‌شوند. صحنهٔ منظومه هشت سیاره، پلوتون، ماه و چهار قمر گالیله‌ای را در جای محاسبه‌شده نشان می‌دهد.</p>
      <h2 id="planets">سیاره‌ها</h2>
      <Cards items={of("planet")} />
      <h2 id="moons">قمرها</h2>
      <Cards items={of("moon")} />
      <h2 id="dwarfs">سیاره‌های کوتوله</h2>
      <Cards items={of("dwarf-planet")} />
      <h2 id="small">اجرام کوچک</h2>
      <Cards items={of("small-body")} />
      <h2 id="sun">خورشید</h2>
      <Cards items={of("star")} />
      <h2 id="stars">ستاره‌های نام‌دار</h2>
      <Cards items={stars.filter((star) => star.page).map((star) => ({
        href: `/stars/${star.slug}/`,
        title: star.nameFa,
        en: star.nameEn,
        note: star.traditionalFa,
        swatch: (star.bv ?? 0.6) < 0.3 ? "#f4f6ff" : (star.bv ?? 0.6) < 1 ? "#ffd2a1" : "#ffb07a",
      }))} />
      <p><Link href="/stars/life/">چرخه‌ی عمر ستاره</Link></p>
      <h2 id="systems">سامانه‌های دیگر</h2>
      <Cards items={systems.map((system) => ({
        href: system.slug === "yn-001" ? "/yasin-niyayesh/" : `/systems/${system.slug}/`,
        title: system.nameFa,
        en: system.nameEn,
        note: system.fictional ? "نام‌گذاری شخصی" : undefined,
      }))} />
      <h2 id="exoplanets">سیاره‌های فراخورشیدی</h2>
      <Cards items={exoplanets.map((exo) => ({
        href: exo.slug === "yn-001-b" ? "/yasin-niyayesh/" : `/exoplanets/${exo.slug}/`,
        title: exo.nameFa,
        en: exo.nameEn,
      }))} />
    </div>
  );
}
