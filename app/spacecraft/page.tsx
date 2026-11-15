import Link from "next/link";
import { spacecraft } from "@/lib/catalog";

const LABELS: Record<string, string> = {
  launcher: "پرتابگر",
  station: "ایستگاه",
  crew: "سرنشین‌دار",
  probe: "کاوشگر",
  mars: "مریخ",
  telescope: "تلسکوپ",
};

export default function Page() {
  return (
    <div className="page">
      <h1>فضاپیماها</h1>
      <p className="lede">مدل سه‌بعدی این نسخه بازسازی ساده با ابعاد واقعیِ موجود در داده است، نه فایل ناسا. هر جا عدد نبود، حذف شده.</p>
      {Object.keys(LABELS).map((key) => (
        <section key={key}>
          <h2>{LABELS[key]}</h2>
          <div className="grid cards">
            {spacecraft.filter((craft) => craft.category === key).map((craft) => (
              <Link key={craft.id} className="card" href={`/spacecraft/${craft.slug}/`}>
                <h3>{craft.nameFa}</h3>
                <p className="meta ltr">{craft.nameEn}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
