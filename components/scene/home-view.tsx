"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/paths";

export function HomeView() {
  const host = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [fallback, setFallback] = useState("");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const boot = async () => {
      const test = document.createElement("canvas");
      if (!test.getContext("webgl2")) {
        setFallback("WebGL2 در دسترس نیست. از فهرست بخش‌ها می‌توانی وارد آلبوم شوی.");
        return;
      }
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (dead || !host.current) return;
      const view = new THREE.WebGLRenderer({ antialias: true });
      view.outputColorSpace = THREE.SRGBColorSpace;
      view.toneMapping = THREE.ACESFilmicToneMapping;
      view.setClearColor(0x07050f, 1);
      host.current.appendChild(view.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
      camera.position.set(4.2, 1.1, 2.4);
      const controls = new OrbitControls(camera, view.domElement);
      controls.enableDamping = !reduced;
      controls.autoRotate = !reduced;
      controls.autoRotateSpeed = 0.15;
      scene.add(new THREE.AmbientLight(0xc9b6e8, 0.35));
      const sun = new THREE.DirectionalLight(0xfff4e4, 2.4);
      sun.position.set(6, 2, 3);
      scene.add(sun);
      const loader = new THREE.TextureLoader();
      const tex = (file: string) => new Promise<import("three").Texture | null>((resolve) => {
        loader.load(asset(`/textures/${file}`), (t) => { t.colorSpace = THREE.SRGBColorSpace; resolve(t); }, undefined, () => resolve(null));
      });
      const [day, night, clouds, moonMap] = await Promise.all([tex("earth-day.jpg"), tex("earth-night.jpg"), tex("earth-clouds.jpg"), tex("moon.jpg")]);
      if (dead) return;
      const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshStandardMaterial({ map: day ?? undefined, color: day ? 0xffffff : 0x3d6ea8, roughness: 0.85 }));
      scene.add(earth);
      if (night) earth.add(new THREE.Mesh(new THREE.SphereGeometry(1.002, 64, 48), new THREE.MeshBasicMaterial({ map: night, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })));
      if (clouds) earth.add(new THREE.Mesh(new THREE.SphereGeometry(1.02, 64, 48), new THREE.MeshStandardMaterial({ map: clouds, transparent: true, opacity: 0.4, depthWrite: false })));
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.08, 64, 48), new THREE.MeshBasicMaterial({ color: 0x8eb6ff, transparent: true, opacity: 0.12, side: THREE.BackSide }));
      earth.add(atmo);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), new THREE.MeshStandardMaterial({ map: moonMap ?? undefined, color: 0xcccccc, roughness: 1 }));
      moon.position.set(2.3, 0.25, -0.4);
      scene.add(moon);
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff8fc2 }));
      marker.position.set(-3.2, 1.6, -2.2);
      scene.add(marker);
      const hit = (event: PointerEvent) => {
        const rect = view.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(x, y), camera);
        if (ray.intersectObject(marker).length) router.push("/yasin-niyayesh/");
      };
      view.domElement.addEventListener("pointerdown", hit);
      const resize = () => {
        const w = host.current?.clientWidth ?? 1;
        const h = host.current?.clientHeight ?? 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        view.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
        view.setSize(w, h, false);
      };
      resize();
      window.addEventListener("resize", resize);
      let last = performance.now();
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!reduced) earth.rotation.y += dt * 0.05;
        controls.update();
        view.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      const stop = () => {
        cancelAnimationFrame(frame);
        view.domElement.removeEventListener("pointerdown", hit);
        window.removeEventListener("resize", resize);
        view.dispose();
        view.domElement.remove();
      };
      if (dead) stop();
      else (host.current as HTMLDivElement & { _stop?: () => void })._stop = stop;
    };
    boot();
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      const stop = (el as HTMLDivElement & { _stop?: () => void })._stop;
      stop?.();
    };
  }, [router]);

  return (
    <div className="stage stage-full" ref={host}>
      <div className="overlay-copy panel">
        <h1>نیایش جانم، این آلبوم کل جهان رو برای توئه. هر جا دلت خواست برو.</h1>
        <p className="lede">زمین و ماه اینجاست. سیاره‌ها، قمرها و ستاره‌ها در آلبوم فهرست شده‌اند.</p>
        <nav className="album-links" aria-label="بخش‌های آلبوم">
          <Link href="/catalog/#planets">سیاره‌ها</Link>
          <Link href="/catalog/#moons">قمرها</Link>
          <Link href="/catalog/#stars">ستاره‌ها</Link>
          <Link href="/catalog/#systems">سامانه‌ها</Link>
          <Link href="/catalog/">همه‌ی آلبوم</Link>
        </nav>
      </div>
      {fallback && <p className="hud panel">{fallback}</p>}
    </div>
  );
}
