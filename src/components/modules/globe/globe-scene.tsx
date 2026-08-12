"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { LOCATIONS } from "@/lib/constants";
import { formatShortTime } from "@/lib/time";
import { useClock } from "@/hooks/use-clock";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { latLngToVector3, buildArcCurve, buildSurfaceArc } from "./globe-utils";

/**
 * ── GLOBE TERRE RÉALISTE & INTERACTIF ──
 *
 * Rendu (5 couches, du centre vers l'extérieur) :
 *  1. Terre       — shader jour/nuit + relief (normal map) + reflet du soleil
 *                   sur les océans (specular map) + liseré de terminateur
 *  2. Trace au sol — grand cercle Paris↔Raleigh plaqué sur la surface
 *  3. Nuages      — couche translucide qui dérive lentement, éclairée par le soleil
 *  4. Atmosphère  — fresnel bleuté, plus lumineux du côté éclairé
 *  5. Arc d'énergie — tube au dégradé violet→cyan avec 2 impulsions
 *
 * Interactions :
 *  - survol d'une ville  → marqueur qui grossit, rotation auto en pause, curseur "pointer"
 *  - clic sur une ville  → la Terre pivote en douceur pour l'amener face à toi
 *  - clic dans le vide   → reprise de la rotation automatique
 *  - drag                → rotation manuelle (OrbitControls)
 *
 * ⚠️ NE PAS ajouter de post-processing (EffectComposer / Bloom) : cela casse
 * la transparence du canvas et les matériaux additifs — le globe devient une
 * sphère noire. Le halo se fait en CSS derrière le canvas (voir globe.tsx).
 */

const GLOBE_RADIUS = 1;
const COLOR_VIOLET = "#a855f7";
const COLOR_CYAN = "#22d3ee";

const PARIS_POS = latLngToVector3(
  LOCATIONS.paris.lat,
  LOCATIONS.paris.lng,
  GLOBE_RADIUS
);
const RALEIGH_POS = latLngToVector3(
  LOCATIONS.raleigh.lat,
  LOCATIONS.raleigh.lng,
  GLOBE_RADIUS
);

export type CityKey = "paris" | "raleigh";

// Direction (normalisée) de chaque ville → cible de rotation au focus
const CITY_DIR: Record<CityKey, THREE.Vector3> = {
  paris: PARIS_POS.clone().normalize(),
  raleigh: RALEIGH_POS.clone().normalize(),
};

// Vecteurs de travail réutilisés dans les boucles de rendu (zéro allocation/frame)
const TMP_VEC = new THREE.Vector3();
const TMP_SCALE = new THREE.Vector3();

/**
 * Direction du soleil (repère LOCAL du globe, cohérent avec latLngToVector3)
 * à partir de l'heure réelle : point subsolaire = là où le soleil est au zénith.
 *  - longitude subsolaire : 0° à midi UTC, -15°/heure ensuite
 *  - latitude subsolaire   : déclinaison solaire (≈ ±23,44° selon la saison)
 */
function getSunDirection(date: Date): THREE.Vector3 {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear) / 86_400_000);
  const declination = -23.44 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);

  const utcHours =
    date.getUTCHours() +
    date.getUTCMinutes() / 60 +
    date.getUTCSeconds() / 3600;
  const subsolarLon = -15 * (utcHours - 12);

  return latLngToVector3(declination, subsolarLon, 1).normalize();
}

/* ════════════════════════════════════════════════════════════════
 * 1. LA TERRE — shader jour/nuit + relief + reflet océanique
 * ════════════════════════════════════════════════════════════════ */

