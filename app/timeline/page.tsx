import Link from "next/link";
import { timeline } from "@/lib/catalog";

export default function Page() {
  return (
    <div className="page">
      <h1>خط زمان</h1>
      <p className="lede">تاریخ‌های پرتاب و فرود از بایگانی مأموریت‌ها. برنامه‌های آینده، تا وقتی تاریخ قطعی نداشته باشند، اینجا نیستند.</p>
      <table>
        <tbody>
          {timeline.map((event) => (
            <tr key={event.year + event.titleEn}>
              <td className="num">{event.year}</td>
              <td>{event.slug ? <Link href={event.kind === "crew" || event.kind === "probe" || event.kind === "mars" || event.kind === "telescope" || event.kind === "launcher" || event.kind === "station" ? `/spacecraft/${event.slug}/` : "/"}>{event.titleFa}</Link> : event.titleFa}<div className="meta">{event.summaryFa}</div></td>
              <td className="meta">{event.org}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
