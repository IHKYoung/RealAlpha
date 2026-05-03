// ── Color math ───────────────────────────────────────────────────────────────

function colorDist(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
}

function avgRegion(data, W, x0, y0, rw, rh, maxW, maxH) {
  let r = 0, g = 0, b = 0, n = 0;
  const x1 = Math.min(x0 + rw, maxW);
  const y1 = Math.min(y0 + rh, maxH);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 4;
      if (data[i + 3] > 100) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
    }
  }
  return n > 0 ? [r / n, g / n, b / n] : [255, 255, 255];
}

// ── Checkerboard detection ────────────────────────────────────────────────────

function detectCheckerboard(data, W, H, sampleSize) {
  const sz = sampleSize * 2;
  const regions = [[0, 0], [W - sz, 0], [0, H - sz], [W - sz, H - sz]];

  for (const [rx, ry] of regions) {
    const x0 = Math.max(0, rx), y0 = Math.max(0, ry);
    const sw = Math.min(sz, W - x0), sh = Math.min(sz, H - y0);
    if (sw < 8 || sh < 8) continue;

    const bins = new Map();
    for (let y = y0; y < y0 + sh; y++) {
      for (let x = x0; x < x0 + sw; x++) {
        const i = (y * W + x) * 4;
        if (data[i + 3] < 100) continue;
        const r = (data[i]     >> 4) << 4;
        const g = (data[i + 1] >> 4) << 4;
        const b = (data[i + 2] >> 4) << 4;
        const k = (r << 16) | (g << 8) | b;
        bins.set(k, (bins.get(k) || 0) + 1);
      }
    }
    if (bins.size < 2) continue;

    const sorted = [...bins.entries()].sort((a, b) => b[1] - a[1]);
    const total = sw * sh;
    const [k1, c1] = sorted[0], [k2, c2] = sorted[1];
    if (c1 / total < 0.20 || c2 / total < 0.20) continue;
    if ((c1 + c2) / total < 0.70) continue;

    const col1 = [(k1 >> 16) & 0xFF, (k1 >> 8) & 0xFF, k1 & 0xFF];
    const col2 = [(k2 >> 16) & 0xFF, (k2 >> 8) & 0xFF, k2 & 0xFF];
    if (colorDist(...col1, ...col2) < 18) continue;

    let alts = 0, prev = -1;
    for (let x = x0; x < x0 + sw; x++) {
      const i = (y0 * W + x) * 4;
      const bucket = colorDist(data[i], data[i+1], data[i+2], ...col1) <
                     colorDist(data[i], data[i+1], data[i+2], ...col2) ? 0 : 1;
      if (prev !== -1 && bucket !== prev) alts++;
      prev = bucket;
    }
    if (alts >= 3) return [col1, col2];
  }
  return null;
}

// ── Background detection ──────────────────────────────────────────────────────

export function detectBackground(data, W, H) {
  const s = Math.max(10, Math.min(30, Math.floor(Math.min(W, H) * 0.07)));
  const tl = avgRegion(data, W,   0,   0, s, s, W, H);
  const tr = avgRegion(data, W, W-s,   0, s, s, W, H);
  const bl = avgRegion(data, W,   0, H-s, s, s, W, H);
  const br = avgRegion(data, W, W-s, H-s, s, s, W, H);
  const corners = [tl, tr, bl, br];

  let maxD = 0;
  for (let i = 0; i < 4; i++)
    for (let j = i + 1; j < 4; j++)
      maxD = Math.max(maxD, colorDist(...corners[i], ...corners[j]));

  if (maxD < 28) {
    const avg = [
      corners.reduce((a, c) => a + c[0], 0) / 4,
      corners.reduce((a, c) => a + c[1], 0) / 4,
      corners.reduce((a, c) => a + c[2], 0) / 4,
    ];
    return { colors: [avg], type: 'solid' };
  }

  const cb = detectCheckerboard(data, W, H, s);
  if (cb) return { colors: [cb[0], cb[1]], type: 'checker' };

  return { colors: corners, type: 'mixed' };
}

