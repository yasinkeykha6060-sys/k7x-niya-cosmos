import { SystemView } from "@/components/scene/system-view";

export default function Page() {
  return (
    <div className="page">
      <h1>منظومه‌ی شمسی</h1>
      <p className="lede">جای سیاره‌ها را astronomy-engine برای تاریخ انتخابی حساب می‌کند. مقیاس واقعی نسبت فاصله و اندازه را نگه می‌دارد. مقیاس ناوبری سیاره‌ها را بزرگ می‌کند تا دیده شوند و این را روی تصویر می‌نویسد. کمربند سیارک‌ها توزیع آماری است، نه فهرست سیارک‌های نام‌دار.</p>
      <SystemView />
    </div>
  );
}
