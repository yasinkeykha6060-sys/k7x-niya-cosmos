"use client";

import { useEffect, useRef, useState } from "react";
import { craftParts, type CraftPart } from "@/lib/craft-parts";

export function CraftScene({ slug, category, kind }: { slug: string; category: string; kind?: "ascent" | "landing" | "flybys" }) {
  const host = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(true);
  const [picked, setPicked] = useState("");
  const playRef = useRef(true);
  playRef.current = play;
  const parts = craftParts(slug, category);

  useEffect(() => {
    const model = craftParts(slug, category);
    const el = host.current;
    if (!el) return;
    let dead = false;
    let frame = 0;
    const boot = async () => {
      if (!document.createElement("canvas").getContext("webgl2")) return;
      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (dead || !host.current) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x07050f, 1);
      host.current.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 80);
      camera.position.set(3.2, 1.8, 4.2);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      scene.add(new THREE.AmbientLight(0xc9b6e8, 0.55));
      const key = new THREE.DirectionalLight(0xfff4e6, 2.2);
      key.position.set(4, 6, 3);
      scene.add(key);
      const root = new THREE.Group();
      scene.add(root);
      const meshes: { mesh: import("three").Mesh; part: CraftPart; base: import("three").Vector3 }[] = [];
      for (const part of model) {
        let geo: import("three").BufferGeometry;
        if (part.shape === "box") geo = new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]);
        else if (part.shape === "sphere") geo = new THREE.SphereGeometry(part.size[0], 20, 14);
        else if (part.shape === "cone") geo = new THREE.ConeGeometry(part.size[0], part.size[1], 18);
        else geo = new THREE.CylinderGeometry(part.size[0], part.size[1] ?? part.size[0], part.size[2] ?? 1, 20);
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: part.color, roughness: 0.62, metalness: 0.18 }));
        mesh.position.set(...part.pos);
        if (part.rot) mesh.rotation.set(...part.rot);
        mesh.userData.name = part.name;
        root.add(mesh);
        meshes.push({ mesh, part, base: mesh.position.clone() });
      }
      const planet = kind === "flybys" || kind === "landing"
        ? new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 18), new THREE.MeshStandardMaterial({ color: kind === "landing" ? "#c1440e" : "#c7a37a", roughness: 1 }))
        : null;
      if (planet) {
        planet.position.set(kind === "landing" ? 0 : 3.2, kind === "landing" ? -1.3 : 0, 0);
        scene.add(planet);
      }
      const ray = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const onClick = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(meshes.map((item) => item.mesh), false)[0];
        setPicked(typeof hit?.object.userData.name === "string" ? hit.object.userData.name : "");
      };
      renderer.domElement.addEventListener("pointerdown", onClick);
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
      let t = 0;
      const loop = () => {
        frame = requestAnimationFrame(loop);
        if (document.hidden) return;
        if (playRef.current) t += 0.006;
        const phase = (t % 4);
        meshes.forEach(({ mesh, part, base }) => {
          mesh.position.copy(base);
          if (kind === "ascent" && phase > part.stage) mesh.position.y -= (phase - part.stage) * 0.85;
          if (kind === "landing") {
            root.position.y = 1.6 - Math.min(phase, 2.2) * 0.7;
            if (part.stage === 1 && phase > 1.2) mesh.position.y -= (phase - 1.2) * 0.8;
            if (part.stage === 2 && phase > 2.2) mesh.position.y += (phase - 2.2) * 0.9;
          }
          if (kind === "flybys") root.position.x = -2.4 + (phase / 4) * 5;
        });
        if (!kind) root.rotation.y += 0.002;
        controls.update();
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      const stop = () => {
        cancelAnimationFrame(frame);
        renderer.domElement.removeEventListener("pointerdown", onClick);
        window.removeEventListener("resize", resize);
        controls.dispose();
        renderer.dispose();
        scene.traverse((obj) => {
          const mesh = obj as import("three").Mesh;
          mesh.geometry?.dispose();
          const material = mesh.material as import("three").Material | undefined;
          material?.dispose();
        });
        renderer.domElement.remove();
      };
      if (dead) stop();
      else (el as HTMLDivElement & { _stop?: () => void })._stop = stop;
    };
    boot();
    return () => {
      dead = true;
      (el as HTMLDivElement & { _stop?: () => void })._stop?.();
    };
  }, [slug, category, kind]);

  return (
    <section>
      <div className="stage stage-body" ref={host} aria-label="مدل فضاپیما" />
      <p className="meta">بازسازی با کد از روی پیکره‌ی شناخته‌شده. اندازه‌ی قطعه‌ها مقیاس مهندسی نیست. روی هر قطعه بزن تا نامش بیاید.</p>
      {picked && <p>قطعه: {picked}</p>}
      <ul>{parts.map((part, index) => <li key={`${part.name}-${index}`}>{part.name}</li>)}</ul>
      <button className="btn" type="button" onClick={() => setPlay((v) => !v)}>{play ? "مکث" : "پخش"}</button>
    </section>
  );
}