// ── BFS background removal + interior hole fix ────────────────────────────────

export function removeBg(imageData, W, H, tol) {
  const data = imageData.data;
  const n = W * H;
  const { colors: bgColors, type: bgType } = detectBackground(data, W, H);

  function isBg(r, g, b) {
    for (const [br, bg, bb] of bgColors)
      if (colorDist(r, g, b, br, bg, bb) <= tol) return true;
    return false;
  }

  // Step 1: Edge-based BFS flood fill
  const visited = new Uint8Array(n);
  const removed = new Uint8Array(n);
  const queue   = new Int32Array(n);
  let head = 0, tail = 0;

  function enq(idx) {
    if (idx >= 0 && idx < n && !visited[idx]) { visited[idx] = 1; queue[tail++] = idx; }
  }

  for (let x = 0; x < W; x++) { enq(x); enq((H - 1) * W + x); }
  for (let y = 1; y < H - 1; y++) { enq(y * W); enq(y * W + W - 1); }

  while (head < tail) {
    const idx = queue[head++];
    const p = idx * 4;
    if (data[p + 3] >= 10 && !isBg(data[p], data[p+1], data[p+2])) continue;
    removed[idx] = 1;
    const x = idx % W, y = (idx / W) | 0;
    if (x > 0)   enq(idx - 1);
    if (x < W-1) enq(idx + 1);
    if (y > 0)   enq(idx - W);
    if (y < H-1) enq(idx + W);
  }

  // Step 2: Write outer removal so interior analysis sees correct alpha
  for (let i = 0; i < n; i++) {
    if (removed[i]) data[i * 4 + 3] = 0;
  }

  // Step 3: Connected-component BFS on remaining bg-colored pixels
  // Any component not adjacent to a transparent pixel is an interior hole.
  const label = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    if (data[p + 3] < 10) { label[i] = -2; continue; }
    if (!isBg(data[p], data[p+1], data[p+2])) label[i] = -1;
  }

  const removeComp = new Uint8Array(n + 2);
  let nextL = 1;

  for (let start = 0; start < n; start++) {
    if (label[start] !== 0) continue;
    const L = nextL++;
    head = 0; tail = 0;
    label[start] = L;
    queue[tail++] = start;
    let touchesTransparent = false;

    while (head < tail) {
      const idx = queue[head++];
      const x = idx % W, y = (idx / W) | 0;
      const neighbors = [];
      if (x > 0)     neighbors.push(idx - 1);
      if (x < W - 1) neighbors.push(idx + 1);
      if (y > 0)     neighbors.push(idx - W);
      if (y < H - 1) neighbors.push(idx + W);
      for (const ni of neighbors) {
        const nL = label[ni];
        if (nL === 0)  { label[ni] = L; queue[tail++] = ni; }
        else if (nL === -2) touchesTransparent = true;
      }
    }

    if (!touchesTransparent) removeComp[L] = 1;
  }

  for (let i = 0; i < n; i++) {
    if (label[i] > 0 && removeComp[label[i]]) removed[i] = 1;
  }

  // Step 4: Final write + soft-edge feathering
  const featherThresh = tol * 1.8;
  for (let idx = 0; idx < n; idx++) {
    const p = idx * 4;
    if (removed[idx]) { data[p + 3] = 0; continue; }

    const x = idx % W, y = (idx / W) | 0;
    const adjRemoved = (x > 0   && removed[idx - 1])
                     + (x < W-1 && removed[idx + 1])
                     + (y > 0   && removed[idx - W])
                     + (y < H-1 && removed[idx + W]);

    if (adjRemoved > 0) {
      const r = data[p], g = data[p+1], b = data[p+2];
      let minDist = Infinity;
      for (const [br, bg, bb] of bgColors) {
        const d = colorDist(r, g, b, br, bg, bb);
        if (d < minDist) minDist = d;
      }
      if (minDist < featherThresh) {
        const alpha = Math.round((minDist / featherThresh) * 255);
        if (alpha < data[p + 3]) data[p + 3] = alpha;
      }
    }
  }

  return bgType;
}
