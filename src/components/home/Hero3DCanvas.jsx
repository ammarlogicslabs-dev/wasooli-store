import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

// 10 Vector SVG strings for the Wasooli Store Navigation Items
const NAV_SVG_STRINGS = [
  // 1. Routing
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="rb" x1="2" y1="14" x2="30" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#2c9aff"/><stop offset="50%" stop-color="#1676d2"/><stop offset="100%" stop-color="#0d47a1"/></linearGradient><linearGradient id="ra" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><path d="M4 6a14 14 0 0 1 6-4" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/><path d="M22 2a14 14 0 0 1 6 4" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" opacity="0.85"/><line x1="8" y1="5" x2="8" y2="17" stroke="url(#ra)" stroke-width="2.4" stroke-linecap="round"/><circle cx="8" cy="4.5" r="1.8" fill="#38bdf8"/><line x1="24" y1="5" x2="24" y2="17" stroke="url(#ra)" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="4.5" r="1.8" fill="#38bdf8"/><line x1="16" y1="7" x2="16" y2="17" stroke="url(#ra)" stroke-width="2.2" stroke-linecap="round"/><circle cx="16" cy="6.5" r="1.6" fill="#67e8f9"/><rect x="2.5" y="16.5" width="27" height="11" rx="4" fill="#0c2d58" opacity="0.3"/><rect x="2" y="15" width="28" height="11.5" rx="3.5" fill="url(#rb)"/><path d="M4 16.5h24" stroke="#7ec4ff" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/><rect x="5" y="21.5" width="22" height="2.5" rx="1.2" fill="#0a2a50" opacity="0.6"/><circle cx="7.5" cy="22.7" r="1" fill="#4ade80"/><circle cx="11.5" cy="22.7" r="1" fill="#4ade80"/><circle cx="15.5" cy="22.7" r="1" fill="#38bdf8"/><circle cx="19.5" cy="22.7" r="1" fill="#38bdf8"/><rect x="22.5" y="22.1" width="3.5" height="1.2" rx="0.6" fill="#67e8f9"/></svg>`,
  // 2. Switching
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="sb" x1="1" y1="8" x2="31" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#4338ca"/><stop offset="45%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient><linearGradient id="sp" x1="4" y1="12" x2="28" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs><rect x="1.5" y="9" width="29" height="15" rx="3.5" fill="url(#sb)"/><rect x="3.5" y="11.5" width="25" height="10" rx="2" fill="url(#sp)"/><path d="M3.5 10.2h25" stroke="#93c5fd" stroke-width="1" stroke-linecap="round" opacity="0.6"/><circle cx="7.1" cy="13.2" r="0.75" fill="#4ade80"/><rect x="5.5" y="15" width="3.2" height="4.5" rx="0.8" fill="#334155"/><line x1="6.3" y1="15.8" x2="7.9" y2="15.8" stroke="#fbbf24" stroke-width="0.8" stroke-linecap="round"/><circle cx="12.1" cy="13.2" r="0.75" fill="#4ade80"/><rect x="10.5" y="15" width="3.2" height="4.5" rx="0.8" fill="#334155"/><line x1="11.3" y1="15.8" x2="12.9" y2="15.8" stroke="#fbbf24" stroke-width="0.8" stroke-linecap="round"/><circle cx="17.1" cy="13.2" r="0.75" fill="#38bdf8"/><rect x="15.5" y="15" width="3.2" height="4.5" rx="0.8" fill="#334155"/><line x1="16.3" y1="15.8" x2="17.9" y2="15.8" stroke="#fbbf24" stroke-width="0.8" stroke-linecap="round"/><circle cx="22.1" cy="13.2" r="0.75" fill="#fbbf24"/><rect x="20.5" y="15" width="3.2" height="4.5" rx="0.8" fill="#334155"/><line x1="21.3" y1="15.8" x2="22.9" y2="15.8" stroke="#fbbf24" stroke-width="0.8" stroke-linecap="round"/><rect x="25" y="14" width="2.6" height="5.5" rx="0.7" fill="#475569" stroke="#60a5fa" stroke-width="0.6"/><circle cx="26.3" cy="13" r="0.6" fill="#a855f7"/><circle cx="2.7" cy="16.5" r="0.8" fill="#94a3b8"/><circle cx="29.3" cy="16.5" r="0.8" fill="#94a3b8"/></svg>`,
  // 3. Wireless
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="wg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#06b6d4"/><stop offset="50%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#2563eb"/></linearGradient><radialGradient id="wc" cx="16" cy="23" r="5" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#67e8f9"/><stop offset="60%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0369a1"/></radialGradient></defs><path d="M3 8a18.5 18.5 0 0 1 26 0" stroke="url(#wg)" stroke-width="3.2" stroke-linecap="round" opacity="0.95"/><path d="M7.5 13a12.5 12.5 0 0 1 17 0" stroke="url(#wg)" stroke-width="3.2" stroke-linecap="round"/><path d="M12 18a6.5 6.5 0 0 1 8 0" stroke="url(#wg)" stroke-width="3.2" stroke-linecap="round"/><circle cx="16" cy="24" r="3.2" fill="url(#wc)"/><circle cx="16" cy="24" r="1.4" fill="#ffffff"/><circle cx="16" cy="24" r="4.8" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2" opacity="0.75"/></svg>`,
  // 4. Network Security
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="ss" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="50%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient><linearGradient id="sg" x1="11" y1="12" x2="21" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs><path d="M16 2.5 5 7.2v8.5c0 7.2 4.7 13.6 11 15.5 6.3-1.9 11-8.3 11-15.5V7.2L16 2.5z" fill="url(#ss)"/><path d="M16 5 7.2 8.8v6.9c0 5.6 3.7 10.8 8.8 12.3 5.1-1.5 8.8-6.7 8.8-12.3V8.8L16 5z" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.7"/><path d="M12.5 14v-2.2a3.5 3.5 0 0 1 7 0V14" stroke="#fef08a" stroke-width="2.2" stroke-linecap="round" fill="none"/><rect x="10.5" y="14" width="11" height="8.5" rx="2" fill="url(#sg)"/><circle cx="16" cy="17.2" r="1.3" fill="#451a03"/><path d="M15.3 17.5 14.8 20.5h2.4l-.5-3z" fill="#451a03"/></svg>`,
  // 5. Optical & Fiber
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="fb" x1="2" y1="10" x2="10" y2="22" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0369a1"/></linearGradient><linearGradient id="fl1" x1="10" y1="16" x2="28" y2="7" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="70%" stop-color="#ec4899"/><stop offset="100%" stop-color="#f43f5e"/></linearGradient><linearGradient id="fl2" x1="10" y1="16" x2="28" y2="25" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="70%" stop-color="#a855f7"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs><rect x="2" y="9.5" width="8" height="13" rx="2.5" fill="url(#fb)"/><rect x="10" y="11.5" width="2.5" height="4" rx="0.6" fill="#cbd5e1"/><rect x="10" y="16.5" width="2.5" height="4" rx="0.6" fill="#cbd5e1"/><path d="M12.5 13.5c4.5 0 5-6 10-6h4" stroke="url(#fl1)" stroke-width="2.6" stroke-linecap="round"/><path d="M12.5 16h14.5" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/><path d="M12.5 18.5c4.5 0 5 6 10 6h4" stroke="url(#fl2)" stroke-width="2.6" stroke-linecap="round"/><circle cx="27" cy="7.5" r="2.5" fill="#f43f5e"/><circle cx="27" cy="7.5" r="1.1" fill="#fff"/><circle cx="27.5" cy="16" r="2.2" fill="#38bdf8"/><circle cx="27.5" cy="16" r="1" fill="#fff"/><circle cx="27" cy="24.5" r="2.5" fill="#8b5cf6"/><circle cx="27" cy="24.5" r="1.1" fill="#fff"/></svg>`,
  // 6. Cabling & Connectivity
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="cb" x1="7" y1="3" x2="25" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="40%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient><linearGradient id="cc" x1="12" y1="20" x2="20" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><path d="M12 20h8v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8z" fill="url(#cc)"/><line x1="12" y1="23.5" x2="20" y2="23.5" stroke="#334155" stroke-width="1"/><line x1="12" y1="26.5" x2="20" y2="26.5" stroke="#334155" stroke-width="1"/><path d="M9.5 4h13v10.5h3v5.5H6.5v-5.5h3V4z" fill="url(#cb)"/><path d="M13 3h6v4.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 13 7.5V3z" fill="#93c5fd" opacity="0.9"/><line x1="11.5" y1="6.5" x2="11.5" y2="11.5" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round"/><line x1="13.5" y1="6.5" x2="13.5" y2="11.5" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round"/><line x1="15.5" y1="6.5" x2="15.5" y2="11.5" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round"/><line x1="17.5" y1="6.5" x2="17.5" y2="11.5" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round"/><line x1="19.5" y1="6.5" x2="19.5" y2="11.5" stroke="#fef08a" stroke-width="1.2" stroke-linecap="round"/><path d="M7 17.5h18" stroke="#60a5fa" stroke-width="1.2" opacity="0.6"/></svg>`,
  // 7. PoE
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="pb" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#1e293b"/><stop offset="50%" stop-color="#0f172a"/><stop offset="100%" stop-color="#020617"/></linearGradient><linearGradient id="pbt" x1="13" y1="5" x2="19" y2="27" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fef08a"/><stop offset="40%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ef4444"/></linearGradient></defs><rect x="4" y="3.5" width="24" height="25" rx="5" fill="url(#pb)" stroke="#38bdf8" stroke-width="1.2"/><rect x="12" y="2" width="8" height="2.5" rx="0.8" fill="#334155"/><rect x="12" y="27.5" width="8" height="2.5" rx="0.8" fill="#334155"/><path d="M17.5 5.5 10 16h5.5l-2.5 10.5 10-12.5h-6l3-8.5z" fill="url(#pbt)"/><circle cx="21" cy="9" r="1" fill="#fef08a"/><circle cx="8" cy="22" r="1" fill="#38bdf8"/></svg>`,
  // 8. Adapters & NICs
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="np" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#059669"/><stop offset="60%" stop-color="#10b981"/><stop offset="100%" stop-color="#047857"/></linearGradient><linearGradient id="nb" x1="2" y1="2" x2="5" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient></defs><rect x="2" y="3" width="3.5" height="26" rx="1.2" fill="url(#nb)"/><rect x="5.5" y="7.5" width="23.5" height="15" rx="2.5" fill="url(#np)"/><rect x="10" y="22.5" width="13" height="3" rx="0.5" fill="#facc15"/><line x1="12" y1="22.5" x2="12" y2="25.5" stroke="#78350f" stroke-width="0.6"/><line x1="14" y1="22.5" x2="14" y2="25.5" stroke="#78350f" stroke-width="0.6"/><line x1="16" y1="22.5" x2="16" y2="25.5" stroke="#78350f" stroke-width="0.6"/><line x1="18" y1="22.5" x2="18" y2="25.5" stroke="#78350f" stroke-width="0.6"/><line x1="20" y1="22.5" x2="20" y2="25.5" stroke="#78350f" stroke-width="0.6"/><rect x="18" y="11" width="7" height="7" rx="1.2" fill="#0f172a" stroke="#475569" stroke-width="0.8"/><circle cx="21.5" cy="14.5" r="1.4" fill="#38bdf8"/><rect x="5" y="10.5" width="6" height="8" rx="1.2" fill="#334155" stroke="#e2e8f0" stroke-width="0.8"/><rect x="6.5" y="12.5" width="3.5" height="4" fill="#0f172a"/></svg>`,
  // 9. Power & Racks
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="rf" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#334155"/><stop offset="50%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect x="4.5" y="2.5" width="23" height="27" rx="3.5" fill="url(#rf)" stroke="#475569" stroke-width="1.2"/><rect x="7" y="5.5" width="18" height="4.5" rx="1" fill="#0f172a" stroke="#38bdf8" stroke-width="0.6"/><circle cx="9.5" cy="7.7" r="1" fill="#4ade80"/><circle cx="12.5" cy="7.7" r="1" fill="#38bdf8"/><line x1="16" y1="7.7" x2="22" y2="7.7" stroke="#475569" stroke-width="1" stroke-linecap="round"/><rect x="7" y="11.5" width="18" height="4.5" rx="1" fill="#0f172a" stroke="#38bdf8" stroke-width="0.6"/><circle cx="9.5" cy="13.7" r="1" fill="#4ade80"/><circle cx="12.5" cy="13.7" r="1" fill="#facc15"/><line x1="16" y1="13.7" x2="22" y2="13.7" stroke="#475569" stroke-width="1" stroke-linecap="round"/><rect x="7" y="17.5" width="18" height="4.5" rx="1" fill="#0f172a" stroke="#f59e0b" stroke-width="0.6"/><circle cx="9.5" cy="19.7" r="1" fill="#ef4444"/><rect x="13" y="18.7" width="3" height="2" rx="0.5" fill="#f59e0b"/><rect x="18" y="18.7" width="5" height="2" rx="0.5" fill="#334155"/><rect x="7" y="23.5" width="18" height="3" rx="0.8" fill="#1e293b"/><line x1="9" y1="25" x2="23" y2="25" stroke="#64748b" stroke-width="1" stroke-dasharray="1.5 1.5"/></svg>`,
  // 10. Tools & Accessories
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32" fill="none"><defs><linearGradient id="tm" x1="8" y1="2" x2="24" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#f1f5f9"/><stop offset="40%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient><linearGradient id="tg" x1="14" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ea580c"/><stop offset="60%" stop-color="#f97316"/><stop offset="100%" stop-color="#c2410c"/></linearGradient></defs><path transform="rotate(45 16 16)" d="M19 3a6 6 0 0 1 6 6v3h-3.5L20 8.5 16 12.5 19.5 16H16V28a3 3 0 0 1-6 0V16h-3.5L10 12.5 14 8.5 10.5 5H14V3h5z" fill="url(#tm)"/><rect x="6" y="18" width="6.5" height="12" rx="2.5" transform="rotate(-45 6 18)" fill="url(#tg)"/><rect x="20" y="18" width="6.5" height="12" rx="2.5" transform="rotate(45 20 18)" fill="url(#tg)"/><circle cx="16" cy="16" r="2.2" fill="#1e293b"/><circle cx="16" cy="16" r="1.1" fill="#f8fafc"/></svg>`,
];

// Helper to generate circular cyber-badge textures containing the 10 NavItem icons
function createNavIconTexturesAndMaterials() {
  const textures = [];
  const materials = [];

  NAV_SVG_STRINGS.forEach((svgStr) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Placeholder dot while image decodes
    ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
    ctx.beginPath();
    ctx.arc(128, 128, 96, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });

    const img = new Image();
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.clearRect(0, 0, 256, 256);

      // 1. Radiant outer neon glow halo
      const glow = ctx.createRadialGradient(128, 128, 50, 128, 128, 126);
      glow.addColorStop(0, "rgba(56, 189, 248, 0.55)");
      glow.addColorStop(0.5, "rgba(14, 165, 233, 0.22)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(128, 128, 126, 0, Math.PI * 2);
      ctx.fill();

      // 2. High-contrast dark sapphire disc backing
      const discGrad = ctx.createRadialGradient(128, 100, 10, 128, 128, 98);
      discGrad.addColorStop(0, "rgba(16, 32, 64, 0.96)");
      discGrad.addColorStop(1, "rgba(8, 17, 36, 0.98)");
      ctx.fillStyle = discGrad;
      ctx.beginPath();
      ctx.arc(128, 128, 96, 0, Math.PI * 2);
      ctx.fill();

      // 3. Glowing electric cyan border ring
      ctx.save();
      ctx.shadowColor = "#00f2fe";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(128, 128, 96, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Render the NavItem icon large & bold (clearly visible)
      ctx.drawImage(img, 44, 44, 168, 168);

      URL.revokeObjectURL(url);
      texture.needsUpdate = true;
    };
    img.src = url;

    textures.push(texture);
    materials.push(material);
  });

  return { textures, materials };
}

export default function Hero3DCanvas({ className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Group for mouse rotation
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 3. Central Holographic Core (Wireframe Icosahedron + Inner Sphere)
    const coreGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x2c9aff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    const innerGeo = new THREE.SphereGeometry(1.4, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // Glowing core center light
    const pointLight = new THREE.PointLight(0x38bdf8, 3, 20);
    pointLight.position.set(0, 0, 0);
    mainGroup.add(pointLight);

    // 4. Orbital Gimbal Rings (Fiber Optic rings)
    const createRing = (radius, tube, color, rotX, rotY) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = rotX;
      ring.rotation.y = rotY;
      return ring;
    };

    const ring1 = createRing(3.4, 0.02, 0x2c9aff, Math.PI / 4, 0);
    const ring2 = createRing(4.2, 0.025, 0x38bdf8, -Math.PI / 3, Math.PI / 6);
    const ring3 = createRing(4.9, 0.015, 0x10b981, Math.PI / 2.2, -Math.PI / 5);
    mainGroup.add(ring1);
    mainGroup.add(ring2);
    mainGroup.add(ring3);

    // 5. Network Constellation Nodes (Nav Items Icons - High Visibility)
    const nodeCount = 20; // 2 nodes per each of the 10 nav categories for crystal-clear visibility
    const nodePositions = [];
    const nodeVelocities = [];
    const nodeGroup = new THREE.Group();
    mainGroup.add(nodeGroup);

    const { textures: iconTextures, materials: iconMaterials } = createNavIconTexturesAndMaterials();

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const radius = 3.2 + Math.random() * 2.5;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const mat = iconMaterials[i % iconMaterials.length];
      const sprite = new THREE.Sprite(mat);
      // Large, clearly readable icon badge size
      sprite.scale.set(0.72, 0.72, 1);
      sprite.position.set(x, y, z);
      nodeGroup.add(sprite);
      nodes.push(sprite);

      nodePositions.push(new THREE.Vector3(x, y, z));
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.0025,
          (Math.random() - 0.5) * 0.0025,
          (Math.random() - 0.5) * 0.0025
        )
      );
    }

    // Dynamic Internet Connectivity Lines (Node-to-Node & Globe Core Uplinks)
    const maxLines = 120;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    nodeGroup.add(lineSegments);

    // 6. Traveling Internet Data Packets along Fiber Links
    const packetCount = 28;
    const packetGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const packets = [];
    for (let i = 0; i < packetCount; i++) {
      const p = new THREE.Mesh(packetGeo, packetMat);
      mainGroup.add(p);
      const isCoreLink = i % 2 === 0;
      packets.push({
        mesh: p,
        isCoreLink,
        nodeIdx: i % nodeCount,
        otherIdx: (i + 3) % nodeCount,
        progress: Math.random(),
        speed: 0.007 + Math.random() * 0.012,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }

    // 7. Ambient Particle Starfield
    const starsCount = 120;
    const starsGeo = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starCoords[i] = (Math.random() - 0.5) * 22;
      starCoords[i + 1] = (Math.random() - 0.5) * 22;
      starCoords[i + 2] = (Math.random() - 0.5) * 16;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 8. Mouse & Interaction handling
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetRotationY = x * 0.6;
      targetRotationX = -y * 0.45;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth || 500;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotation with damping
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      mainGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 0.2) * 0.08;
      mainGroup.rotation.y = currentRotationY + elapsedTime * (reduce ? 0.03 : 0.09);

      // Core rotation
      coreMesh.rotation.x += delta * 0.35;
      coreMesh.rotation.y -= delta * 0.25;
      innerMesh.rotation.z += delta * 0.2;

      // Gimbal rings rotation
      ring1.rotation.z += delta * 0.22;
      ring2.rotation.x -= delta * 0.18;
      ring3.rotation.y += delta * 0.15;

      // Animate nodes and update dynamic internet connectivity lines
      let lineIdx = 0;
      const cCyan = new THREE.Color(0x00f2fe);
      const cSky = new THREE.Color(0x38bdf8);
      const cEmerald = new THREE.Color(0x10b981);
      const cIndigo = new THREE.Color(0x818cf8);
      const maxConnectDist = 3.6;

      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];
        const vel = nodeVelocities[i];
        node.position.add(vel);

        // Keep inside bounds
        if (node.position.length() > 5.8 || node.position.length() < 2.8) {
          vel.multiplyScalar(-1);
        }

        // 1. Internet Backbone Core Uplink (Central Globe Hub -> Node)
        if (lineIdx < maxLines && i % 2 === 0) {
          const coreSurface = node.position.clone().normalize().multiplyScalar(2.2);
          const pulse = 0.55 + Math.sin(elapsedTime * 3 + i) * 0.25;

          linePositions[lineIdx * 6] = coreSurface.x;
          linePositions[lineIdx * 6 + 1] = coreSurface.y;
          linePositions[lineIdx * 6 + 2] = coreSurface.z;
          linePositions[lineIdx * 6 + 3] = node.position.x;
          linePositions[lineIdx * 6 + 4] = node.position.y;
          linePositions[lineIdx * 6 + 5] = node.position.z;

          // Electric core beam colors
          lineColors[lineIdx * 6] = cCyan.r * pulse;
          lineColors[lineIdx * 6 + 1] = cCyan.g * pulse;
          lineColors[lineIdx * 6 + 2] = cCyan.b * pulse;
          lineColors[lineIdx * 6 + 3] = cSky.r * pulse;
          lineColors[lineIdx * 6 + 4] = cSky.g * pulse;
          lineColors[lineIdx * 6 + 5] = cSky.b * pulse;
          lineIdx++;
        }

        // 2. Inter-node High-Speed Mesh Fiber Connections
        for (let j = i + 1; j < nodeCount; j++) {
          if (lineIdx >= maxLines) break;
          const other = nodes[j];
          const dist = node.position.distanceTo(other.position);
          if (dist < maxConnectDist) {
            const alpha = Math.max(0.25, (1 - dist / maxConnectDist)) * (0.75 + Math.sin(elapsedTime * 2.5 + i + j) * 0.25);
            linePositions[lineIdx * 6] = node.position.x;
            linePositions[lineIdx * 6 + 1] = node.position.y;
            linePositions[lineIdx * 6 + 2] = node.position.z;
            linePositions[lineIdx * 6 + 3] = other.position.x;
            linePositions[lineIdx * 6 + 4] = other.position.y;
            linePositions[lineIdx * 6 + 5] = other.position.z;

            const cStart = (i + j) % 3 === 0 ? cEmerald : cSky;
            const cEnd = (i + j) % 2 === 0 ? cCyan : cIndigo;

            lineColors[lineIdx * 6] = cStart.r * alpha;
            lineColors[lineIdx * 6 + 1] = cStart.g * alpha;
            lineColors[lineIdx * 6 + 2] = cStart.b * alpha;
            lineColors[lineIdx * 6 + 3] = cEnd.r * alpha;
            lineColors[lineIdx * 6 + 4] = cEnd.g * alpha;
            lineColors[lineIdx * 6 + 5] = cEnd.b * alpha;
            lineIdx++;
          }
        }
      }
      lineGeometry.setDrawRange(0, lineIdx * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Animate packet pulses along internet pathways
      for (let i = 0; i < packetCount; i++) {
        const pkt = packets[i];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.nodeIdx = Math.floor(Math.random() * nodeCount);
          pkt.otherIdx = Math.floor(Math.random() * nodeCount);
        }

        if (pkt.isCoreLink) {
          // Packet streams between Central Globe Core and Node (Internet Uplink/Downlink)
          const targetNode = nodes[pkt.nodeIdx];
          const coreSurface = targetNode.position.clone().normalize().multiplyScalar(2.2);
          const t = pkt.direction === 1 ? pkt.progress : 1 - pkt.progress;
          pkt.mesh.position.lerpVectors(coreSurface, targetNode.position, t);
          pkt.mesh.scale.setScalar(0.7 + Math.sin(t * Math.PI) * 0.9);
        } else {
          // Packet streams between two peer nodes (LAN/WAN routing)
          const fromPos = nodes[pkt.nodeIdx].position;
          const toPos = nodes[pkt.otherIdx].position;
          pkt.mesh.position.lerpVectors(fromPos, toPos, pkt.progress);
          pkt.mesh.scale.setScalar(0.7 + Math.sin(pkt.progress * Math.PI) * 0.9);
        }
      }

      // Slowly rotate starfield
      starField.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();

      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      iconTextures.forEach((t) => t.dispose());
      iconMaterials.forEach((m) => m.dispose());
      packetGeo.dispose();
      packetMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
    };
  }, [reduce]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full min-h-0 items-center justify-center overflow-hidden select-none ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

      {/* Cybernetic Radial Halo Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(44,154,255,0.18)_0%,rgba(14,165,233,0.06)_45%,transparent_72%)]"
      />

      {/* Outer Holographic Circuit Ring / Radar Sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-72 sm:size-84 md:size-96 rounded-full border border-sky-400/20 [animation:spin_40s_linear_infinite]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full bg-brand-400 shadow-[0_0_12px_#38bdf8]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-brand-400 shadow-[0_0_10px_#38bdf8]" />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-60 sm:size-72 rounded-full border border-dashed border-brand-500/20 [animation:spin_28s_linear_infinite_reverse]"
      />

    </div>
  );
}
