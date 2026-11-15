"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { searchIndex } from "@/lib/catalog";

export default function Page() {
  const [q, setQ] = useState("");
  const fuse = useMemo(() => new Fuse(searchIndex(), { keys: ["title", "en"], threshold: 0.35 }), []);
  const hits = q.trim() ? fuse.search(q).map((r) => r.item) : searchIndex();
  return (
    <div className="page">
      <h1>جستجو</h1>
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="یاسین، نیایش، زحل، Voyager" />
      {hits.slice(0, 40).map((hit) => <p key={hit.href + hit.title}><Link href={hit.href}>{hit.title}</Link> <span className="meta ltr">{hit.en}</span></p>)}
    </div>
  );
}