const earthVertex = /* glsl */ `
  varying vec3 vNormalObj;   // repère OBJET : aligné sur la géographie et le soleil
  varying vec3 vNormalView;  // repère VUE   : pour le reflet et le limbe
  varying vec3 vViewPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormalObj = normalize(normal);
    vNormalView = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const earthFragment = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D normalMap;
  uniform sampler2D specularMap;
  uniform vec3 sunDirection;      // repère OBJET
  uniform vec3 sunDirectionView;  // même soleil, repère VUE
  uniform float normalStrength;

  varying vec3 vNormalObj;
  varying vec3 vNormalView;
  varying vec3 vViewPos;
  varying vec2 vUv;

  void main() {
    /* ── Relief : on perturbe la normale en repère objet ──
     * Base tangente reconstruite analytiquement (UV équirectangulaires) :
     * est = cross(axe Nord, normale) · nord = cross(normale, est).
     * Aux pôles le produit vectoriel dégénère → poleFade éteint le relief. */
    vec3 N = normalize(vNormalObj);
    vec3 eastRaw = cross(vec3(0.0, 1.0, 0.0), N);
    float eastLen = length(eastRaw);
    vec3 east = eastLen > 0.001 ? eastRaw / eastLen : vec3(1.0, 0.0, 0.0);
    vec3 north = cross(N, east);
    float poleFade = smoothstep(0.0, 0.25, eastLen);

    vec3 nm = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    N = normalize(N + (nm.x * east + nm.y * north) * normalStrength * poleFade);

    /* ── Terminateur jour / nuit ── */
    vec3 sunDir = normalize(sunDirection);
    float intensity = dot(N, sunDir);
    float dayAmount = smoothstep(-0.12, 0.28, intensity);

    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    vec3 nightColor = texture2D(nightMap, vUv).rgb * 1.6;

    // Lambert doux : les zones rasantes s'assombrissent → le relief se lit
    float lambert = 0.58 + 0.42 * clamp(intensity, 0.0, 1.0);
    vec3 color = mix(nightColor, dayColor * lambert, dayAmount);

    /* ── Reflet du soleil sur les océans (Blinn-Phong, repère vue) ──
     * La specular map de la NASA est claire sur l'eau, sombre sur les terres. */
    float ocean = texture2D(specularMap, vUv).r;
    vec3 Nv = normalize(vNormalView);
    vec3 viewDir = normalize(-vViewPos);
    vec3 halfDir = normalize(normalize(sunDirectionView) + viewDir);
    float spec = pow(max(dot(Nv, halfDir), 0.0), 34.0);
    color += vec3(1.0, 0.96, 0.86) * spec * ocean * dayAmount * 0.8;

    /* ── Liseré chaud du terminateur (lever / coucher de soleil) ── */
    float term = smoothstep(0.85, 1.0, 1.0 - abs(intensity));
    color += vec3(1.0, 0.55, 0.25) * term * 0.18;

    /* ── Diffusion atmosphérique sur le limbe éclairé ── */
    float rim = pow(1.0 - max(dot(Nv, viewDir), 0.0), 3.0);
    color += vec3(0.32, 0.58, 1.0) * rim * dayAmount * 0.38;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Earth() {
  const [dayMap, nightMap, normalMap, specularMap] = useTexture([
    "/textures/earth.jpg",
    "/textures/earth-night.png",
    "/textures/earth-normal.jpg",
    "/textures/earth-specular.jpg",
  ]);

  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(() => {
    // Configuré ici et pas dans le corps du composant : muter une texture à
    // chaque rendu est un effet de bord (et le compilateur React le signale).
    // Textures de COULEUR → sRGB. Textures de DONNÉES (relief, masque) →
    // linéaire, sinon la décompression sRGB fausse les valeurs lues par le shader.
    dayMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    normalMap.colorSpace = THREE.LinearSRGBColorSpace;
    specularMap.colorSpace = THREE.LinearSRGBColorSpace;
    dayMap.anisotropy = 4;

    return {
      dayMap: { value: dayMap },
      nightMap: { value: nightMap },
      normalMap: { value: normalMap },
      specularMap: { value: specularMap },
      sunDirection: { value: getSunDirection(new Date()) },
      sunDirectionView: { value: new THREE.Vector3(0, 0, 1) },
      normalStrength: { value: 0.55 },
    };
  }, [dayMap, nightMap, normalMap, specularMap]);

  const lastSunRefresh = useRef(0);

  useFrame(({ clock, camera }) => {
    // Le soleil bouge très lentement : recalcul ~toutes les 10 s
    if (clock.getElapsedTime() - lastSunRefresh.current > 10) {
      lastSunRefresh.current = clock.getElapsedTime();
      uniforms.sunDirection.value.copy(getSunDirection(new Date()));
    }

    // Même direction, exprimée en repère vue → nécessaire pour le reflet.
    // Le globe pivote (focus ville, rotation auto) : à recalculer chaque frame.
    const mesh = meshRef.current;
    if (mesh) {
      TMP_VEC.copy(uniforms.sunDirection.value)
        .transformDirection(mesh.matrixWorld)
        .transformDirection(camera.matrixWorldInverse);
      uniforms.sunDirectionView.value.copy(TMP_VEC);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={earthVertex}
        fragmentShader={earthFragment}
      />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════
 * 2. TRACE AU SOL — le grand cercle plaqué sur la surface
 * ════════════════════════════════════════════════════════════════ */

function GroundTrack() {
  const curve = useMemo(
    () => buildSurfaceArc(PARIS_POS, RALEIGH_POS, GLOBE_RADIUS * 1.004),
    []
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 96, 0.0035, 6, false]} />
      <meshBasicMaterial
        color={COLOR_CYAN}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════
 * 3. NUAGES — couche translucide qui dérive, éclairée par le soleil
 * ════════════════════════════════════════════════════════════════ */

const cloudsVertex = /* glsl */ `
  varying vec3 vNormalObj;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormalObj = normalize(normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const cloudsFragment = /* glsl */ `
  uniform sampler2D cloudsMap;
  uniform vec3 sunDirection;
  uniform float drift;

  varying vec3 vNormalObj;
  varying vec2 vUv;

  void main() {
    /* On décale l'UV au lieu de faire tourner le maillage : le repère objet
     * reste aligné sur celui du soleil (sinon le terminateur des nuages
     * dériverait par rapport à celui de la Terre). */
    vec4 texel = texture2D(cloudsMap, vec2(vUv.x + drift, vUv.y));

    /* Robuste aux deux encodages possibles de la texture :
     * blanc + canal alpha, ou niveaux de gris opaques. */
    float density = texel.r * texel.a;
    if (density < 0.02) discard;

    float lit = smoothstep(-0.18, 0.35, dot(normalize(vNormalObj), normalize(sunDirection)));
    vec3 color = mix(vec3(0.30, 0.36, 0.52), vec3(1.0), lit);

    gl_FragColor = vec4(color, density * (0.20 + 0.68 * lit));
  }
`;

function Clouds({ animate }: { animate: boolean }) {
  const cloudsMap = useTexture("/textures/earth-clouds.png");

  const uniforms = useMemo(() => {
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
    // Indispensable : l'UV dérive au-delà de 1 pour faire avancer les nuages
    cloudsMap.wrapS = THREE.RepeatWrapping;

    return {
      cloudsMap: { value: cloudsMap },
      sunDirection: { value: getSunDirection(new Date()) },
      drift: { value: 0 },
    };
  }, [cloudsMap]);

  const lastSunRefresh = useRef(0);

  useFrame(({ clock }, delta) => {
    if (animate) uniforms.drift.value += delta * 0.0035;
    if (clock.getElapsedTime() - lastSunRefresh.current > 10) {
      lastSunRefresh.current = clock.getElapsedTime();
      uniforms.sunDirection.value.copy(getSunDirection(new Date()));
    }
  });

  return (
    <mesh renderOrder={1}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.008, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={cloudsVertex}
        fragmentShader={cloudsFragment}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════
 * 4. ATMOSPHÈRE — fresnel, plus lumineuse du côté éclairé
 * ════════════════════════════════════════════════════════════════ */

const atmosphereVertex = /* glsl */ `
  varying vec3 vDirObj;
  varying vec3 vNormalView;
  void main() {
    // Direction depuis le centre : indépendante du sens des faces (BackSide)
    vDirObj = normalize(position);
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 sunDirection;
  varying vec3 vDirObj;
  varying vec3 vNormalView;

  void main() {
    // Rendu en BackSide : les normales pointent vers l'intérieur, d'où le 0.72 -
    float fresnel = max(pow(0.72 - dot(vNormalView, vec3(0.0, 0.0, 1.0)), 3.0), 0.0);

    // Le limbe s'embrase là où le soleil frappe, s'éteint côté nuit
    float sunFacing = smoothstep(-0.45, 0.75, dot(vDirObj, normalize(sunDirection)));

    vec3 color = mix(vec3(0.14, 0.30, 0.80), vec3(0.40, 0.74, 1.0), sunFacing);
    float alpha = fresnel * (0.32 + 0.95 * sunFacing);

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

function Atmosphere() {
  const uniforms = useMemo(
    () => ({ sunDirection: { value: getSunDirection(new Date()) } }),
    []
  );
  const lastSunRefresh = useRef(0);

  useFrame(({ clock }) => {
    if (clock.getElapsedTime() - lastSunRefresh.current > 10) {
      lastSunRefresh.current = clock.getElapsedTime();
      uniforms.sunDirection.value.copy(getSunDirection(new Date()));
    }
  });

  return (
    <mesh scale={1.18} renderOrder={2}>
      <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════
 * 5. ARC D'ÉNERGIE — dégradé violet→cyan + 2 impulsions croisées
 * ════════════════════════════════════════════════════════════════ */

const arcVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const arcFragment = /* glsl */ `
  uniform float time;
  uniform vec3 colorA;  // Paris
  uniform vec3 colorB;  // Raleigh

  varying vec2 vUv;

  // Impulsion gaussienne centrée sur "center" le long du tube
  float pulse(float x, float center, float width) {
    float d = x - center;
    return exp(-(d * d) / (width * width));
  }

  void main() {
    // uv.x parcourt la LONGUEUR du tube (0 = Paris, 1 = Raleigh)
    vec3 base = mix(colorA, colorB, vUv.x);

    // Deux impulsions, une dans chaque sens
    float t1 = fract(time * 0.18);
    float t2 = 1.0 - fract(time * 0.18 + 0.5);
    float p = pulse(vUv.x, t1, 0.055) + pulse(vUv.x, t2, 0.055);

    // Les extrémités s'estompent : l'arc semble naître du sol
    float ends = smoothstep(0.0, 0.07, vUv.x) * smoothstep(1.0, 0.93, vUv.x);

    vec3 color = base * (0.5 + 2.0 * p);
    float alpha = (0.38 + 0.85 * p) * ends;

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

function EnergyArc({ animate }: { animate: boolean }) {
  const curve = useMemo(
    () => buildArcCurve(PARIS_POS, RALEIGH_POS, GLOBE_RADIUS),
    []
  );

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      colorA: { value: new THREE.Color(COLOR_VIOLET) },
      colorB: { value: new THREE.Color(COLOR_CYAN) },
    }),
    []
  );

  useFrame((_, delta) => {
    if (animate) uniforms.time.value += delta;
  });

  return (
    <mesh renderOrder={3}>
      <tubeGeometry args={[curve, 120, 0.0095, 10, false]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={arcVertex}
        fragmentShader={arcFragment}
        blending={THREE.AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ════════════════════════════════════════════════════════════════
 * MARQUEURS & ÉTIQUETTES DE VILLE
 * ════════════════════════════════════════════════════════════════ */

interface CityMarkerProps {
  position: THREE.Vector3;
  color: string;
  /** Décalage temporel du radar : évite que les deux villes pulsent à l'unisson */
  phase: number;
  animate: boolean;
  onFocus: () => void;
  onHoverChange: (hovered: boolean) => void;
}

function CityMarker({
  position,
  color,
  phase,
  animate,
  onFocus,
  onHoverChange,
}: CityMarkerProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { gl } = useThree();

  useFrame(({ clock }) => {
    // Anneau radar qui se propage
    const ring = ringRef.current;
    if (ring) {
      const t = animate ? ((clock.getElapsedTime() + phase) % 2.4) / 2.4 : 0.3;
      ring.scale.setScalar(1 + t * 2.6);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.75;
    }
    // Cœur qui grossit au survol (lerp doux)
    const core = coreRef.current;
    if (core) {
      core.scale.lerp(TMP_SCALE.setScalar(hovered ? 1.7 : 1), 0.2);
    }
  });

  const setHover = (value: boolean) => {
    setHovered(value);
    onHoverChange(value);
    gl.domElement.style.cursor = value ? "pointer" : "grab";
  };

  const pos = position.clone().multiplyScalar(1.01);

  return (
    <group
      position={pos}
      // Oriente le groupe vers le centre : +Z pointe vers l'intérieur,
      // donc -Z vers le ciel → le faisceau part vers l'extérieur.
      onUpdate={(g) => g.lookAt(0, 0, 0)}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onFocus();
      }}
    >
      {/* Cœur du marqueur */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Anneau radar tangent à la surface */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.032, 0.046, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Faisceau vertical (cône ouvert, pointe vers l'espace) */}
      <mesh position={[0, 0, -0.055]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0035, 0.011, 0.11, 8, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.55 : 0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Étiquette de ville : taille écran fixe, masquée quand la Terre passe devant. */
function CityLabel({
  position,
  cityKey,
  emoji,
  accent,
}: {
  position: THREE.Vector3;
  cityKey: CityKey;
  emoji: string;
  accent: string;
}) {
  const now = useClock();
  const city = LOCATIONS[cityKey];
  const pos = position.clone().multiplyScalar(1.16);

  return (
    <Html position={pos} center occlude zIndexRange={[20, 0]}>
      {/* .chip = pastille du design system ; on assombrit juste le fond,
          illisible autrement par-dessus les océans clairs. */}
      <div
        className="chip -translate-y-1 select-none border-white/20 bg-black/70 backdrop-blur-md"
        style={{ color: accent }}
      >
        <span aria-hidden>{emoji}</span>
        <span className="font-semibold">{city.label}</span>
        {now && (
          <span className="tabular-nums text-white/55">
            {formatShortTime(now, city.timeZone)}
          </span>
        )}
      </div>
    </Html>
  );
}

/* ════════════════════════════════════════════════════════════════
 * CONTRÔLEUR — rotation auto + focus ville en UNE animation
 * ════════════════════════════════════════════════════════════════ */

/**
 * Correctif "globe bloqué" : on anime le globe vers la ville pendant ~0,55 s
 * PUIS on relâche (plus de forçage) → l'utilisateur peut re-glisser librement.
 * Un slerp appliqué en continu rendait le drag impossible.
 */
function FocusRig({
  worldRef,
  controlsRef,
  focusCity,
  paused,
  reduced,
}: {
  worldRef: React.RefObject<THREE.Group | null>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  focusCity: CityKey | null;
  /** Survol d'un marqueur : on gèle la rotation pour ne pas fuir sous le curseur */
  paused: boolean;
  reduced: boolean;
}) {
  const anim = useRef<{
    from: THREE.Quaternion;
    to: THREE.Quaternion;
    t: number;
  } | null>(null);
  const prevCity = useRef<CityKey | null>(null);

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current;
    if (controls) {
      controls.autoRotate = !focusCity && !paused && !reduced;
    }

    const world = worldRef.current;
    if (!world) return;

    if (!focusCity) {
      prevCity.current = null;
      anim.current = null;
      return;
    }

    // Nouveau focus → initialise le tween une seule fois
    if (focusCity !== prevCity.current) {
      const camDir = camera.position.clone().normalize();
      anim.current = {
        from: world.quaternion.clone(),
        to: new THREE.Quaternion().setFromUnitVectors(
          CITY_DIR[focusCity],
          camDir
        ),
        t: reduced ? 1 : 0,
      };
      prevCity.current = focusCity;
      // Animations réduites : recentrage immédiat, sans transition
      if (reduced) world.quaternion.copy(anim.current.to);
    }

    // Joue l'animation (une fois), avec easing, puis relâche
    const a = anim.current;
    if (a && a.t < 1) {
      a.t = Math.min(1, a.t + delta * 1.8); // ~0,55 s
      const e =
        a.t < 0.5 ? 4 * a.t * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 3) / 2;
      world.quaternion.slerpQuaternions(a.from, a.to, e);
    }
    // t >= 1 : on ne touche plus au globe → drag libre
  });

  return null;
}

/** Sphère de repli pendant le téléchargement des textures (~1,7 Mo). */
function EarthPlaceholder() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
      <meshBasicMaterial
        color={COLOR_VIOLET}
        wireframe
        transparent
        opacity={0.12}
        toneMapped={false}
      />
    </mesh>
  );
}

// Caméra cadrée sur l'Atlantique, un peu de recul pour laisser respirer l'arc
const CAMERA_POS = latLngToVector3(34, -42, 3.2);

interface GlobeSceneProps {
  focusCity: CityKey | null;
  onFocusCity: (city: CityKey | null) => void;
}

export default function GlobeScene({ focusCity, onFocusCity }: GlobeSceneProps) {
  const worldRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hoveringCity, setHoveringCity] = useState(false);
  const reduced = useReducedMotion();
  const animate = !reduced;

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: CAMERA_POS.toArray(), fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      // Clic dans le vide → on relâche le focus (reprise de la rotation auto)
      onPointerMissed={() => onFocusCity(null)}
    >
      {/* Tout ce qui doit pivoter ensemble lors d'un focus ville */}
      <group ref={worldRef}>
        <Suspense fallback={<EarthPlaceholder />}>
          <Earth />
          <GroundTrack />
          <Clouds animate={animate} />
        </Suspense>

        <Atmosphere />

        <CityMarker
          position={PARIS_POS}
          color={COLOR_VIOLET}
          phase={0}
          animate={animate}
          onFocus={() => onFocusCity("paris")}
          onHoverChange={setHoveringCity}
        />
        <CityMarker
          position={RALEIGH_POS}
          color={COLOR_CYAN}
          phase={1.2}
          animate={animate}
          onFocus={() => onFocusCity("raleigh")}
          onHoverChange={setHoveringCity}
        />

        <CityLabel
          position={PARIS_POS}
          cityKey="paris"
          emoji="💜"
          accent={COLOR_VIOLET}
        />
        <CityLabel
          position={RALEIGH_POS}
          cityKey="raleigh"
          emoji="💙"
          accent={COLOR_CYAN}
        />

        <EnergyArc animate={animate} />
      </group>

      <FocusRig
        worldRef={worldRef}
        controlsRef={controlsRef}
        focusCity={focusCity}
        paused={hoveringCity}
        reduced={reduced}
      />

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.45}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.5}
      />
    </Canvas>
  );
}
