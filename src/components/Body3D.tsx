/* eslint-disable react/no-unknown-property -- React Three Fiber scene props (position, args, intensity) are valid here. */
import React, { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import * as THREE from "three";
import { Canvas, useFrame } from "./three/Canvas";
import { BOUNDS, INDICES_B64, POSITIONS_B64, VERTEX_COUNT } from "./three/bodyMesh";
import BodyMap from "./BodyMap";
import type { BodyRegion } from "../lib/healthScreening";

/**
 * A 3D body for Health Screening, using the project's body model (see ./three/bodyMesh.ts).
 * Drag sideways to turn it. Affected muscles are painted red straight onto the body's surface
 * (with a faint fibre pattern); for organs inside the chest or belly the body turns see-through
 * and the organ is shown inside. The camera glides to whichever area is selected.
 */

type V3 = [number, number, number];

const GLOW = "#F59E5B";
const SKIN_RGB = new THREE.Color("#D7D2DF");
const MUSCLE_RGB = new THREE.Color("#B8402F");
const RASH_RGB = new THREE.Color("#E39A86");
const FEVER_RGB = new THREE.Color("#E9B6A2");

/** Where to aim the camera and the marker for each region (model is 1.78 m tall, facing +z). */
const FOCUS: Record<BodyRegion, { point: V3; camY: number; dist: number; xray?: boolean }> = {
  head: { point: [0, 1.665, 0.105], camY: 1.6, dist: 1.35 },
  throat: { point: [0, 1.475, 0.06], camY: 1.5, dist: 1.35 },
  thyroid: { point: [0, 1.452, 0.062], camY: 1.48, dist: 1.35 },
  lungs: { point: [-0.07, 1.29, 0.125], camY: 1.26, dist: 1.75, xray: true },
  heart: { point: [0.035, 1.25, 0.13], camY: 1.24, dist: 1.7, xray: true },
  stomach: { point: [0.04, 1.05, 0.115], camY: 1.1, dist: 1.75, xray: true },
  shoulders: { point: [-0.205, 1.385, 0.06], camY: 1.32, dist: 1.9 },
  knees: { point: [-0.13, 0.48, 0.068], camY: 0.58, dist: 1.8 },
  skin: { point: [-0.53, 1.15, 0.0], camY: 1.1, dist: 2.8 },
  wholeBody: { point: [0, 1.665, 0.105], camY: 0.95, dist: 3.4 },
};

/** A capsule (segment a→b with radius r) of body surface to paint; a sphere when a = b. */
type Patch = { a: V3; b: V3; r: number; color?: THREE.Color; strength?: number };
const sphere = (c: V3, r: number, strength?: number): Patch => ({ a: c, b: c, r, strength });
const flipX = ([x, y, z]: V3): V3 => [-x, y, z];
const bothSides = (p: Patch): Patch[] => [p, { ...p, a: flipX(p.a), b: flipX(p.b) }];

/** Surface areas painted for each region. Organs inside the body are drawn by <Organs />. */
const PATCHES: Partial<Record<BodyRegion, Patch[]>> = {
  head: [sphere([0, 1.69, 0.06], 0.085, 0.55), ...bothSides(sphere([-0.07, 1.66, 0.02], 0.04, 0.5))],
  throat: [{ a: [0, 1.5, 0.03], b: [0, 1.44, 0.04], r: 0.055 }],
  thyroid: [sphere([0, 1.448, 0.05], 0.035)],
  shoulders: [
    ...bothSides(sphere([-0.215, 1.395, -0.01], 0.1)),
    ...bothSides({ a: [-0.05, 1.47, -0.03], b: [-0.17, 1.43, -0.03], r: 0.055 }),
    ...bothSides({ a: [-0.25, 1.35, -0.05], b: [-0.32, 1.29, -0.06], r: 0.065 }),
  ],
  // In the overview, organs show as a patch on the surface; their own tab shows them inside.
  heart: [sphere([0.035, 1.25, 0.11], 0.065, 0.75)],
  lungs: bothSides(sphere([-0.07, 1.28, 0.1], 0.08, 0.6)),
  stomach: [sphere([0.04, 1.06, 0.1], 0.075, 0.7)],
  knees: bothSides(sphere([-0.13, 0.48, 0.0], 0.075)),
  wholeBody: [sphere([0, 1.62, 0.04], 0.16, 0.7), { a: [0, 1.45, 0], b: [0, 0.95, 0], r: 0.22, color: FEVER_RGB, strength: 0.45 }],
  skin: bothSides({ a: [-0.37, 1.25, -0.07], b: [-0.68, 1.02, -0.04], r: 0.07, color: RASH_RGB }),
};

/** Distance from p to the segment a→b. */
function segmentDistance(p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) {
  const ab = b.clone().sub(a);
  const len2 = ab.lengthSq();
  const t = len2 === 0 ? 0 : Math.min(1, Math.max(0, p.clone().sub(a).dot(ab) / len2));
  return p.distanceTo(a.clone().addScaledVector(ab, t));
}

// ---- Model geometry -------------------------------------------------------------------------

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function decodeBase64(text: string): Uint8Array {
  const lookup = new Uint8Array(128);
  for (let i = 0; i < B64.length; i++) lookup[B64.charCodeAt(i)] = i;
  const clean = text.replace(/=+$/, "");
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (lookup[clean.charCodeAt(i)] << 18) |
      (lookup[clean.charCodeAt(i + 1)] << 12) |
      ((lookup[clean.charCodeAt(i + 2)] ?? 0) << 6) |
      (lookup[clean.charCodeAt(i + 3)] ?? 0);
    if (o < out.length) out[o++] = (n >> 16) & 255;
    if (o < out.length) out[o++] = (n >> 8) & 255;
    if (o < out.length) out[o++] = n & 255;
  }
  return out;
}

