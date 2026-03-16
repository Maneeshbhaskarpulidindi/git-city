"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── Constants ───────────────────────────────────────────────
// Dinzo reserved at grid(-1, 1)
const DEFAULT_POS: [number, number, number] = [-173, 0, 149];
const TOWER_RADIUS = 32;
const TOWER_H = 380;
const SEGMENTS = 24; // cylinder resolution

// ─── Dinzo logo texture (pie chart with separated slice) ────
function createLogoTexture(color: string): THREE.CanvasTexture {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, s, s);

  const cx = s / 2;
  const cy = s / 2;
  const r = 90;

  // Main body (~75% of circle) — from ~7 o'clock going clockwise to ~11 o'clock
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, Math.PI * 0.85, Math.PI * -0.35, false);
  ctx.closePath();
  ctx.fill();

  // Separated slice (~25%) — offset slightly upper-right
  const sliceOffset = 8;
  const sliceMidAngle = Math.PI * 0.25; // middle of the slice
  const sx = cx + sliceOffset * Math.cos(sliceMidAngle);
  const sy = cy - sliceOffset * Math.sin(sliceMidAngle);
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.arc(sx, sy, r, Math.PI * -0.35, Math.PI * 0.85, false);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

// ─── Vertical neon sign "DINZO" (rendered letter by letter top-to-bottom) ──
function createVerticalSignTexture(color: string): THREE.CanvasTexture {
  const letters = "DINZO";
  const cellH = 48;
  const cw = 48;
  const ch = cellH * letters.length;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, cw, ch);

  ctx.font = "bold 36px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = color;

  for (let i = 0; i < letters.length; i++) {
    ctx.fillText(letters[i], cw / 2, cellH * i + cellH / 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

// ─── Cylindrical glass wrap texture ─────────────────────────
function createCylinderGlassTex(
  cols: number, rows: number, seed: number,
  litColors: string[], offColor: string, faceColor: string,
): THREE.CanvasTexture {
  const cellW = 8, cellH = 10;
  const cw = cols * cellW, ch = rows * cellH;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = faceColor;
  ctx.fillRect(0, 0, cw, ch);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hash = ((r * 13 + c * 23 + seed) * 2654435761) >>> 0;
      const x = c * cellW + 1;
      const y = r * cellH + 1;
      const ww = cellW - 2;
      const hh = cellH - 2;

      const lit = (hash % 100) < 38;
      if (lit) {
        ctx.fillStyle = litColors[hash % litColors.length];
        ctx.globalAlpha = 0.4 + (hash % 25) / 100;
      } else {
        ctx.fillStyle = offColor;
        ctx.globalAlpha = 0.7;
      }
      ctx.fillRect(x, y, ww, hh);
      ctx.globalAlpha = 1;
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// ─── Component ──────────────────────────────────────────────

interface DinzoLandmarkProps {
  onClick: () => void;
  position?: [number, number, number];
  themeAccent?: string;
  themeWindowLit?: string[];
  themeFace?: string;
}

type DinzoWindowFlags = Window & {
  __dinzoClicked?: boolean;
  __dinzoCursor?: boolean;
};

export default function DinzoLandmark({
  onClick,
  position = DEFAULT_POS,
  themeAccent = "#c8e64a",
  themeWindowLit = ["#a0c0f0", "#80a0e0", "#6080c8"],
  themeFace = "#101828",
}: DinzoLandmarkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const logoGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  const { gl, camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const ndc = useRef(new THREE.Vector2());
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  // Textures — all theme-aware
  const logoTex = useMemo(() => createLogoTexture(themeAccent), [themeAccent]);
  const signTex = useMemo(() => createVerticalSignTexture(themeAccent), [themeAccent]);
  const windowOff = useMemo(() => {
    const c = new THREE.Color(themeFace);
    c.multiplyScalar(0.55);
    return "#" + c.getHexString();
  }, [themeFace]);
  const glassTex = useMemo(
    () => createCylinderGlassTex(24, 50, 63, themeWindowLit, windowOff, themeFace),
    [themeWindowLit, windowOff, themeFace],
  );

  useEffect(() => {
    return () => {
      logoTex.dispose();
      signTex.dispose();
      glassTex.dispose();
    };
  }, [logoTex, signTex, glassTex]);

  const shellColor = useMemo(() => {
    const c = new THREE.Color(themeFace);
    c.multiplyScalar(1.5);
    return "#" + c.getHexString();
  }, [themeFace]);

  // ── Click + cursor (capture phase) ──
  useEffect(() => {
    const canvas = gl.domElement;
    const w = window as DinzoWindowFlags;

    const hitsDinzo = (e: PointerEvent): boolean => {
      const group = groupRef.current;
      if (!group) return false;
      const rect = canvas.getBoundingClientRect();
      ndc.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(ndc.current, camera);

      const dinzoHits = raycaster.current.intersectObject(group, true);
      if (dinzoHits.length === 0) return false;

      const dinzoDistance = dinzoHits[0].distance;
      const sceneHits = raycaster.current.intersectObjects(scene.children, true);
      for (const hit of sceneHits) {
        if (hit.distance >= dinzoDistance) break;
        if ((hit.object as any).isInstancedMesh) return false;
      }
      return true;
    };

    let tap: { time: number; x: number; y: number } | null = null;

    const onDown = (e: PointerEvent) => {
      if (hitsDinzo(e)) {
        w.__dinzoClicked = true;
        tap = { time: performance.now(), x: e.clientX, y: e.clientY };
      }
    };

    const onUp = (e: PointerEvent) => {
      w.__dinzoClicked = false;
      if (!tap) return;
      const elapsed = performance.now() - tap.time;
      const dx = e.clientX - tap.x;
      const dy = e.clientY - tap.y;
      tap = null;
      if (elapsed > 400 || dx * dx + dy * dy > 625) return;
      onClickRef.current();
    };

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    let lastMove = 0;
    const onMove = isTouch
      ? null
      : (e: PointerEvent) => {
          const now = performance.now();
          if (now - lastMove < 66) return;
          lastMove = now;
          if (hitsDinzo(e)) {
            document.body.style.cursor = "pointer";
            w.__dinzoCursor = true;
          } else if (w.__dinzoCursor) {
            w.__dinzoCursor = false;
          }
        };

    canvas.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointerup", onUp, true);
    if (onMove) canvas.addEventListener("pointermove", onMove, true);

    return () => {
      canvas.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      if (onMove) canvas.removeEventListener("pointermove", onMove, true);
      w.__dinzoClicked = false;
      w.__dinzoCursor = false;
    };
  }, [gl, camera, scene]);

  // ── Animation ──
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Logo slow rotation
    if (logoGroupRef.current) {
      logoGroupRef.current.rotation.y = t * 0.3;
    }

    // Floating ring bob
    if (ringRef.current) {
      ringRef.current.position.y = TOWER_H * 0.55 + Math.sin(t * 0.8) * 4;
      ringRef.current.rotation.y = t * 0.5;
    }

    // Beacon pulse
    if (beaconRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.2;
      beaconRef.current.scale.setScalar(s);
      (beaconRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        2 + Math.sin(t * 2) * 1;
    }
  });

  return (
    <group ref={groupRef} position={position} userData={{ isLandmark: true }}>
      {/* Invisible hitbox */}
      <mesh position={[0, TOWER_H / 2, 0]} visible={false}>
        <cylinderGeometry args={[TOWER_RADIUS + 20, TOWER_RADIUS + 20, TOWER_H + 80, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* ── Octagonal ground platform ── */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS + 20, TOWER_RADIUS + 22, 3, 8]} />
        <meshStandardMaterial color={shellColor} roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Platform accent edge */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS + 21, TOWER_RADIUS + 21, 0.8, 8]} />
        <meshStandardMaterial
          color={themeAccent}
          emissive={themeAccent}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* ── Main cylindrical tower (lower section) ── */}
      <mesh position={[0, TOWER_H * 0.35, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS, TOWER_RADIUS + 2, TOWER_H * 0.7, SEGMENTS]} />
        <meshStandardMaterial
          map={glassTex}
          emissive={themeWindowLit[0] ?? "#fff"}
          emissiveMap={glassTex}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      {/* Inner shell for depth */}
      <mesh position={[0, TOWER_H * 0.35, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS - 0.5, TOWER_RADIUS + 1.5, TOWER_H * 0.7, SEGMENTS]} />
        <meshStandardMaterial color={shellColor} roughness={0.25} metalness={0.8} side={THREE.BackSide} />
      </mesh>

      {/* ── Accent ring band (mid tower) ── */}
      <mesh position={[0, TOWER_H * 0.35, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS + 3, TOWER_RADIUS + 3, 2, SEGMENTS]} />
        <meshStandardMaterial
          color={themeAccent}
          emissive={themeAccent}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* ── Upper section (slightly narrower) ── */}
      <mesh position={[0, TOWER_H * 0.78, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS * 0.82, TOWER_RADIUS, TOWER_H * 0.36, SEGMENTS]} />
        <meshStandardMaterial
          map={glassTex}
          emissive={themeWindowLit[0] ?? "#fff"}
          emissiveMap={glassTex}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, TOWER_H * 0.78, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS * 0.82 - 0.5, TOWER_RADIUS - 0.5, TOWER_H * 0.36, SEGMENTS]} />
        <meshStandardMaterial color={shellColor} roughness={0.25} metalness={0.8} side={THREE.BackSide} />
      </mesh>

      {/* ── Setback ledge between sections ── */}
      <mesh position={[0, TOWER_H * 0.6 + 1, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS + 4, TOWER_RADIUS + 4, 3, SEGMENTS]} />
        <meshStandardMaterial color={shellColor} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, TOWER_H * 0.6 + 3, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS + 5, TOWER_RADIUS + 5, 0.8, SEGMENTS]} />
        <meshStandardMaterial
          color={themeAccent}
          emissive={themeAccent}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* ── Floating hologram ring ── */}
      <mesh ref={ringRef} position={[0, TOWER_H * 0.55, 0]}>
        <torusGeometry args={[TOWER_RADIUS + 12, 1.2, 6, SEGMENTS]} />
        <meshStandardMaterial
          color={themeAccent}
          emissive={themeAccent}
          emissiveIntensity={1.5}
          toneMapped={false}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ── Vertical neon sign "DINZO" (on the tower surface, front) ── */}
      <mesh position={[0, TOWER_H * 0.48, TOWER_RADIUS + 0.5]}>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial
          map={signTex}
          emissive="#ffffff"
          emissiveMap={signTex}
          emissiveIntensity={2}
          toneMapped={false}
          transparent
          alphaTest={0.1}
        />
      </mesh>
      {/* Sign on back */}
      <mesh position={[0, TOWER_H * 0.48, -TOWER_RADIUS - 0.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial
          map={signTex}
          emissive="#ffffff"
          emissiveMap={signTex}
          emissiveIntensity={2}
          toneMapped={false}
          transparent
          alphaTest={0.1}
        />
      </mesh>
      {/* Sign on right */}
      <mesh position={[TOWER_RADIUS + 0.5, TOWER_H * 0.48, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 50]} />
        <meshStandardMaterial
          map={signTex}
          emissive="#ffffff"
          emissiveMap={signTex}
          emissiveIntensity={2}
          toneMapped={false}
          transparent
          alphaTest={0.1}
        />
      </mesh>

      {/* ── Rooftop cap ── */}
      <mesh position={[0, TOWER_H * 0.96 + 2, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS * 0.85, TOWER_RADIUS * 0.82, 4, SEGMENTS]} />
        <meshStandardMaterial color={shellColor} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, TOWER_H * 0.96 + 4.5, 0]}>
        <cylinderGeometry args={[TOWER_RADIUS * 0.86, TOWER_RADIUS * 0.86, 0.8, SEGMENTS]} />
        <meshStandardMaterial
          color={themeAccent}
          emissive={themeAccent}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* ── 3D Dinzo logo floating above rooftop ── */}
      <group ref={logoGroupRef} position={[0, TOWER_H + 22, 0]}>
        {/* Logo as flat disc with texture */}
        <mesh>
          <circleGeometry args={[18, 32]} />
          <meshStandardMaterial
            map={logoTex}
            emissive={themeAccent}
            emissiveMap={logoTex}
            emissiveIntensity={2}
            toneMapped={false}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glow behind logo */}
        <pointLight
          color={themeAccent}
          intensity={30}
          distance={80}
          decay={2}
        />
      </group>

      {/* ── Top beacon ── */}
      <mesh ref={beaconRef} position={[0, TOWER_H + 45, 0]}>
        <sphereGeometry args={[3, 8, 8]} />
        <meshStandardMaterial
          color={themeAccent}
          emissive={themeAccent}
          emissiveIntensity={3}
          toneMapped={false}
          transparent
          opacity={0.9}
        />
      </mesh>
      <pointLight
        position={[0, TOWER_H + 45, 0]}
        color={themeAccent}
        intensity={35}
        distance={140}
        decay={2}
      />

      {/* ── Entrance glow ── */}
      <pointLight
        position={[0, 14, TOWER_RADIUS + 10]}
        color={themeAccent}
        intensity={15}
        distance={40}
        decay={2}
      />
    </group>
  );
}
