import { glossary } from "@/lib/catalog";

export default function Page() {
  return (
    <div className="page">
      <h1>فرهنگ</h1>
      {glossary.map((term) => (
        <section key={term.slug} id={term.slug}>
          <h2>{term.nameFa} <span className="meta ltr">{term.nameEn}</span></h2>
          <p>{term.summaryFa}</p>
        </section>
      ))}
    </div>
  );
}