let cachedGeometry: THREE.BufferGeometry | null = null;
/** Decodes the embedded model once and reuses it. */
function bodyGeometry() {
  if (cachedGeometry) return cachedGeometry;
  const q = new Uint16Array(decodeBase64(POSITIONS_B64).buffer);
  const positions = new Float32Array(VERTEX_COUNT * 3);
  for (let i = 0; i < VERTEX_COUNT * 3; i++) {
    const axis = i % 3;
    positions[i] = BOUNDS.min[axis] + (q[i] / 65535) * (BOUNDS.max[axis] - BOUNDS.min[axis]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(decodeBase64(INDICES_B64).buffer), 1));
  geometry.computeVertexNormals();
  cachedGeometry = geometry;
  return geometry;
}

/** Per-vertex colours: skin, blended into muscle red (with fibres) inside the painted patches. */
function paintColors(geometry: THREE.BufferGeometry, regions: BodyRegion[]) {
  const pos = geometry.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  const patches = regions.flatMap((r) => PATCHES[r] ?? []);
  const p = new THREE.Vector3();
  const prepared = patches.map((patch) => ({
    a: new THREE.Vector3(...patch.a),
    b: new THREE.Vector3(...patch.b),
    r: patch.r,
    color: patch.color ?? MUSCLE_RGB,
    strength: patch.strength ?? 1,
  }));
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    p.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    c.copy(SKIN_RGB);
    for (const patch of prepared) {
      const d = segmentDistance(p, patch.a, patch.b) / patch.r;
      if (d < 1) {
        // solid colour in the inner 55% of the patch, fading out towards its edge
        const edge = Math.min(1, Math.max(0, (d - 0.55) / 0.45));
        const w = (1 - edge * edge * (3 - 2 * edge)) * patch.strength;
        const fibre = 0.86 + 0.14 * Math.sin((p.y * 0.85 + p.x * 0.35) * 520);
        const target = patch.color === MUSCLE_RGB ? patch.color.clone().multiplyScalar(fibre) : patch.color;
        c.lerp(target, Math.min(1, w));
      }
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  return new THREE.BufferAttribute(colors, 3);
}

/** Drag rotation, read every frame by the render loop (kept outside React state on purpose). */
class Turn {
  angle = 0;
  touched = false;
  private from = 0;
  /** Face the front again (used when another area is selected). */
  reset() {
    this.angle = 0;
  }
  begin() {
    this.from = this.angle;
    this.touched = true;
  }
  move(dx: number) {
    this.angle = this.from + dx * 0.012;
  }
}

function ModelFigure({ regions, material }: { regions: BodyRegion[]; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const g = bodyGeometry().clone();
    g.setAttribute("color", paintColors(g, regions));
    return g;
  }, [regions]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} />;
}

const SIDES = [-1, 1] as const;

/** Organs shown inside the see-through body (muscles and skin are painted on the body itself). */
function Organs({ regions, organ }: { regions: BodyRegion[]; organ: THREE.Material }) {
  const ball = useMemo(() => new THREE.SphereGeometry(1, 40, 28), []);
  const blob = (key: string, position: V3, scale: V3, material: THREE.Material, rotation?: V3) => (
    <mesh key={key} geometry={ball} position={position} scale={scale} rotation={rotation} material={material} />
  );
  return (
    <group>
      {regions.map((region) => {
        switch (region) {
          case "lungs":
            return (
              <group key={region}>
                {SIDES.map((s) =>
                  blob(`${region}${s}`, [s * 0.07, 1.28, 0.02], [0.065, 0.11, 0.06], organ, [0, 0, s * 0.12]),
                )}
              </group>
            );
          case "heart":
            return blob(region, [0.03, 1.245, 0.05], [0.045, 0.055, 0.042], organ, [0, 0, -0.5]);
          case "stomach":
            return blob(region, [0.04, 1.06, 0.04], [0.075, 0.05, 0.045], organ, [0, 0, 0.35]);
          default:
            return null;
        }
      })}
    </group>
  );
}

