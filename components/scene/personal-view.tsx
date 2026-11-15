"use client";

import { useEffect, useRef, useState } from "react";
import personal from "@/data/personal.json";

export function PersonalView() {
  const host = useRef<HTMLDivElement>(null);
  const [ocean, setOcean] = useState(0.52);
  const [clouds, setClouds] = useState(0.45);
  const [spin, setSpin] = useState(1);
  const [tint, setTint] = useState("#1d4e89");
  const oceanRef = useRef(ocean);
  const cloudRef = useRef(clouds);
  const spinRef = useRef(spin);
  const tintRef = useRef(tint);
  oceanRef.current = ocean;
  cloudRef.current = clouds;
  spinRef.current = spin;
  tintRef.current = tint;
  const year = Math.sqrt((personal.semiMajorAxisAu ** 3) / personal.starMassSun);

  useEffect(() => {
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
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      host.current.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 80);
      camera.position.set(0, 1.4, 4.2);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffd2a1 }));
      star.position.set(-2.4, 0, 0);
      scene.add(star);
      const uniforms = {
        ocean: { value: 0.52 },
        clouds: { value: 0.45 },
        tint: { value: new THREE.Color("#1d4e89") },
        time: { value: 0 },
      };
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(1, 64, 48),
        new THREE.ShaderMaterial({
          uniforms,
          vertexShader: "varying vec3 vP; varying vec3 vN; void main(){ vP=position; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
          fragmentShader: `
            varying vec3 vP; varying vec3 vN;
            uniform float ocean; uniform float clouds; uniform vec3 tint; uniform float time;
            float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
            float noise(vec3 p){ vec3 i=floor(p); vec3 f=fract(p); f=f*f*(3.0-2.0*f); float n=mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); return n; }
            void main(){
              vec3 p = normalize(vP);
              float n = noise(p*3.0)+0.5*noise(p*6.0);
              float land = smoothstep(ocean, ocean+0.08, n);
              vec3 sea = tint;
              vec3 ground = mix(vec3(0.22,0.32,0.16), vec3(0.45,0.36,0.22), noise(p*8.0));
              float ice = smoothstep(0.72, 0.9, abs(p.y));
              vec3 col = mix(sea, ground, land);
              col = mix(col, vec3(0.92,0.95,0.98), ice);
              float cloud = smoothstep(0.55, 0.8, noise(p*4.0+vec3(time,0.0,0.0))) * clouds;
              col = mix(col, vec3(1.0), cloud);
              float fres = pow(1.0 - max(dot(normalize(vN), vec3(0.0,0.0,1.0)), 0.0), 2.2);
              col += vec3(0.45,0.65,1.0) * fres * 0.45;
              gl_FragColor = vec4(col, 1.0);
            }
          `,
        }),
      );
      planet.rotation.z = (personal.obliquityDeg * Math.PI) / 180;
      scene.add(planet);
      const moonA = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 1 }));
      const moonB = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshStandardMaterial({ color: 0xb9b1a4, roughness: 1 }));
      scene.add(moonA, moonB);
      scene.add(new THREE.AmbientLight(0xffffff, 0.25));
      const sun = new THREE.PointLight(0xffe0c2, 18, 0, 2);
      sun.position.copy(star.position);
      scene.add(sun);
      const resize = () => {
        const w = host.current?.clientWidth ?? 1;
        const h = host.current?.clientHeight ?? 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
        renderer.setSize(w, h, false);
      };
      resize();
      window.addEventListener("resize", resize);
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (document.hidden) return;
        uniforms.ocean.value = oceanRef.current;
        uniforms.clouds.value = cloudRef.current;
        uniforms.tint.value.set(tintRef.current);
        uniforms.time.value = now * 0.00005 * spinRef.current;
        planet.rotation.y = now * 0.0002 * spinRef.current;
        moonA.position.set(Math.cos(now * 0.0004) * 1.7, 0.1, Math.sin(now * 0.0004) * 1.7);
        moonB.position.set(Math.cos(now * 0.00025 + 1) * 2.15, -0.05, Math.sin(now * 0.00025 + 1) * 2.15);
        controls.update();
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      const stop = () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); renderer.dispose(); renderer.domElement.remove(); };
      if (dead) stop();
      else (el as HTMLDivElement & { _stop?: () => void })._stop = stop;
    };
    boot();
    return () => { dead = true; (el as HTMLDivElement & { _stop?: () => void })._stop?.(); };
  }, []);

  const certificate = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 900;
    const g = canvas.getContext("2d");
    if (!g) return;
    g.fillStyle = "#0d0a24";
    g.fillRect(0, 0, 1400, 900);
    g.strokeStyle = "#c9a7ff";
    g.strokeRect(40, 40, 1320, 820);
    g.fillStyle = "#f4eef8";
    g.font = "56px Tahoma";
    g.fillText(personal.planetName, 120, 220);
    g.font = "28px Tahoma";
    g.fillStyle = "#ffd27a";
    g.fillText(personal.disclaimer, 120, 290);
    g.fillStyle = "#f4eef8";
    g.fillText(`${personal.planetDesignation}  ·  ${personal.starName}  ·  ${personal.designation}`, 120, 380);
    g.fillText(personal.discoverers, 120, 450);
    g.fillText(personal.discoveryDate, 120, 510);
    g.fillText(personal.message, 120, 620);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "yn-001.png";
    a.click();
  };

  return (
    <div className="page">
      <h1>{personal.planetName}</h1>
      <p className="lede">{personal.disclaimer}</p>
      <p>{personal.message}</p>
      <p>کد <bdi className="num">{personal.planetDesignation}</bdi> به گرد ستاره‌ی {personal.starName} (<bdi className="num">{personal.designation}</bdi>). رده‌ی فرضی ستاره {personal.starClass}. دوره‌ی گردش از قانون سوم کپلر با جرم {personal.starMassSun} برابر خورشید و نیم‌قطر {personal.semiMajorAxisAu} واحد نجومی: <bdi className="num">{year.toFixed(3)}</bdi> سال. این عدد محاسبه است، نه رصد.</p>
      <div className="stage" ref={host} />
      <div className="grid" style={{ marginTop: 12 }}>
        <label>سطح اقیانوس <input type="range" min="0.3" max="0.75" step="0.01" value={ocean} onChange={(e) => setOcean(Number(e.target.value))} /></label>
        <label>ابر <input type="range" min="0" max="1" step="0.01" value={clouds} onChange={(e) => setClouds(Number(e.target.value))} /></label>
        <label>سرعت چرخش <input type="range" min="0" max="3" step="0.1" value={spin} onChange={(e) => setSpin(Number(e.target.value))} /></label>
        <label>رنگ دریا <input type="color" value={tint} onChange={(e) => setTint(e.target.value)} /></label>
        <button className="btn" type="button" onClick={() => { setOcean(0.52); setClouds(0.45); setSpin(1); setTint("#1d4e89"); }}>بازگشت به پیش‌فرض</button>
        <button className="btn" type="button" onClick={certificate}>گواهی کشف</button>
      </div>
    </div>
  );
}
