"use client";

import { useEffect, useRef, useState } from "react";

export function CraftScene({ kind }: { kind: "ascent" | "landing" | "flybys" }) {
  const host = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(true);
  const [caption, setCaption] = useState("");
  const playRef = useRef(true);
  playRef.current = play;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let frame = 0;
    const boot = async () => {
      const test = document.createElement("canvas");
      if (!test.getContext("webgl2")) return;
      const THREE = await import("three");
      if (dead || !host.current) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor(0x07050f, 1);
      host.current.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(6, 3, 8);
      camera.lookAt(0, 1, 0);
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      scene.add(new THREE.DirectionalLight(0xfff4e6, 2));
      const stages = [2.2, 1.4, 0.8].map((h, i) => {
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35 - i * 0.06, 0.4 - i * 0.05, h, 24),
          new THREE.MeshStandardMaterial({ color: i === 2 ? 0xf4eef8 : 0xd9d3ea, roughness: 0.45, metalness: 0.2 }),
        );
        mesh.position.y = [1.1, 2.9, 4.0][i];
        scene.add(mesh);
        return mesh;
      });
      const captions = kind === "landing"
        ? ["ورود به جو", "چتر", "جرثقیل آسمانی", "روی سطح"]
        : kind === "flybys"
          ? ["پرتاب", "کمک گرانشی", "ملاقات", "ادامه‌ی مسیر"]
          : ["برخاست", "جدایش مرحله‌ی اول", "جدایش مرحله‌ی دوم", "مدار"];
      let t = 0;
      let lastPhase = -1;
      const resize = () => {
        const w = host.current?.clientWidth ?? 1;
        renderer.setSize(w, 320, false);
        camera.aspect = w / 320;
        camera.updateProjectionMatrix();
      };
      resize();
      const loop = () => {
        frame = requestAnimationFrame(loop);
        if (document.hidden) return;
        if (playRef.current) t += 0.004;
        const phase = Math.min(3, Math.floor((t % 4)));
        if (phase !== lastPhase) {
          lastPhase = phase;
          setCaption(captions[phase] + " — طرح زمان‌بندی، نه تلومتری");
        }
        stages.forEach((mesh, i) => {
          mesh.position.y = [1.1, 2.9, 4.0][i] + (phase > i ? (phase - i) * 1.4 : 0);
        });
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      const stop = () => { cancelAnimationFrame(frame); renderer.dispose(); renderer.domElement.remove(); };
      if (dead) stop();
      else (el as HTMLDivElement & { _stop?: () => void })._stop = stop;
    };
    boot();
    return () => {
      dead = true;
      (el as HTMLDivElement & { _stop?: () => void })._stop?.();
    };
  }, [kind]);

  return (
    <section>
      <div className="stage" ref={host} style={{ height: 320 }} />
      <p>{caption}</p>
      <button className="btn" type="button" onClick={() => setPlay((v) => !v)}>{play ? "مکث" : "پخش"}</button>
    </section>
  );
}
