"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { searchIndex, type SearchHit } from "@/lib/catalog";
import { asset } from "@/lib/paths";
import { PrefsProvider, usePrefs } from "./prefs";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/catalog/", label: "آلبوم" },
  { href: "/solar-system/", label: "منظومه" },
  { href: "/sky/", label: "آسمان" },
  { href: "/spacecraft/", label: "فضاپیما" },
  { href: "/compare/", label: "مقایسه" },
  { href: "/timeline/", label: "زمان" },
  { href: "/journey/", label: "مقیاس" },
  { href: "/notebook/", label: "دفتر" },
  { href: "/about/", label: "منابع" },
];

function crumbs(path: string): { href: string; label: string }[] {
  const map: Record<string, string> = {
    catalog: "آلبوم",
    "solar-system": "منظومه‌ی شمسی",
    planets: "سیاره‌ها",
    moons: "قمرها",
    "dwarf-planets": "سیاره‌های کوتوله",
    "small-bodies": "اجرام کوچک",
    stars: "ستاره‌ها",
    systems: "سامانه‌ها",
    exoplanets: "سیاره‌های فراخورشیدی",
    spacecraft: "فضاپیماها",
    sky: "آسمان",
    compare: "مقایسه",
    timeline: "خط زمان",
    search: "جستجو",
    about: "منابع",
    "yasin-niyayesh": "YN-001",
    simulator: "شبیه‌ساز",
    glossary: "فرهنگ",
    journey: "سفر در مقیاس",
    notebook: "دفتر",
  };
  const parts = path.split("/").filter(Boolean);
  const out = [{ href: "/", label: "خانه" }];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    out.push({ href: `${acc}/`, label: map[part] ?? part });
  }
  return out;
}

function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "/";
  const router = useRouter();
  const { digits, quality, setDigits, setQuality } = usePrefs();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [hasMusic, setHasMusic] = useState(false);
  const [playing, setPlaying] = useState(false);
  const sound = useRef<{ ctx: AudioContext; gain: GainNode; stop: () => void } | null>(null);
  const fuse = useMemo(() => new Fuse(searchIndex(), { keys: ["title", "en"], threshold: 0.35 }), []);
  const hits = q.trim() ? fuse.search(q).slice(0, 8).map((r) => r.item) : searchIndex().slice(0, 6);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/sw.js`).catch(() => undefined);
    }
    fetch(asset("/music.mp3"), { method: "HEAD" }).then((res) => { if (res.ok) setHasMusic(true); }).catch(() => undefined);
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if ((event.key === "/" && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleMusic = async () => {
    if (sound.current) {
      const { ctx, gain, stop } = sound.current;
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      window.setTimeout(stop, 700);
      sound.current = null;
      setPlaying(false);
      return;
    }
    const ctx = new AudioContext();
    const data = await fetch(asset("/music.mp3")).then((res) => res.arrayBuffer());
    const buffer = await ctx.decodeAudioData(data);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.2);
    src.connect(gain).connect(ctx.destination);
    src.start();
    const stop = () => { src.stop(); ctx.close(); };
    sound.current = { ctx, gain, stop };
    setPlaying(true);
  };

  const go = (hit: SearchHit) => {
    setOpen(false);
    setQ("");
    router.push(hit.href);
  };

  return (
    <>
      <a className="skip" href="#content">پرش به محتوا</a>
      <header className="topbar">
        <Link href="/" className="brand">
          <strong>آلبوم جهان</strong>
          <span>برای نیایش، از یاسین</span>
        </Link>
        <nav className="navlinks" aria-label="اصلی">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={path === link.href ? "page" : undefined}>{link.label}</Link>
          ))}
        </nav>
        <span className="grow" />
        {hasMusic && <button className="iconbtn" type="button" onClick={toggleMusic}>{playing ? "قطع صدا" : "صدا"}</button>}
        <button className="iconbtn" type="button" onClick={() => setOpen(true)}>جستجو</button>
        <button className="iconbtn" type="button" onClick={() => setSettings(true)}>تنظیم</button>
      </header>
      {path !== "/" && (
        <div className="page" style={{ paddingBottom: 0 }}>
          <nav className="crumbs" aria-label="مسیر">
            {crumbs(path).map((c, i) => (
              <span key={c.href}>
                {i > 0 ? " / " : ""}
                <Link href={c.href}>{c.label}</Link>
              </span>
            ))}
          </nav>
        </div>
      )}
      <div id="content">{children}</div>
      <nav className="bottomnav" aria-label="موبایل">
        <Link href="/">خانه</Link>
        <Link href="/catalog/">آلبوم</Link>
        <Link href="/solar-system/">منظومه</Link>
        <Link href="/sky/">آسمان</Link>
        <Link href="/spacecraft/">فضاپیما</Link>
        <Link href="/notebook/">دفتر</Link>
      </nav>
      {open && (
        <>
          <button className="backdrop" aria-label="بستن" onClick={() => setOpen(false)} />
          <div className="dialog" role="dialog" aria-label="جستجو">
            <input autoFocus type="search" placeholder="فارسی یا انگلیسی" value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setActive((n) => Math.min(hits.length - 1, n + 1));
                if (e.key === "ArrowUp") setActive((n) => Math.max(0, n - 1));
                if (e.key === "Enter" && hits[active]) go(hits[active]);
              }} />
            {hits.map((hit, i) => (
              <button key={hit.href + hit.title} className="hit" aria-selected={i === active} type="button" onClick={() => go(hit)}>
                {hit.title} <span className="meta ltr">{hit.en}</span>
              </button>
            ))}
          </div>
        </>
      )}
      {settings && (
        <>
          <button className="backdrop" aria-label="بستن" onClick={() => setSettings(false)} />
          <div className="dialog" role="dialog" aria-label="تنظیمات">
            <h2>تنظیمات</h2>
            <label className="row">ارقام
              <select value={digits} onChange={(e) => setDigits(e.target.value as "fa" | "en")}>
                <option value="fa">فارسی</option>
                <option value="en">انگلیسی</option>
              </select>
            </label>
            <label className="row">کیفیت تصویر
              <select value={quality} onChange={(e) => setQuality(e.target.value as "auto" | "low" | "medium" | "high")}>
                <option value="auto">خودکار</option>
                <option value="low">پایین</option>
                <option value="medium">متوسط</option>
                <option value="high">بالا</option>
              </select>
            </label>
            <p className="meta">هیچ تنظیم یا یادداشتی از این دستگاه بیرون نمی‌رود.</p>
          </div>
        </>
      )}
    </>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return <PrefsProvider><Frame>{children}</Frame></PrefsProvider>;
}
