import Link from "next/link";
import { GlobeView } from "@/components/scene/globe-view";
import { exoplanets, systems } from "@/lib/catalog";

export function generateStaticParams() {
  return exoplanets.map((planet) => ({ slug: planet.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planet = exoplanets.find((item) => item.slug === slug);
  if (!planet) return null;
  const system = systems.find((item) => item.id === planet.systemId);
  return (
    <article className="page">
      <h1>{planet.nameFa}</h1>
      <p className="lede ltr">{planet.nameEn}</p>
      {system?.fictional && <p className="note">سیاره‌ی خیالی و نام‌گذاری شخصی؛ ثبت رسمی ندارد.</p>}
      <GlobeView color="#7f93a8" note="سطح این سیاره تصویر نشده و شعاعش در داده نیست. اندازهٔ کره مقیاس نیست." />
      <p>{planet.summaryFa}</p>
      {planet.discoveryYear && <p>سال اعلام: <bdi className="num">{planet.discoveryYear}</bdi>{planet.methodFa ? `، روش ${planet.methodFa}` : ""}.</p>}
      {system && <p>سامانه: <Link href={`/systems/${system.slug}/`}>{system.nameFa}</Link></p>}
      <p className="meta">تصویر هنری جداگانه‌ای برای این سیاره در سایت گذاشته نشده است.</p>
      <ul>{planet.sources.map((source) => <li key={source.url}><a href={source.url}>{source.name}</a></li>)}</ul>
    </article>
  );
}
