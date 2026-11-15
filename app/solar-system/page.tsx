import Link from "next/link";
import { SystemView } from "@/components/scene/system-view";
import { bodies } from "@/lib/catalog";

export default function Page() {
  return (
    <div className="page">
      <h1>منظومه‌ی شمسی</h1>
      <p className="lede">جای سیاره‌ها را astronomy-engine برای تاریخ انتخابی حساب می‌کند. مقیاس واقعی نسبت فاصله و اندازه را نگه می‌دارد. مقیاس ناوبری سیاره‌ها را بزرگ می‌کند تا دیده شوند و این را روی تصویر می‌نویسد. کمربند سیارک‌ها توزیع آماری است، نه فهرست سیارک‌های نام‌دار.</p>
      <SystemView />
      <h2>فهرست اجرام</h2>
      <div className="grid cards">
        {bodies.map((body) => {
          const href = body.kind === "planet" ? `/planets/${body.slug}/`
            : body.kind === "moon" ? `/moons/${body.slug}/`
            : body.kind === "dwarf-planet" ? `/dwarf-planets/${body.slug}/`
            : body.kind === "small-body" ? `/small-bodies/${body.slug}/`
            : "/solar-system/";
          return (
            <Link key={body.id} className="card" href={href}>
              <h3>{body.nameFa}</h3>
              <p className="meta ltr">{body.nameEn}</p>
            </Link>
          );
        })}
      </div>
      <p><Link href="/catalog/">ستاره‌ها و سامانه‌های دیگر در آلبوم</Link></p>
    </div>
  );
}
