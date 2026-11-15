"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/paths";
import { usePrefs } from "@/components/ui/prefs";

const WORLDS = [
  { slug: "mercury", body: "Mercury", km: 2439.7, tex: "mercury.jpg", tilt: 0.034, hours: 1407.6, color: 0xb1a89a },
  { slug: "venus", body: "Venus", km: 6051.8, tex: "venus.jpg", tilt: 177.36, hours: -5832.6, color: 0xe6d3a3 },
  { slug: "earth", body: "Earth", km: 6371, tex: "earth-day.jpg", night: "earth-night.jpg", clouds: "earth-clouds.jpg", tilt: 23.44, hours: 23.9345, color: 0x3d6ea8 },
  { slug: "mars", body: "Mars", km: 3389.5, tex: "mars.jpg", tilt: 25.19, hours: 24.6229, color: 0xc1440e },
  { slug: "jupiter", body: "Jupiter", km: 69911, tex: "jupiter.jpg", tilt: 3.13, hours: 9.925, color: 0xc7a37a, faintRing: true },
  { slug: "saturn", body: "Saturn", km: 58232, tex: "saturn.jpg", tilt: 26.73, hours: 10.656, color: 0xe6d7a8, saturnRing: true },
  { slug: "uranus", body: "Uranus", km: 25362, tex: "uranus.jpg", tilt: 97.77, hours: -17.24, color: 0x9fd6d6, faintRing: true },
  { slug: "neptune", body: "Neptune", km: 24622, tex: "neptune.jpg", tilt: 28.32, hours: 16.11, color: 0x3d5a99, faintRing: true },
  { slug: "pluto", body: "Pluto", km: 1188, tex: "", tilt: 119.51, hours: -153.3, color: 0xc4b4a2 },
] as const;

const NAMES: Record<(typeof WORLDS)[number]["slug"], string> = {
  mercury: "تیر",
  venus: "ناهید",
  earth: "زمین",
  mars: "مریخ",
  jupiter: "مشتری",
  saturn: "زحل",
  uranus: "اورانوس",
  neptune: "نپتون",
  pluto: "پلوتون",
};

type Mode = "real" | "nav";

