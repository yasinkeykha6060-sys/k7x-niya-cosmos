"use client";

import { useEffect, useState } from "react";
import { bodies } from "@/lib/catalog";

type Note = { id: string; text: string };

export default function Page() {
  const [favs, setFavs] = useState<string[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [company, setCompany] = useState("");
  const [rocket, setRocket] = useState("");
  useEffect(() => {
    setFavs(JSON.parse(localStorage.getItem("ny-favs") || "[]"));
    setNotes(JSON.parse(localStorage.getItem("ny-notes") || "[]"));
    const firm = JSON.parse(localStorage.getItem("ny-firm") || "{}");
    setCompany(firm.company || "");
    setRocket(firm.rocket || "");
  }, []);
  const save = (nextFavs: string[], nextNotes: Note[], firm = { company, rocket }) => {
    setFavs(nextFavs);
    setNotes(nextNotes);
    localStorage.setItem("ny-favs", JSON.stringify(nextFavs));
    localStorage.setItem("ny-notes", JSON.stringify(nextNotes));
    localStorage.setItem("ny-firm", JSON.stringify(firm));
  };
  const download = () => {
    const blob = new Blob([JSON.stringify({ favs, notes, company, rocket }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "notebook.json";
    a.click();
  };
  return (
    <div className="page">
      <h1>دفتر</h1>
      <p className="lede">نشان‌ها، یادداشت و نام شرکت فقط روی همین دستگاه می‌مانند.</p>
      <h2>نشان‌ها</h2>
      <select onChange={(e) => { if (e.target.value && !favs.includes(e.target.value)) save([...favs, e.target.value], notes); }}>
        <option value="">افزودن جرم</option>
        {bodies.map((body) => <option key={body.id} value={body.slug}>{body.nameFa}</option>)}
      </select>
      {favs.map((slug) => <p key={slug}>{bodies.find((body) => body.slug === slug)?.nameFa ?? slug} <button className="btn" type="button" onClick={() => save(favs.filter((item) => item !== slug), notes)}>حذف</button></p>)}
      <h2>یادداشت</h2>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn" type="button" onClick={() => { if (!text.trim()) return; save(favs, [...notes, { id: String(Date.now()), text }]); setText(""); }}>ثبت</button>
      {notes.map((note) => <p key={note.id}>{note.text}</p>)}
      <h2>دفتر شرکت</h2>
      <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="نام شرکت" />
      <input value={rocket} onChange={(e) => setRocket(e.target.value)} placeholder="نام پرتابگر" />
      <button className="btn" type="button" onClick={() => save(favs, notes, { company, rocket })}>ذخیره</button>
      <p><button className="btn" type="button" onClick={download}>دانلود پشتیبان</button></p>
    </div>
  );
}
