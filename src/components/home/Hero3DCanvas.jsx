import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Cpu, Network, Radio, Shield, Wifi, Zap } from "lucide-react";

export default function Hero3DCanvas({ className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const reduce = useReducedMotion();
  const [activeTelemetry, setActiveTelemetry] = useState(0);

  // Telemetry status rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTelemetry((prev) => (prev + 1) % 3);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

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

    // 5. Network Constellation Nodes (Connected graph)
    const nodeCount = 38;
    const nodePositions = [];
    const nodeVelocities = [];
    const nodeGroup = new THREE.Group();
    mainGroup.add(nodeGroup);

    const nodeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const nodeMaterialPrimary = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const nodeMaterialAccent = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const nodeMaterialGold = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const radius = 3.0 + Math.random() * 2.8;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      const mat = i % 5 === 0 ? nodeMaterialAccent : i % 8 === 0 ? nodeMaterialGold : nodeMaterialPrimary;
      const mesh = new THREE.Mesh(nodeGeometry, mat);
      mesh.position.set(x, y, z);
      nodeGroup.add(mesh);
      nodes.push(mesh);

      nodePositions.push(new THREE.Vector3(x, y, z));
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003,
          (Math.random() - 0.5) * 0.003
        )
      );
    }

    // Dynamic Connections Lines between nearby nodes
    const maxLines = 80;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    nodeGroup.add(lineSegments);

    // 6. Traveling Data Packets along Orbitals
    const packetCount = 24;
    const packetGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const packets = [];
    for (let i = 0; i < packetCount; i++) {
      const p = new THREE.Mesh(packetGeo, packetMat);
      mainGroup.add(p);
      packets.push({
        mesh: p,
        fromIdx: Math.floor(Math.random() * nodeCount),
        toIdx: Math.floor(Math.random() * nodeCount),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.012,
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

      // Animate nodes and update connections
      let lineIdx = 0;
      const c1 = new THREE.Color(0x2c9aff);
      const c2 = new THREE.Color(0x38bdf8);
      const maxConnectDist = 2.4;

      for (let i = 0; i < nodeCount; i++) {
        const node = nodes[i];
        const vel = nodeVelocities[i];
        node.position.add(vel);

        // Keep inside bounds
        if (node.position.length() > 5.5 || node.position.length() < 2.5) {
          vel.multiplyScalar(-1);
        }

        // Draw connections
        for (let j = i + 1; j < nodeCount; j++) {
          if (lineIdx >= maxLines) break;
          const other = nodes[j];
          const dist = node.position.distanceTo(other.position);
          if (dist < maxConnectDist) {
            const alpha = 1 - dist / maxConnectDist;
            linePositions[lineIdx * 6] = node.position.x;
            linePositions[lineIdx * 6 + 1] = node.position.y;
            linePositions[lineIdx * 6 + 2] = node.position.z;
            linePositions[lineIdx * 6 + 3] = other.position.x;
            linePositions[lineIdx * 6 + 4] = other.position.y;
            linePositions[lineIdx * 6 + 5] = other.position.z;

            lineColors[lineIdx * 6] = c1.r * alpha;
            lineColors[lineIdx * 6 + 1] = c1.g * alpha;
            lineColors[lineIdx * 6 + 2] = c1.b * alpha;
            lineColors[lineIdx * 6 + 3] = c2.r * alpha;
            lineColors[lineIdx * 6 + 4] = c2.g * alpha;
            lineColors[lineIdx * 6 + 5] = c2.b * alpha;
            lineIdx++;
          }
        }
      }
      lineGeometry.setDrawRange(0, lineIdx * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Animate packet pulses along node paths
      for (let i = 0; i < packetCount; i++) {
        const pkt = packets[i];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.fromIdx = pkt.toIdx;
          pkt.toIdx = Math.floor(Math.random() * nodeCount);
        }
        const fromPos = nodes[pkt.fromIdx].position;
        const toPos = nodes[pkt.toIdx].position;
        pkt.mesh.position.lerpVectors(fromPos, toPos, pkt.progress);
        pkt.mesh.scale.setScalar(0.8 + Math.sin(pkt.progress * Math.PI) * 0.8);
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
      nodeGeometry.dispose();
      nodeMaterialPrimary.dispose();
      nodeMaterialAccent.dispose();
      nodeMaterialGold.dispose();
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

      {/* Holographic HUD Badge - Top Left: 10G SFP+ Optical Link */}
      {/* <motion.div
        initial={reduce ? false : { opacity: 0, x: -20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.2 },
          y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute top-4 left-2 sm:left-6 z-20 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-950/75 px-3.5 py-2.5 backdrop-blur-md shadow-[0_16px_36px_-10px_rgba(0,0,0,0.6)]"
      >
        <span className="grid size-8 place-items-center rounded-xl bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/40">
          <Activity size={15} className="animate-pulse" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <p className="text-[11px] font-bold text-white tracking-wide">10G SFP+ Link</p>
          </div>
          <p className="text-[9px] font-medium text-slate-400">99.99% Uptime · 0.8ms</p>
        </div>
      </motion.div> */}

      {/* Holographic HUD Badge - Bottom Right: Wi-Fi 6 OFDMA Hub */}
      {/* <motion.div
        initial={reduce ? false : { opacity: 0, x: 20, y: 15 }}
        animate={{ opacity: 1, x: 0, y: [0, 7, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.4 },
          y: { duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        className="absolute bottom-6 right-2 sm:right-6 z-20 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-950/75 px-3.5 py-2.5 backdrop-blur-md shadow-[0_16px_36px_-10px_rgba(0,0,0,0.6)]"
      >
        <span className="grid size-8 place-items-center rounded-xl bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40">
          <Wifi size={15} />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-brand-400 shadow-[0_0_6px_#38bdf8]" />
            <p className="text-[11px] font-bold text-white tracking-wide">Wi-Fi 6 Mesh Core</p>
          </div>
          <p className="text-[9px] font-medium text-slate-400">Tri-Band 9.6 Gbps AX</p>
        </div>
      </motion.div> */}

      {/* Holographic HUD Badge - Bottom Left: PoE+ Managed Power */}
      {/* <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.6 },
          y: { duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 2 },
        }}
        className="absolute bottom-4 left-4 sm:left-10 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-950/75 px-3 py-2 backdrop-blur-md shadow-[0_14px_30px_-10px_rgba(0,0,0,0.5)]"
      >
        <span className="grid size-7 place-items-center rounded-lg bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40">
          <Zap size={13} />
        </span>
        <div>
          <p className="text-[10px] font-bold text-white">PoE+ 370W Auto-Sense</p>
          <p className="text-[9px] text-slate-400">Gigabit Layer-2/3</p>
        </div>
      </motion.div> */}

      {/* Interactive Status Pill - Top Right */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-300 backdrop-blur-md"
      >
        <Radio size={11} className="animate-pulse text-sky-400" />
        <span>Hardware Engine Live</span>
      </motion.div> */}

      {/* Subtle Hint */}
      {/* <div className="absolute bottom-1 z-10 text-center pointer-events-none">
        <p className="text-[9px] font-medium tracking-widest uppercase text-slate-500">
          Interactive 3D Network Topology · Move mouse to rotate
        </p>
      </div> */}
    </div>
  );
}
