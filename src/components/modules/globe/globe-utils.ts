import * as THREE from "three";

/**
 * Utilitaires géométriques du globe.
 * Séparés de la scène pour rester testables et lisibles.
 *
 * Note : `buildGraticule` et `buildDotSphere` (globe v1/v2, hologramme sans
 * texture) ont été supprimés — la Terre texturée les a rendus inutiles et
 * ils n'étaient plus importés nulle part.
 */

/**
 * Convertit latitude/longitude (degrés) en position 3D sur une sphère.
 * Convention standard : lat 90° = pôle Nord (+Y), lng 0° = méridien de Greenwich.
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180); // angle polaire
  const theta = (lng + 180) * (Math.PI / 180); // angle azimutal
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Construit la courbe de l'arc d'énergie entre deux points de la sphère.
 * Sommet modéré (×1.3) : l'arc "saute" hors du globe sans sortir du cadre.
 */
export function buildArcCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number
): THREE.QuadraticBezierCurve3 {
  const mid = start
    .clone()
    .add(end)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(radius * 1.3);
  return new THREE.QuadraticBezierCurve3(start.clone(), mid, end.clone());
}

/**
 * Trace au sol : le grand cercle (plus court chemin réel) entre deux points,
 * plaqué sur la surface. C'est l'"ombre" géographique de l'arc d'énergie —
 * elle rend la trajectoire crédible en épousant la courbure de la Terre.
 *
 * Astuce : la normalisation d'une interpolation linéaire entre deux vecteurs
 * unitaires retombe exactement sur le grand cercle (l'espacement des points
 * n'est pas uniforme, sans conséquence visuelle ici).
 *
 * @param start    point de départ sur la sphère
 * @param end      point d'arrivée sur la sphère
 * @param radius   rayon du tracé (légèrement > rayon du globe pour éviter le z-fighting)
 * @param segments nombre de points échantillonnés
 */
export function buildSurfaceArc(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  segments = 64
): THREE.CatmullRomCurve3 {
  const a = start.clone().normalize();
  const b = end.clone().normalize();

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    points.push(a.clone().lerp(b, t).normalize().multiplyScalar(radius));
  }

  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0);
}
