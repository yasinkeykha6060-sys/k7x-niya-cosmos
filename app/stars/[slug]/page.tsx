import { stars } from "@/lib/catalog";
import Link from "next/link";

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
      <p>{star.summaryFa}</p>
      <p>بُعد <bdi className="num">{star.raDeg.toFixed(4)}°</bdi>، میل <bdi className="num">{star.decDeg.toFixed(4)}°</bdi>، قدر <bdi className="num">{star.mag.toFixed(2)}</bdi>{star.spect ? `، رده‌ی ${star.spect}` : ""}{star.distLy ? `، فاصله ${star.distLy.toFixed(2)} سال نوری` : ""}.</p>
      <p><Link href="/sky/">نقشه‌ی آسمان</Link></p>
      <ul>{star.sources.map((source) => <li key={source.url}><a href={source.url}>{source.name}</a></li>)}</ul>
    </article>
  );
}