export function SystemView() {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const { quality } = usePrefs();
  const [fallback, setFallback] = useState("");
  const [mode, setMode] = useState<Mode>("real");
  const [orbits, setOrbits] = useState(true);
  const [focus, setFocus] = useState("earth");
  const clock = useRef<HTMLElement>(null);
  const modeRef = useRef<Mode>("real");
  const orbitsRef = useRef(true);
  const focusRef = useRef("earth");
  const rateRef = useRef(86400);
  const dateRef = useRef(Date.now());
  const qualityRef = useRef(quality);
  modeRef.current = mode;
  orbitsRef.current = orbits;
  focusRef.current = focus;
  qualityRef.current = quality;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let frame = 0;
    const disposers: Array<() => void> = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const boot = async () => {
      const canvas = document.createElement("canvas");
      if (!canvas.getContext("webgl2")) {
        setFallback("این دستگاه WebGL2 ندارد. فهرست سیاره‌ها همچنان از همین صفحه باز می‌شود.");
        return;
      }
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      const A = await import("astronomy-engine");
      if (dead || !host.current) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setClearColor(0x05040c, 1);
      host.current.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.00001, 5000);
      camera.position.set(0, 18, 36);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !reduced;
      controls.dampingFactor = 0.08;
      controls.target.set(12, 0, 0);

      scene.add(new THREE.AmbientLight(0x9aa4c7, 0.08));
      const sunLight = new THREE.PointLight(0xfff1d6, 80, 0, 2);
      scene.add(sunLight);

      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(1800 * 3);
      for (let i = 0; i < 1800; i += 1) {
        const r = 800;
        const u = Math.random();
        const v = Math.random();
        const th = 2 * Math.PI * u;
        const ph = Math.acos(2 * v - 1);
        starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        starPos[i * 3 + 1] = r * Math.cos(ph);
        starPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xfff4e6, size: 0.7, sizeAttenuation: false })));

      const loader = new THREE.TextureLoader();
      const loadTex = (file: string) => new Promise<import("three").Texture | null>((resolve) => {
        if (!file) return resolve(null);
        loader.load(asset(`/textures/${file}`), (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          resolve(tex);
        }, undefined, () => resolve(null));
      });

      const sunTex = await loadTex("sun.jpg");
      const sun = new THREE.Mesh(
        new THREE.SphereGeometry(1, 48, 32),
        new THREE.MeshBasicMaterial({ map: sunTex ?? undefined, color: sunTex ? 0xffffff : 0xffd27a }),
      );
      scene.add(sun);
      const corona = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffe1b0, transparent: true, opacity: 0.35, depthWrite: false }));
      corona.scale.set(6, 6, 1);
      sun.add(corona);

      type Item = {
        slug: string;
        body: string;
        pivot: import("three").Group;
        mesh: import("three").Mesh;
        km: number;
        hours: number;
        orbit?: import("three").Line;
      };
      const items: Item[] = [];
      for (const world of WORLDS) {
        const [map, night, clouds] = await Promise.all([loadTex(world.tex), loadTex("night" in world ? world.night : ""), loadTex("clouds" in world ? world.clouds : "")]);
        const mat = world.slug === "earth" && map
          ? new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0 })
          : new THREE.MeshStandardMaterial({ map: map ?? undefined, color: map ? 0xffffff : world.color, roughness: 0.9, metalness: 0.02 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), mat);
        mesh.rotation.z = THREE.MathUtils.degToRad(world.tilt);
        const pivot = new THREE.Group();
        pivot.add(mesh);
        if (night) {
          const lights = new THREE.Mesh(new THREE.SphereGeometry(1.001, 48, 32), new THREE.MeshBasicMaterial({ map: night, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.9, depthWrite: false }));
          mesh.add(lights);
        }
        if (clouds) {
          const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.012, 48, 32), new THREE.MeshStandardMaterial({ map: clouds, transparent: true, opacity: 0.45, depthWrite: false }));
          mesh.add(cloud);
        }
        if ("saturnRing" in world && world.saturnRing) {
          const ringTex = await loadTex("saturn-ring.png");
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(1.2, 2.3, 96),
            new THREE.ShaderMaterial({
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: false,
              uniforms: { map: { value: ringTex } },
              vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
              fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main(){ float a = texture2D(map, vec2(vUv.y, 0.5)).a; gl_FragColor=vec4(vec3(0.86,0.8,0.7), a*0.92); }",
            }),
          );
          ring.rotation.x = Math.PI / 2;
          mesh.add(ring);
        }
        if ("faintRing" in world && world.faintRing) {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(1.5, 1.85, 64),
            new THREE.MeshBasicMaterial({ color: 0xd9d3ea, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }),
          );
          ring.rotation.x = Math.PI / 2;
          mesh.add(ring);
        }
        const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
        const pts = curve.getPoints(128).map((p) => new THREE.Vector3(p.x, 0, p.y));
        const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xc9a7ff, transparent: true, opacity: 0.35 }));
        scene.add(orbit);
        scene.add(pivot);
        items.push({ slug: world.slug, body: world.body, pivot, mesh, km: world.km, hours: world.hours, orbit });
      }

      const moonTex = await loadTex("moon.jpg");
      const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshStandardMaterial({ map: moonTex ?? undefined, color: moonTex ? 0xffffff : 0xc8c8c8, roughness: 1 }));
      scene.add(moon);

      const belt = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 4, 3), new THREE.MeshStandardMaterial({ color: 0x9a907f, roughness: 1 }), 900);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 900; i += 1) {
        const au = 2.15 + Math.random() * 1.15;
        const ang = Math.random() * Math.PI * 2;
        const c = Math.log1p(au) / Math.log1p(40);
        const radius = 4 + c * 78;
        dummy.position.set(Math.cos(ang) * radius, (Math.random() - 0.5) * 0.15, Math.sin(ang) * radius);
        dummy.scale.setScalar(0.02);
        dummy.updateMatrix();
        belt.setMatrixAt(i, dummy.matrix);
      }
      scene.add(belt);

      const place = (x: number, yEq: number, zEq: number) => {
        const x3 = x;
        const y3 = zEq;
        const z3 = -yEq;
        const len = Math.hypot(x3, y3, z3) || 1e-6;
        if (modeRef.current === "real") return new THREE.Vector3(x3, y3, z3).multiplyScalar(40);
        const c = Math.log1p(len) / Math.log1p(40);
        return new THREE.Vector3(x3, y3, z3).multiplyScalar((4 + c * 78) / len);
      };
      const rad = (km: number) => {
        const real = (km / A.KM_PER_AU) * 40;
        return modeRef.current === "real" ? real : Math.max(real * 1800, 0.28);
      };

      const ray = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const onClick = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(items.map((item) => item.mesh), false)[0];
        const found = items.find((item) => item.mesh === hit?.object);
        if (found) setFocus(found.slug);
      };
      renderer.domElement.addEventListener("pointerdown", onClick);

      let last = performance.now();
      let fpsLow = 0;
      const resize = () => {
        const w = host.current?.clientWidth ?? 1;
        const h = host.current?.clientHeight ?? 1;
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
        const q = qualityRef.current;
        const ratio = q === "low" ? 0.75 : q === "medium" ? 1 : q === "high" ? Math.min(1.75, window.devicePixelRatio || 1) : Math.min(1.25, window.devicePixelRatio || 1);
        renderer.setPixelRatio(ratio);
        renderer.setSize(w, h, false);
      };
      resize();
      window.addEventListener("resize", resize);

      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!reduced) dateRef.current += dt * rateRef.current * 1000;
        const date = new Date(dateRef.current);
        if (clock.current) clock.current.textContent = date.toISOString().slice(0, 16).replace("T", " ");
        sun.scale.setScalar(rad(695700));
        for (const item of items) {
          const body = (A.Body as unknown as Record<string, import("astronomy-engine").Body>)[item.body];
          const v = A.HelioVector(body, date);
          item.pivot.position.copy(place(v.x, v.y, v.z));
          const r = rad(item.km);
          item.mesh.scale.setScalar(r);
          item.mesh.rotateY(dt * ((Math.PI * 2) / (Math.abs(item.hours) * 3600)) * Math.sign(item.hours || 1) * (reduced ? 0 : 1));
          if (item.orbit) {
            item.orbit.visible = orbitsRef.current;
            const dist = item.pivot.position.length() || 1;
            item.orbit.scale.setScalar(dist);
          }
        }
        const earth = items.find((item) => item.slug === "earth");
        const moonVec = A.GeoMoon(date);
        if (earth) {
          const earthAu = A.HelioVector(A.Body.Earth, date);
          const earthPos = place(earthAu.x, earthAu.y, earthAu.z);
          const rel = place(moonVec.x, moonVec.y, moonVec.z);
          moon.scale.setScalar(rad(1737.4));
          moon.position.copy(earthPos).add(modeRef.current === "nav" ? rel.clone().normalize().multiplyScalar(Math.max(rad(6371) * 5, 1.4)) : rel);
        }
        belt.visible = modeRef.current === "nav";
        const target = items.find((item) => item.slug === focusRef.current) ?? earth;
        if (target && !reduced) {
          controls.target.lerp(target.pivot.position, 0.08);
        }
        controls.update();
        renderer.render(scene, camera);
        const fps = 1 / Math.max(dt, 0.001);
        if (qualityRef.current === "auto" && fps < 28) fpsLow += 1;
        else fpsLow = 0;
        if (fpsLow > 45) {
          renderer.setPixelRatio(0.8);
          fpsLow = 0;
        }
        if (labels.current && target) {
          labels.current.textContent = modeRef.current === "real" ? "مقیاس واقعی" : "مقیاس ناوبری";
        }
      };
      frame = requestAnimationFrame(loop);
      disposers.push(() => {
        cancelAnimationFrame(frame);
        renderer.domElement.removeEventListener("pointerdown", onClick);
        window.removeEventListener("resize", resize);
        renderer.dispose();
        scene.traverse((obj) => {
          const mesh = obj as import("three").Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const material = mesh.material as import("three").Material | import("three").Material[] | undefined;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material?.dispose();
        });
        renderer.domElement.remove();
      });
    };
    boot();
    return () => {
      dead = true;
      disposers.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="stage" ref={host} aria-label="منظومه‌ی شمسی">
      {fallback && <div className="overlay-copy panel"><p>{fallback}</p></div>}
      <div className="hud panel" ref={labels}>
        <div className="meta"><bdi className="num" ref={clock}>UTC</bdi></div>
        <label>نگاه<select value={focus} onChange={(e) => setFocus(e.target.value)}>{WORLDS.map((w) => <option key={w.slug} value={w.slug}>{NAMES[w.slug]}</option>)}</select></label>
        <Link className="btn" href={focus === "pluto" ? "/dwarf-planets/pluto/" : `/planets/${focus}/`}>صفحه‌ی جرم</Link>
      </div>
      <div className="timebar panel">
        <button className="btn" type="button" onClick={() => { dateRef.current = Date.now(); rateRef.current = 1; }}>اکنون</button>
        <button className="btn" type="button" onClick={() => { modeRef.current = mode === "real" ? "nav" : "real"; setMode(mode === "real" ? "nav" : "real"); }}>{mode === "real" ? "مقیاس واقعی" : "مقیاس ناوبری"}</button>
        <button className="btn" type="button" onClick={() => { orbitsRef.current = !orbits; setOrbits(!orbits); }}>{orbits ? "مدارها روشن" : "مدارها خاموش"}</button>
        {[1, 60, 3600, 86400, 86400 * 30].map((rate) => (
          <button key={rate} className="btn" type="button" onClick={() => { rateRef.current = rate; }}>{rate === 1 ? "۱×" : rate === 60 ? "دقیقه" : rate === 3600 ? "ساعت" : rate === 86400 ? "روز" : "ماه"}</button>
        ))}
        <button className="btn" type="button" onClick={() => { rateRef.current = -Math.abs(rateRef.current || 86400); }}>عقب</button>
        <input type="date" onChange={(e) => { if (e.target.value) dateRef.current = new Date(`${e.target.value}T12:00:00Z`).getTime(); }} />
      </div>
    </div>
  );
}
