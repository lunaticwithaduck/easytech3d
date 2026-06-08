/**
 * k-means with k-means++ seeding. Operates on arbitrary numeric vectors,
 * Euclidean distance. We use it on Lab triples — Lab Euclidean ≈ ΔE76 ≈ perceptual.
 */

function euclidean(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

function kmeansPlusPlus(points, k, rng) {
  const centroids = [];
  const first = points[Math.floor(rng() * points.length)];
  centroids.push(first.slice());

  for (let c = 1; c < k; c++) {
    const dists = new Float64Array(points.length);
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      let minD = Infinity;
      for (const cen of centroids) {
        const d = euclidean(points[i], cen);
        if (d < minD) minD = d;
      }
      dists[i] = minD * minD;
      total += dists[i];
    }
    if (total === 0) {
      centroids.push(points[Math.floor(rng() * points.length)].slice());
      continue;
    }
    let r = rng() * total;
    let idx = 0;
    while (idx < points.length - 1 && r > dists[idx]) {
      r -= dists[idx];
      idx++;
    }
    centroids.push(points[idx].slice());
  }
  return centroids;
}

function kmeans(points, k, { maxIter = 30, seed = 1 } = {}) {
  if (!points.length) return [];
  if (k >= points.length) {
    return points.map((p) => ({ centroid: p.slice(), size: 1, share: 1 / points.length }));
  }

  // Deterministic PRNG (mulberry32) so the same data → same palette across runs.
  let s = seed >>> 0;
  const rng = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let centroids = kmeansPlusPlus(points, k, rng);
  const dim = points[0].length;

  const assignments = new Int32Array(points.length);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = 0;
    for (let i = 0; i < points.length; i++) {
      let best = 0, bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = euclidean(points[i], centroids[c]);
        if (d < bestD) { bestD = d; best = c; }
      }
      if (assignments[i] !== best) { assignments[i] = best; changed++; }
    }

    const sums = Array.from({ length: k }, () => new Float64Array(dim));
    const counts = new Int32Array(k);
    for (let i = 0; i < points.length; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dim; d++) sums[c][d] += points[i][d];
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] === 0) {
        // Reseed empty cluster to a random point — avoids dead clusters
        centroids[c] = points[Math.floor(rng() * points.length)].slice();
        continue;
      }
      for (let d = 0; d < dim; d++) centroids[c][d] = sums[c][d] / counts[c];
    }

    if (!changed) break;
  }

  const counts = new Int32Array(k);
  for (let i = 0; i < points.length; i++) counts[assignments[i]]++;
  const total = points.length;
  const clusters = centroids
    .map((c, i) => ({ centroid: c, size: counts[i], share: counts[i] / total }))
    .filter((c) => c.size > 0)
    .sort((a, b) => b.size - a.size);

  return clusters;
}

module.exports = { kmeans };
