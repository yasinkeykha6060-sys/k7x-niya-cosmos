import Link from "next/link";
import { spacecraft } from "@/lib/catalog";
import { CraftScene } from "@/components/scene/craft-scene";

export function generateStaticParams() {
  return spacecraft.map((craft) => ({ slug: craft.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const craft = spacecraft.find((item) => item.slug === slug);
  if (!craft) return null;
  return (
    <article className="page">
      <h1>{craft.nameFa}</h1>
      <p className="lede ltr">{craft.nameEn} · {craft.agency}</p>
      <p>{craft.summaryFa}</p>
      <p>{craft.missionFa}</p>
      <p>وضعیت: {craft.status === "active" ? "فعال" : craft.status === "testing" ? "در آزمون" : "پایان‌یافته"}، طبق اطلاعات تا {craft.statusAsOf}.</p>
      {craft.launchDate && <p>پرتاب: <bdi className="num">{craft.launchDate}</bdi></p>}
      {craft.endDate && <p>پایان: <bdi className="num">{craft.endDate}</bdi></p>}
      {craft.heightM && <p>ارتفاع: <bdi className="num">{craft.heightM} m</bdi></p>}
      <ul>{craft.achievements.map((item) => <li key={item}>{item}</li>)}</ul>
      {craft.animation && <CraftScene kind={craft.animation} />}
      <p className="meta">مدل، بازسازی با کد است.</p>
      {craft.targets?.map((id) => <p key={id}><Link href={id === "moon" ? "/moons/moon/" : id === "pluto" || id === "ceres" ? `/dwarf-planets/${id}/` : id === "halley" ? "/small-bodies/halley/" : id === "sun" ? "/solar-system/" : `/planets/${id}/`}>{id}</Link></p>)}
      <ul>{craft.sources.map((source) => <li key={source.url}><a href={source.url}>{source.name}</a></li>)}</ul>
    </article>
  );
}
