/* eslint-disable react/no-unknown-property -- React Three Fiber scene props (position, args, intensity) are valid here. */
import React, { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { View, Text, StyleSheet, PanResponder } from "react-native";
import * as THREE from "three";
import { Canvas, useFrame } from "./three/Canvas";
import BodyMap from "./BodyMap";
import type { BodyRegion } from "../lib/healthScreening";

/**
 * A real 3D body for Health Screening, built from smooth primitives (no model file to download).
 * Drag sideways to turn it. Affected areas are drawn as red muscle or organs; for organs inside the
 * chest or belly the skin turns see-through. The camera glides to whichever area is selected.
 */

type V3 = [number, number, number];

const SKIN = "#D8D4E0";
const MUSCLE = "#C9563F";
const GLOW = "#F59E5B";

/** Where to aim the camera and the marker for each region. */
const FOCUS: Record<BodyRegion, { point: V3; camY: number; dist: number; xray?: boolean }> = {
  head: { point: [0, 1.66, 0.11], camY: 1.58, dist: 1.35 },
  throat: { point: [0, 1.47, 0.06], camY: 1.48, dist: 1.35 },
  thyroid: { point: [0, 1.44, 0.06], camY: 1.46, dist: 1.35 },
  lungs: { point: [-0.075, 1.22, 0.07], camY: 1.2, dist: 1.7, xray: true },
  heart: { point: [0.04, 1.2, 0.07], camY: 1.2, dist: 1.65, xray: true },
  stomach: { point: [0.05, 1.03, 0.08], camY: 1.08, dist: 1.7, xray: true },
  shoulders: { point: [-0.228, 1.37, 0.066], camY: 1.3, dist: 1.75 },
  knees: { point: [-0.095, 0.44, 0.07], camY: 0.55, dist: 1.7 },
  skin: { point: [-0.29, 1.05, 0.05], camY: 1.0, dist: 2.7 },
  wholeBody: { point: [0, 1.66, 0.11], camY: 0.95, dist: 3.0 },
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

// ---- Building blocks -------------------------------------------------------------------------

type PartProps = { position: V3; scale?: V3; rotation?: V3; material: THREE.Material };

function Ball({ r, ...p }: PartProps & { r: number }) {
  return (
    <mesh position={p.position} scale={p.scale} rotation={p.rotation} material={p.material}>
      <sphereGeometry args={[r, 40, 32]} />
    </mesh>
  );
}

function Capsule({ r, len, ...p }: PartProps & { r: number; len: number }) {
  return (
    <mesh position={p.position} scale={p.scale} rotation={p.rotation} material={p.material}>
      <capsuleGeometry args={[r, len, 12, 32]} />
    </mesh>
  );
}

const SIDES = [-1, 1] as const;

/** The base figure. `skin` is used for most parts; `torsoSkin` lets the chest go see-through. */
function Figure({ skin, torsoSkin }: { skin: THREE.Material; torsoSkin: THREE.Material }) {
  return (
    <group>
      {/* head */}
      <Ball r={0.1} position={[0, 1.63, 0]} scale={[0.95, 1.18, 1.05]} material={skin} />
      <Ball r={0.02} position={[0, 1.615, 0.105]} scale={[0.7, 1.2, 1]} material={skin} />
      {SIDES.map((s) => (
        <Ball key={`ear${s}`} r={0.025} position={[s * 0.097, 1.63, 0]} scale={[0.5, 1, 0.8]} material={skin} />
      ))}
      {/* neck and trapezius */}
      <mesh position={[0, 1.47, 0]} material={skin}>
        <cylinderGeometry args={[0.045, 0.056, 0.14, 32]} />
      </mesh>
      <Ball r={0.09} position={[0, 1.415, -0.01]} scale={[1.65, 0.5, 0.8]} material={skin} />

      {/* torso, chest, abs, pelvis */}
      <Capsule r={0.16} len={0.32} position={[0, 1.18, 0]} scale={[1.2, 1, 0.68]} material={torsoSkin} />
      {SIDES.map((s) => (
        <Ball key={`pec${s}`} r={0.085} position={[s * 0.075, 1.28, 0.08]} scale={[1.05, 0.7, 0.36]} material={torsoSkin} />
      ))}
      {[1.15, 1.09, 1.03].map((y) =>
        SIDES.map((s) => (
          <Ball key={`ab${y}${s}`} r={0.028} position={[s * 0.032, y, 0.098]} scale={[1, 0.8, 0.28]} material={torsoSkin} />
        )),
      )}
      <Ball r={0.15} position={[0, 0.9, 0]} scale={[1.15, 0.75, 0.8]} material={skin} />

      {/* arms */}
      {SIDES.map((s) => (
        <group key={`arm${s}`}>
          <Ball r={0.062} position={[s * 0.228, 1.36, 0]} scale={[1, 1.15, 1]} material={skin} />
          <Capsule r={0.048} len={0.22} position={[s * 0.265, 1.18, 0]} rotation={[0, 0, s * 0.1]} material={skin} />
          <Capsule r={0.04} len={0.22} position={[s * 0.295, 0.93, 0.01]} rotation={[0, 0, s * 0.06]} material={skin} />
          <Ball r={0.045} position={[s * 0.31, 0.76, 0.02]} scale={[0.75, 1.25, 0.45]} material={skin} />
        </group>
      ))}

      {/* legs */}
      {SIDES.map((s) => (
        <group key={`leg${s}`}>
          <Capsule r={0.075} len={0.3} position={[s * 0.095, 0.62, 0]} material={skin} />
          <Ball r={0.055} position={[s * 0.095, 0.44, 0.02]} material={skin} />
          <Capsule r={0.055} len={0.3} position={[s * 0.095, 0.25, 0]} material={skin} />
          <Capsule r={0.04} len={0.1} position={[s * 0.095, 0.04, 0.05]} rotation={[Math.PI / 2, 0, 0]} material={skin} />
        </group>
      ))}
    </group>
  );
}

/** Red muscle / organ shapes for the affected regions. */
function Highlights({ regions, muscle, glow }: { regions: BodyRegion[]; muscle: THREE.Material; glow: THREE.Material }) {
  return (
    <group>
      {regions.map((region) => {
        switch (region) {
          case "head":
            return <Ball key={region} r={0.145} position={[0, 1.64, 0]} scale={[0.95, 1.12, 1]} material={glow} />;
          case "throat":
            return (
              <mesh key={region} position={[0, 1.47, 0.004]} material={muscle}>
                <cylinderGeometry args={[0.049, 0.06, 0.1, 32]} />
              </mesh>
            );
          case "thyroid":
            return (
              <group key={region}>
                {SIDES.map((s) => (
                  <Ball key={s} r={0.022} position={[s * 0.022, 1.44, 0.045]} scale={[1, 1.3, 0.7]} material={muscle} />
                ))}
              </group>
            );
          case "lungs":
            return (
              <group key={region}>
                {SIDES.map((s) => (
                  <Ball key={s} r={0.075} position={[s * 0.075, 1.2, 0.01]} scale={[0.85, 1.35, 0.7]} material={muscle} />
                ))}
              </group>
            );
          case "heart":
            return <Ball key={region} r={0.05} position={[0.04, 1.2, 0.04]} scale={[0.9, 1.1, 0.85]} rotation={[0, 0, -0.5]} material={muscle} />;
          case "stomach":
            return <Ball key={region} r={0.065} position={[0.05, 1.03, 0.03]} scale={[1.25, 0.8, 0.7]} rotation={[0, 0, 0.3]} material={muscle} />;
          case "shoulders":
            return (
              <group key={region}>
                {SIDES.map((s) => (
                  <group key={s}>
                    <Ball r={0.065} position={[s * 0.228, 1.36, 0.002]} scale={[1, 1.15, 1]} material={muscle} />
                    <Capsule r={0.05} len={0.12} position={[s * 0.26, 1.23, 0.002]} rotation={[0, 0, s * 0.1]} material={muscle} />
                    <Ball r={0.07} position={[s * 0.11, 1.42, -0.005]} scale={[1.3, 0.48, 0.82]} material={muscle} />
                  </group>
                ))}
              </group>
            );
          case "knees":
            return (
              <group key={region}>
                {SIDES.map((s) => (
                  <Ball key={s} r={0.058} position={[s * 0.095, 0.44, 0.02]} material={muscle} />
                ))}
              </group>
            );
          case "skin":
            return (
              <group key={region}>
                {SIDES.map((s) => (
                  <Capsule key={s} r={0.052} len={0.22} position={[s * 0.265, 1.18, 0]} rotation={[0, 0, s * 0.1]} material={glow} />
                ))}
              </group>
            );
          case "wholeBody":
            return <Ball key={region} r={0.16} position={[0, 1.64, 0]} scale={[0.95, 1.1, 1]} material={glow} />;
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
        <sphereGeometry args={[0.014, 20, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.022, 20, 16]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.022, 20, 16]} />
        <meshBasicMaterial color={GLOW} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Turns the body (drag or gentle idle sway) and glides the camera to the focused area. */
function Rig({
  focus,
  drag,
  children,
}: {
  focus: BodyRegion;
  drag: Turn;
  children: ReactNode;
}) {
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
    return {
      skin: new THREE.MeshStandardMaterial({
        color: SKIN,
        roughness: 0.55,
        metalness: 0.04,
        emissive: warm ? new THREE.Color("#FF7A45") : new THREE.Color("#000000"),
        emissiveIntensity: warm ? 0.12 : 0,
      }),
      torso: new THREE.MeshStandardMaterial({
        color: SKIN,
        roughness: 0.55,
        metalness: 0.04,
        transparent: xray,
        opacity: xray ? 0.32 : 1,
        depthWrite: !xray,
      }),
      muscle: new THREE.MeshStandardMaterial({
        color: MUSCLE,
        roughness: 0.42,
        metalness: 0.05,
        emissive: new THREE.Color("#5A140A"),
        emissiveIntensity: 0.25,
      }),
      glow: new THREE.MeshBasicMaterial({ color: "#FF7A45", transparent: true, opacity: 0.28, depthWrite: false }),
    };
  }, [regions, xray]);

  const fallback = <BodyMap regions={regions} focus={focus} label={label} height={height} />;

  return (
    <View style={{ height }}>
      <Fallback fallback={fallback}>
        <View style={StyleSheet.absoluteFill} {...pan.panHandlers}>
          <Canvas camera={{ position: [0, 1.2, 2.6], fov: 32, near: 0.05, far: 20 }} style={{ flex: 1 }}>
            <ambientLight intensity={0.45} />
            <hemisphereLight args={["#FFFFFF", "#D9C7B8", 0.7]} />
            <directionalLight position={[-1.5, 2.5, 2]} intensity={1.7} />
            <directionalLight position={[1.6, 1.2, -1.8]} intensity={0.7} color="#FFD3B8" />
            <Rig focus={focus} drag={drag}>
              <Figure skin={materials.skin} torsoSkin={materials.torso} />
              <Highlights regions={regions} muscle={materials.muscle} glow={materials.glow} />
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
