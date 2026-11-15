"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/paths";

export type GlobeProps = {
  texture?: string;
  night?: string;
  clouds?: string;
  ring?: "saturn" | "faint";
  tilt?: number;
  spinHours?: number;
  color?: string;
  emissive?: boolean;
  axes?: [number, number, number];
  cluster?: boolean;
  note: string;
};

const FALLBACK = "WebGL2 در دسترس نیست. این صفحه بدون کره‌ی چرخان باز می‌ماند.";

export function GlobeView(props: GlobeProps) {
  const host = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState("");
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let frame = 0;
    const boot = async () => {
      if (!document.createElement("canvas").getContext("webgl2")) {
        setFallback(FALLBACK);
        return;
      }
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (dead || !host.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setClearColor(0x07050f, 1);
      host.current.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 40);
      camera.position.set(0.4, 0.7, 3.3);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !reduced;
      controls.autoRotate = !reduced;
      controls.autoRotateSpeed = 0.35;
      controls.minDistance = 1.6;
      controls.maxDistance = 8;
      scene.add(new THREE.AmbientLight(0xc9b6e8, 0.45));
      const sun = new THREE.DirectionalLight(0xfff4e4, 2.2);
      sun.position.set(5, 2, 4);
      scene.add(sun);

      const loader = new THREE.TextureLoader();
      const loadTex = (file?: string) => new Promise<import("three").Texture | null>((resolve) => {
        if (!file) return resolve(null);
        loader.load(asset(`/textures/${file}`), (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          resolve(tex);
        }, undefined, () => resolve(null));
      });

      const spec = propsRef.current;
      const [map, night, clouds] = await Promise.all([loadTex(spec.texture), loadTex(spec.night), loadTex(spec.clouds)]);
      if (dead) {
        map?.dispose(); night?.dispose(); clouds?.dispose();
        return;
      }
      const tint = new THREE.Color(spec.color ?? "#b7b3ae");
      const group = new THREE.Group();
      group.rotation.z = THREE.MathUtils.degToRad(spec.tilt ?? 0);
      scene.add(group);

      if (spec.cluster) {
        const mat = new THREE.MeshBasicMaterial({ color: 0xfff4e6 });
        for (let i = 0; i < 7; i += 1) {
          const star = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.16 : 0.07, 16, 12), mat);
          const ang = (i / 7) * Math.PI * 2;
          star.position.set(Math.cos(ang) * (0.35 + (i % 3) * 0.12), Math.sin(ang * 1.7) * 0.28, Math.sin(ang) * 0.2);
          group.add(star);
        }
      } else {
        const material = spec.emissive
          ? new THREE.MeshBasicMaterial({ map: map ?? undefined, color: map ? 0xffffff : tint })
          : new THREE.MeshStandardMaterial({ map: map ?? undefined, color: map ? 0xffffff : tint, roughness: 0.92, metalness: 0 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), material);
        if (spec.axes) {
          const max = Math.max(...spec.axes);
          mesh.scale.set(spec.axes[0] / max, spec.axes[2] / max, spec.axes[1] / max);
        }
        group.add(mesh);
        if (night) {
          mesh.add(new THREE.Mesh(new THREE.SphereGeometry(1.002, 64, 48), new THREE.MeshBasicMaterial({ map: night, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85, depthWrite: false })));
        }
        if (clouds) {
          mesh.add(new THREE.Mesh(new THREE.SphereGeometry(1.02, 64, 48), new THREE.MeshStandardMaterial({ map: clouds, transparent: true, opacity: 0.42, depthWrite: false })));
        }
        if (spec.emissive) {
          const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color: tint, transparent: true, opacity: 0.28, depthWrite: false }));
          glow.scale.set(3.2, 3.2, 1);
          mesh.add(glow);
        } else if (spec.texture === "earth-day.jpg" || spec.texture === "venus.jpg" || spec.texture === "mars.jpg") {
          const haze = spec.texture === "venus.jpg" ? 0xe6d3a3 : spec.texture === "mars.jpg" ? 0xc47a62 : 0x8eb6ff;
          mesh.add(new THREE.Mesh(new THREE.SphereGeometry(1.06, 48, 32), new THREE.MeshBasicMaterial({ color: haze, transparent: true, opacity: 0.12, side: THREE.BackSide })));
        }
        if (spec.ring === "saturn") {
          const ringTex = await loadTex("saturn-ring.png");
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(1.25, 2.25, 96),
            new THREE.ShaderMaterial({
              transparent: true,
              side: THREE.DoubleSide,
              depthWrite: false,
              uniforms: { map: { value: ringTex } },
              vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
              fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main(){ float a=texture2D(map, vec2(vUv.y, 0.5)).a; gl_FragColor=vec4(vec3(0.86,0.8,0.7), a*0.92); }",
            }),
          );
          ring.rotation.x = Math.PI / 2;
          mesh.add(ring);
        }
        if (spec.ring === "faint") {
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(1.45, 1.8, 64),
            new THREE.MeshBasicMaterial({ color: 0xd9d3ea, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
          );
          ring.rotation.x = Math.PI / 2;
          mesh.add(ring);
        }
      }

      const resize = () => {
        const w = host.current?.clientWidth ?? 1;
        const h = host.current?.clientHeight ?? 1;
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
        renderer.setSize(w, h, false);
      };
      resize();
      window.addEventListener("resize", resize);
      let last = performance.now();
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const hours = propsRef.current.spinHours;
        if (!reduced && hours) {
          const pace = 0.12 * Math.min(2.4, Math.sqrt(24 / Math.max(0.4, Math.abs(hours))));
          group.rotateY(dt * pace * Math.sign(hours));
        }
        controls.update();
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      const stop = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", resize);
        controls.dispose();
        renderer.dispose();
        scene.traverse((obj) => {
          const mesh = obj as import("three").Mesh;
          mesh.geometry?.dispose();
          const material = mesh.material as import("three").Material | import("three").Material[] | undefined;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material?.dispose();
        });
        map?.dispose(); night?.dispose(); clouds?.dispose();
        renderer.domElement.remove();
      };
      if (dead) stop();
      else (el as HTMLDivElement & { _stop?: () => void })._stop = stop;
    };
    boot();
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      (el as HTMLDivElement & { _stop?: () => void })._stop?.();
    };
  }, []);

  return (
    <div className="stage stage-body" ref={host} aria-label="مدل سه‌بعدی">
      {fallback ? <p className="overlay-copy panel">{fallback}</p> : null}
      <p className="hud panel">{props.note}</p>
    </div>
  );
}

const TONE: Record<string, string> = {
  pluto: "#c4b4a2",
  charon: "#b7b7b7",
  ceres: "#8d8a84",
  haumea: "#e7e4de",
  makemake: "#c47a62",
  eris: "#f3f1ee",
  halley: "#4a463f",
};

export function bodyGlobeNote(slug: string, texture?: string): { color?: string; note: string } {
  if (slug === "phobos" || slug === "deimos") {
    return { note: "موزاییک وایکینگ، Caltech/JPL/USGS. روی کره نشسته؛ شکل واقعی نامنظم است. بچرخان." };
  }
  if (texture) return { note: "نقشه‌ی سطح. چرخش برای دیدن است و دوره‌ی واقعی در جدول پایین است." };
  return {
    color: TONE[slug] ?? "#9a948c",
    note: "نقشه‌ی سطح با پروانه‌ی روشن در این نسخه نیست. کره فقط جسم را نشان می‌دهد، نه عوارض.",
  };
}
