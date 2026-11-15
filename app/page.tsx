import Link from "next/link";
import { SystemView } from "@/components/scene/system-view";
import { stars } from "@/lib/catalog";
import { asset } from "@/lib/paths";

export default function Page() {
  const shown = stars.filter((star) => star.page);
  return (
    <>
      <SystemView fill>
        <div className="overlay-copy overlay-top panel">
          <h1>نیایش جانم، این آلبوم کل جهان رو برای توئه. هر جا دلت خواست برو.</h1>
          <p className="lede">اینجا کل منظومه‌ی شمسی است، با جای محاسبه‌شده‌ی سیاره‌ها. ستاره‌هایی که عکس تأییدشده دارند پایین صفحه هستند.</p>
          <nav className="album-links" aria-label="بخش‌های آلبوم">
            <Link href="/catalog/#planets">سیاره‌ها</Link>
            <Link href="/catalog/#moons">قمرها</Link>
            <Link href="/catalog/#stars">ستاره‌ها</Link>
            <Link href="/spacecraft/">فضاپیما</Link>
            <Link href="/catalog/">همه‌ی آلبوم</Link>
          </nav>
        </div>
        <Link className="mark" href="/yasin-niyayesh/" aria-label="YN-001" />
      </SystemView>
      <section className="page">
        <h2>ستاره‌ها</h2>
        <p className="lede">فقط عکسی آمده که خود تصویر را دیدم و پروانه‌اش روشن بود. بقیه هنوز کره‌ی رنگی از روی B−V دارند، نه عکس ساختگی.</p>
        <div className="grid cards">
          {shown.map((star) => (
            <Link key={star.id} className="card" href={`/stars/${star.slug}/`}>
              {star.image ? <img className="starshot" src={asset(`/stars/${star.image}`)} alt={star.nameFa} /> : null}
              <h3>{star.nameFa}</h3>
              <p className="meta ltr">{star.nameEn}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
