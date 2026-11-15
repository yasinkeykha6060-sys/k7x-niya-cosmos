import Link from "next/link";
import { exoplanets, systems } from "@/lib/catalog";

export function generateStaticParams() {
  return systems.map((system) => ({ slug: system.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const system = systems.find((item) => item.slug === slug);
  if (!system) return null;
  const planets = exoplanets.filter((planet) => planet.systemId === system.id);
  return (
    <article className="page">
      <h1>{system.nameFa}</h1>
      <p className="lede ltr">{system.nameEn}</p>
      {system.fictional && <p className="note">سامانه‌ی خیالی. تصور هنری نیست؛ مدل صفحه از پارامترهای فرضی personal.json ساخته می‌شود و برچسب غیررسمی دارد.</p>}
      <p>{system.summaryFa}</p>
      {system.slug === "yn-001" && <p><Link href="/yasin-niyayesh/">مدل سامانه</Link></p>}
      <div className="grid cards">
        {planets.map((planet) => (
          <Link key={planet.id} className="card" href={`/exoplanets/${planet.slug}/`}>
            <h2>{planet.nameFa}</h2>
            <p className="meta ltr">{planet.nameEn}</p>
          </Link>
        ))}
      </div>
      <ul>{system.sources.map((source) => <li key={source.url}><a href={source.url}>{source.name}</a></li>)}</ul>
    </article>
  );
}