function Marker({ point }: { point: V3 }) {
  const halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() % 1.6) / 1.6;
    if (halo.current) {
      halo.current.scale.setScalar(1 + t * 2.4);
      (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - t);
    }
  });
  return (
    <group position={point}>
      <mesh>
        <sphereGeometry args={[0.012, 20, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.019, 20, 16]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.019, 20, 16]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Turns the body (drag or gentle idle sway) and glides the camera to the focused area. */
function Rig({ focus, drag, children }: { focus: BodyRegion; drag: Turn; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = FOCUS[focus];
  useFrame(({ camera, clock }, delta) => {
    const k = 1 - Math.pow(0.02, delta); // smooth, frame-rate independent easing
    camera.position.x += (0 - camera.position.x) * k;
    camera.position.y += (target.camY - camera.position.y) * k;
    camera.position.z += (target.dist - camera.position.z) * k;
    camera.lookAt(0, target.camY, 0);
    if (group.current) {
      const goal = drag.touched ? drag.angle : Math.sin(clock.getElapsedTime() * 0.6) * 0.45;
      group.current.rotation.y += (goal - group.current.rotation.y) * k;
    }
  });
  return <group ref={group}>{children}</group>;
}

class Fallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}


export default function Body3D({
  regions,
  focus,
  label,
  height = 360,
}: {
  regions: BodyRegion[];
  focus: BodyRegion;
  label: string;
  height?: number;
}) {
  const [drag] = useState(() => new Turn());
  useEffect(() => {
    drag.reset();
  }, [focus, drag]);
  const [hint, setHint] = useState(true);
  // See-through only when an organ's own tab is open; the overview paints organs on the surface.
  const xray = Boolean(FOCUS[focus].xray) && regions.length === 1;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 4,
        onPanResponderGrant: () => {
          drag.begin();
          setHint(false);
        },
        onPanResponderMove: (_e, g) => {
          drag.move(g.dx);
        },
      }),
    [drag],
  );

  const materials = useMemo(() => {
    const warm = regions.includes("wholeBody");
    return {
      body: new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.5,
        metalness: 0,
        clearcoat: 0.2,
        clearcoatRoughness: 0.55,
        sheen: 0.5,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color("#FFFFFF"),
        emissive: new THREE.Color(warm ? "#FF7A45" : "#000000"),
        emissiveIntensity: warm ? 0.12 : 0,
        transparent: xray,
        opacity: xray ? 0.32 : 1,
        depthWrite: !xray,
      }),
      organ: new THREE.MeshPhysicalMaterial({
        color: "#C2503D",
        roughness: 0.38,
        clearcoat: 0.45,
        clearcoatRoughness: 0.35,
        emissive: new THREE.Color("#4A1008"),
        emissiveIntensity: 0.3,
      }),
    };
  }, [regions, xray]);

  const fallback = <BodyMap regions={regions} focus={focus} label={label} height={height} />;

  return (
    <View style={{ height }}>
      <Fallback fallback={fallback}>
        <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
          <Canvas camera={{ position: [0, 1.2, 2.6], fov: 32, near: 0.05, far: 20 }} style={{ flex: 1 }}>
            <ambientLight intensity={0.35} />
            <hemisphereLight args={["#FFFFFF", "#D9C7B8", 0.75]} />
            <directionalLight position={[-1.4, 2.6, 2.2]} intensity={1.8} />
            <directionalLight position={[1.8, 1.0, 1.2]} intensity={0.35} color="#E8E4FF" />
            <directionalLight position={[1.4, 1.6, -2]} intensity={0.9} color="#FFD3B8" />
            <Rig focus={focus} drag={drag}>
              <Organs regions={xray ? regions : regions.filter((r) => !FOCUS[r].xray)} organ={materials.organ} />
              <ModelFigure regions={regions} material={materials.body} />
              <Marker point={FOCUS[focus].point} />
            </Rig>
          </Canvas>
        </View>
        <View pointerEvents="none" style={styles.label}>
          <View style={styles.labelDot} />
          <Text style={styles.labelText} numberOfLines={2}>
            {label}
          </Text>
        </View>
        {hint ? (
          <View pointerEvents="none" style={styles.hint}>
            <Text style={styles.hintText}>⟲ Drag to rotate</Text>
          </View>
        ) : null}
      </Fallback>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    left: 16,
    top: 14,
    maxWidth: 190,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "rgba(250, 226, 204, 0.95)",
  },
  labelDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GLOW, borderWidth: 2, borderColor: "#FFFFFF" },
  labelText: { fontSize: 14, fontWeight: "600", color: "#2A1E16", flexShrink: 1 },
  hint: {
    position: "absolute",
    alignSelf: "center",
    bottom: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: "rgba(31, 26, 23, 0.6)",
  },
  hintText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
});
