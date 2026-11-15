import { bodies, bySlug } from "@/lib/catalog";

export default function Page() {
  const earth = bySlug(bodies, "earth");
  const moon = bySlug(bodies, "moon");
  const steps = [
    { title: "زمین", text: earth?.radiusKm ? `شعاع میانگین ${earth.radiusKm} کیلومتر.` : "" },
    { title: "ماه", text: moon?.semiMajorAxisKm ? `فاصله‌ی میانگین ${moon.semiMajorAxisKm} کیلومتر.` : "" },
    { title: "یک واحد نجومی", text: "فاصله‌ی قراردادی زمین تا خورشید، همان ثابتی که astronomy-engine برای تبدیل استفاده می‌کند." },
    { title: "نپتون", text: "نیم‌قطر مداری‌اش در برگه‌ی ناسا حدود ۴٫۵ میلیارد کیلومتر است." },
    { title: "نزدیک‌ترین ستاره", text: "پروکسیما قنطورس نزدیک‌ترین ستاره به خورشید است. فاصله‌ی اعشاری را تا رسیدن کاتالوگ HYG در صفحه نیاورده‌ام." },
  ];
  return (
    <div className="page">
      <h1>سفر در مقیاس</h1>
      {steps.map((step) => <section key={step.title}><h2>{step.title}</h2><p>{step.text}</p></section>)}
    </div>
  );
}
