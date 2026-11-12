/* eslint-disable react/no-unknown-property -- React Three Fiber scene props (position, args, intensity) are valid here. */
import React, { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import * as THREE from "three";
import { Canvas, useFrame } from "./three/Canvas";
import BodyMap from "./BodyMap";
import type { BodyRegion } from "../lib/healthScreening";

/**
 * A 3D body for Health Screening, modelled in code (no model file to download). Torso, limbs,
 * neck and head are lathed from anatomical side profiles (chest → waist → hips, biceps, calves,
 * skull and jaw) and flattened front-to-back, so they read as a real figure rather than tubes.
 *
 * Drag sideways to turn it. Affected muscles are painted red; for organs inside the chest or belly
 * the skin turns see-through. The camera glides to whichever area is selected.
 */

type V3 = [number, number, number];

const GLOW = "#F59E5B";

/** Where to aim the camera and the marker for each region. */
const FOCUS: Record<BodyRegion, { point: V3; camY: number; dist: number; xray?: boolean }> = {
  head: { point: [0, 1.68, 0.085], camY: 1.6, dist: 1.3 },
  throat: { point: [0, 1.49, 0.05], camY: 1.5, dist: 1.3 },
  thyroid: { point: [0, 1.455, 0.05], camY: 1.48, dist: 1.3 },
  lungs: { point: [-0.065, 1.25, 0.075], camY: 1.22, dist: 1.65, xray: true },
  heart: { point: [0.035, 1.21, 0.07], camY: 1.22, dist: 1.6, xray: true },
  stomach: { point: [0.04, 1.05, 0.075], camY: 1.1, dist: 1.65, xray: true },
  shoulders: { point: [-0.205, 1.37, 0.06], camY: 1.32, dist: 1.7 },
  knees: { point: [-0.085, 0.48, 0.058], camY: 0.58, dist: 1.7 },
  skin: { point: [-0.25, 1.02, 0.05], camY: 1.05, dist: 2.6 },
  wholeBody: { point: [0, 1.68, 0.085], camY: 0.95, dist: 3.0 },
};

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

// ---- Anatomy: side profiles [radius, height] lathed into smooth solids ---------------------

function lathe(profile: [number, number][], segments = 48) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

function useAnatomy() {
  return useMemo(
    () => ({
      head: lathe([
        [0.0, 1.535], [0.028, 1.538], [0.05, 1.548], [0.064, 1.565], [0.073, 1.588], [0.079, 1.615],
        [0.084, 1.645], [0.088, 1.675], [0.088, 1.705], [0.083, 1.73], [0.072, 1.752], [0.054, 1.768],
        [0.03, 1.778], [0.0, 1.781],
      ]),
      neck: lathe([[0.056, 1.42], [0.05, 1.45], [0.046, 1.49], [0.046, 1.52], [0.05, 1.555]]),
      // crotch → hips → waist → ribcage → chest → shoulder line
      torso: lathe([
        [0.0, 0.855], [0.07, 0.86], [0.12, 0.88], [0.145, 0.915], [0.152, 0.955], [0.147, 0.995],
        [0.134, 1.04], [0.127, 1.075], [0.132, 1.11], [0.146, 1.165], [0.16, 1.22], [0.168, 1.275],
        [0.171, 1.325], [0.166, 1.365], [0.148, 1.398], [0.115, 1.42], [0.07, 1.432], [0.0, 1.436],
      ]),
      // elbow (0) → biceps → shoulder (0.28)
      upperArm: lathe([
        [0.034, 0.0], [0.037, 0.025], [0.041, 0.07], [0.046, 0.12], [0.047, 0.16], [0.045, 0.2],
        [0.048, 0.24], [0.052, 0.28],
      ]),
      // wrist (0) → forearm belly → elbow (0.25)
      forearm: lathe([
        [0.024, 0.0], [0.027, 0.04], [0.033, 0.1], [0.039, 0.16], [0.041, 0.2], [0.039, 0.235], [0.036, 0.25],
      ]),
      // knee (0) → quadriceps → hip (0.42)
      thigh: lathe([
        [0.047, 0.0], [0.051, 0.03], [0.06, 0.1], [0.07, 0.18], [0.078, 0.27], [0.083, 0.35], [0.084, 0.42],
      ]),
      // ankle (0) → calf → knee (0.4)
      shin: lathe([
        [0.027, 0.0], [0.03, 0.04], [0.036, 0.1], [0.046, 0.19], [0.052, 0.26], [0.05, 0.33], [0.047, 0.4],
      ]),
      sphere: new THREE.SphereGeometry(1, 40, 28),
    }),
    [],
  );
}

type Paint = {
  neck?: THREE.Material;
  deltoid?: THREE.Material;
  trap?: THREE.Material;
  upperArm?: THREE.Material;
  forearm?: THREE.Material;
  knee?: THREE.Material;
};

const SIDES = [-1, 1] as const;

/** The figure. Parts listed in `paint` use that material instead of skin. */
function Figure({ skin, torsoSkin, paint }: { skin: THREE.Material; torsoSkin: THREE.Material; paint: Paint }) {
  const a = useAnatomy();
  const blob = (key: string, position: V3, scale: V3, material: THREE.Material, rotation?: V3) => (
    <mesh key={key} geometry={a.sphere} position={position} scale={scale} rotation={rotation} material={material} />
  );

  return (
    <group>
      {/* head: lathed skull + jaw, flattened side to side, with nose, brow, chin and ears */}
      <mesh geometry={a.head} scale={[0.88, 1, 1.06]} position={[0, 0, 0.004]} material={skin} />
      {blob("nose", [0, 1.636, 0.084], [0.011, 0.022, 0.016], skin)}
      {blob("brow", [0, 1.68, 0.072], [0.05, 0.012, 0.02], skin)}
      {blob("chin", [0, 1.56, 0.042], [0.024, 0.016, 0.02], skin)}
      {SIDES.map((s) => blob(`ear${s}`, [s * 0.074, 1.64, -0.004], [0.009, 0.024, 0.016], skin))}

      {/* neck with sternocleidomastoid ridges, trapezius sloping to the shoulders */}
      <mesh geometry={a.neck} scale={[1, 1, 0.92]} material={paint.neck ?? skin} />
      {SIDES.map((s) =>
        blob(`scm${s}`, [s * 0.022, 1.48, 0.026], [0.011, 0.048, 0.012], paint.neck ?? skin, [0.3, 0, s * -0.4]),
      )}
      {SIDES.map((s) => blob(`trap${s}`, [s * 0.105, 1.418, -0.012], [0.095, 0.03, 0.06], paint.trap ?? skin, [0, 0, s * -0.32]))}

      {/* torso: lathed chest-waist-hips, flattened front to back */}
      <mesh geometry={a.torso} scale={[1, 1, 0.62]} material={torsoSkin} />
      {SIDES.map((s) => blob(`pec${s}`, [s * 0.072, 1.285, 0.072], [0.078, 0.056, 0.032], torsoSkin, [0, 0, s * 0.18]))}
      {SIDES.map((s) => blob(`lat${s}`, [s * 0.135, 1.2, -0.005], [0.03, 0.09, 0.06], torsoSkin))}
      {blob("abs", [0, 1.1, 0.068], [0.062, 0.1, 0.018], torsoSkin)}
      {SIDES.map((s) => blob(`glute${s}`, [s * 0.075, 0.9, -0.045], [0.08, 0.075, 0.06], skin))}

      {/* arms: shoulder joint → upper arm → elbow → forearm → hand */}
      {SIDES.map((s) => (
        <group key={`arm${s}`}>
          {blob(`delt${s}`, [s * 0.2, 1.37, 0.002], [0.058, 0.07, 0.06], paint.deltoid ?? skin, [0, 0, s * 0.25])}
          <group position={[s * 0.2, 1.385, 0]} rotation={[0, 0, s * 0.13]}>
            <mesh geometry={a.upperArm} position={[0, -0.28, 0]} scale={[1, 1, 0.95]} material={paint.upperArm ?? skin} />
            {blob(`bicep${s}`, [0, -0.15, 0.022], [0.032, 0.07, 0.03], paint.upperArm ?? skin)}
            <group position={[0, -0.28, 0]} rotation={[0.08, 0, s * -0.06]}>
              {blob(`elbow${s}`, [0, 0, 0], [0.036, 0.036, 0.034], skin)}
              <mesh geometry={a.forearm} position={[0, -0.25, 0]} scale={[1, 1, 0.85]} material={paint.forearm ?? skin} />
              {/* hand: palm, fingers and thumb */}
              <group position={[0, -0.255, 0.004]}>
                {blob(`palm${s}`, [0, -0.035, 0], [0.026, 0.045, 0.014], skin)}
                {blob(`fingers${s}`, [0, -0.085, 0.002], [0.022, 0.036, 0.011], skin)}
                {blob(`thumb${s}`, [s * -0.022, -0.035, 0.014], [0.009, 0.03, 0.009], skin, [0, 0, s * 0.5])}
              </group>
            </group>
          </group>
        </group>
      ))}

      {/* legs: hip → thigh → knee → shin → foot */}
      {SIDES.map((s) => (
        <group key={`leg${s}`} position={[s * 0.085, 0.9, 0]} rotation={[0, 0, s * -0.02]}>
          <mesh geometry={a.thigh} position={[0, -0.42, 0]} scale={[1, 1, 0.92]} material={skin} />
          {blob(`quad${s}`, [s * 0.01, -0.24, 0.03], [0.055, 0.12, 0.045], skin)}
          <group position={[0, -0.42, 0]}>
            {blob(`knee${s}`, [0, 0, 0.004], [0.05, 0.052, 0.05], paint.knee ?? skin)}
            {blob(`kneecap${s}`, [0, 0.005, 0.04], [0.024, 0.028, 0.016], paint.knee ?? skin)}
            <mesh geometry={a.shin} position={[0, -0.4, 0]} scale={[1, 1, 0.95]} material={skin} />
            {blob(`calf${s}`, [s * 0.006, -0.15, -0.018], [0.045, 0.085, 0.038], skin)}
            {/* foot: heel, arch and toes */}
            <group position={[0, -0.43, 0]}>
              {blob(`heel${s}`, [0, 0.0, -0.005], [0.028, 0.03, 0.035], skin)}
              {blob(`foot${s}`, [s * 0.004, -0.008, 0.055], [0.036, 0.024, 0.075], skin)}
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}

/** Organs and glows for the affected regions (muscles are painted directly on the figure). */
function Organs({ regions, organ, glow }: { regions: BodyRegion[]; organ: THREE.Material; glow: THREE.Material }) {
  const a = useAnatomy();
  const blob = (key: string, position: V3, scale: V3, material: THREE.Material, rotation?: V3) => (
    <mesh key={key} geometry={a.sphere} position={position} scale={scale} rotation={rotation} material={material} />
  );
  return (
    <group>
      {regions.map((region) => {
        switch (region) {
          case "head":
            return blob(region, [0, 1.655, 0.004], [0.115, 0.15, 0.12], glow);
          case "wholeBody":
            return blob(region, [0, 1.655, 0.004], [0.13, 0.165, 0.135], glow);
          case "thyroid":
            return (
              <group key={region}>
                {SIDES.map((s) => blob(`${region}${s}`, [s * 0.02, 1.455, 0.04], [0.016, 0.024, 0.01], organ))}
              </group>
            );
          case "lungs":
            return (
              <group key={region}>
                {SIDES.map((s) =>
                  blob(`${region}${s}`, [s * 0.068, 1.235, 0.008], [0.06, 0.1, 0.05], organ, [0, 0, s * 0.12]),
                )}
              </group>
            );
          case "heart":
            return blob(region, [0.03, 1.215, 0.03], [0.042, 0.052, 0.036], organ, [0, 0, -0.5]);
          case "stomach":
            return blob(region, [0.04, 1.06, 0.02], [0.07, 0.045, 0.035], organ, [0, 0, 0.35]);
          default:
            return null;
        }
      })}
    </group>
  );
}

/** Small glowing dot with a pulsing halo at the focused point. */
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
  const xray = regions.some((r) => FOCUS[r].xray);

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
    const skinProps: THREE.MeshPhysicalMaterialParameters = {
      color: "#D7D2DF",
      roughness: 0.5,
      metalness: 0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.55,
      sheen: 0.5,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color("#FFFFFF"),
      emissive: new THREE.Color(warm ? "#FF7A45" : "#000000"),
      emissiveIntensity: warm ? 0.12 : 0,
    };
    const muscle = new THREE.MeshPhysicalMaterial({
      color: "#C2503D",
      roughness: 0.38,
      clearcoat: 0.45,
      clearcoatRoughness: 0.35,
      emissive: new THREE.Color("#4A1008"),
      emissiveIntensity: 0.3,
    });
    const rash = new THREE.MeshPhysicalMaterial({ ...skinProps, color: "#E3A08E", emissive: new THREE.Color("#7A2A14"), emissiveIntensity: 0.15 });
    const paint: Paint = {};
    if (regions.includes("throat")) paint.neck = muscle;
    if (regions.includes("shoulders")) Object.assign(paint, { deltoid: muscle, trap: muscle, upperArm: muscle });
    if (regions.includes("knees")) paint.knee = muscle;
    if (regions.includes("skin")) Object.assign(paint, { upperArm: rash, forearm: rash });
    return {
      skin: new THREE.MeshPhysicalMaterial(skinProps),
      torso: new THREE.MeshPhysicalMaterial({
        ...skinProps,
        transparent: xray,
        opacity: xray ? 0.3 : 1,
        depthWrite: !xray,
      }),
      organ: muscle,
      glow: new THREE.MeshBasicMaterial({ color: "#FF7A45", transparent: true, opacity: 0.16, depthWrite: false }),
      paint,
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
              <Figure skin={materials.skin} torsoSkin={materials.torso} paint={materials.paint} />
              <Organs regions={regions} organ={materials.organ} glow={materials.glow} />
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
