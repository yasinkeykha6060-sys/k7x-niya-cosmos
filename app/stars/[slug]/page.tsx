import Link from "next/link";
import { GlobeView } from "@/components/scene/globe-view";
import { stars } from "@/lib/catalog";
import { asset } from "@/lib/paths";

function starTint(bv?: number): string {
  const x = bv ?? 0.6;
  if (x < 0) return "#c8d8ff";
  if (x < 0.3) return "#f7f7ff";
  if (x < 0.6) return "#fff1cc";
  if (x < 1) return "#ffd2a1";
  if (x < 1.5) return "#ffb07a";
  return "#ff8a5b";
}

export function generateStaticParams() {
  const pages = stars.filter((star) => star.page);
  return (pages.length ? pages : stars.slice(0, 1)).filter(Boolean).map((star) => ({ slug: star.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const star = stars.find((item) => item.slug === slug);
  if (!star) return <p className="page">این ستاره در کاتالوگ این نسخه صفحه ندارد.</p>;
  return (
    <article className="page">
      <h1>{star.nameFa}</h1>
      <p className="lede ltr">{star.nameEn}{star.traditionalFa ? ` · ${star.traditionalFa}` : ""}</p>
      {star.image && (
        <figure>
          <img className="starshot" src={asset(`/stars/${star.image}`)} alt={star.nameFa} />
          <figcaption className="meta">{star.imageCredit}{star.imageNote ? ` — ${star.imageNote}` : ""}</figcaption>
        </figure>
      )}
      <GlobeView
        emissive
        cluster={star.slug === "pleiades"}
        color={starTint(star.bv)}
        note={star.slug === "pleiades"
          ? "خوشه‌ی باز. این نقطه‌ها اعضای واقعی با قدر جدا نیستند."
          : "رنگ از نمایه‌ی B−V همین کاتالوگ است، نه عکس ستاره."}
      />
      <p>{star.summaryFa}</p>
      <p>بُعد <bdi className="num">{star.raDeg.toFixed(4)}°</bdi>، میل <bdi className="num">{star.decDeg.toFixed(4)}°</bdi>، قدر <bdi className="num">{star.mag.toFixed(2)}</bdi>{star.spect ? `، رده‌ی ${star.spect}` : ""}{star.distLy ? `، فاصله ${star.distLy.toFixed(2)} سال نوری` : ""}.</p>
      <p><Link href="/sky/">نقشه‌ی آسمان</Link></p>
      <ul>{star.sources.map((source) => <li key={source.url}><a href={source.url}>{source.name}</a></li>)}</ul>
    </article>
  );
}
