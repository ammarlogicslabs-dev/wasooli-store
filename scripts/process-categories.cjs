const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicCategoriesDir = path.resolve(__dirname, '../public/categories');
const outDir = path.resolve(__dirname, '../public/categories/transparent');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = [
  { file: 'adapter.jpg', name: 'adapter.png', cat: 'Adapters & NICs' },
  { file: 'cable.jpg', name: 'cable.png', cat: 'Cabling & Connectivity' },
  { file: 'network.jpg', name: 'network.png', cat: 'Network Security' },
  { file: 'optical.jpg', name: 'optical.png', cat: 'Optical & Fiber' },
  { file: 'PoE.jpg', name: 'PoE.png', cat: 'PoE' },
  { file: 'power & Racks.jpg', name: 'power-racks.png', cat: 'Power & Racks' },
  { file: 'router.jpg', name: 'router.png', cat: 'Routing' },
  { file: 'switch.jpg', name: 'switch.png', cat: 'Switching' },
  { file: 'tools.jpg', name: 'tools.png', cat: 'Tools & Accessories' },
  { file: 'wireless.jpg', name: 'wireless.png', cat: 'Wireless' },
];

async function removeBackground(inputPath, outputPath) {
  // Resize to 800px max to keep high detail while fast
  const resized = await sharp(inputPath)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const { data, info } = await sharp(resized)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qStart = 0;
  let qEnd = 0;

  function isBg(x, y) {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const dr = 255 - r;
    const dg = 255 - g;
    const db = 255 - b;
    const distSq = dr * dr + dg * dg + db * db;
    // Pixels with R,G,B all > ~230 (distance squared from 255,255,255 is < 1400)
    return distSq < 1400;
  }

  // Seed borders into queue
  for (let x = 0; x < width; x++) {
    if (isBg(x, 0)) {
      const idx = x;
      visited[idx] = 1;
      queue[qEnd++] = idx;
    }
    const bIdx = (height - 1) * width + x;
    if (isBg(x, height - 1)) {
      visited[bIdx] = 1;
      queue[qEnd++] = bIdx;
    }
  }

  for (let y = 0; y < height; y++) {
    const lIdx = y * width;
    if (!visited[lIdx] && isBg(0, y)) {
      visited[lIdx] = 1;
      queue[qEnd++] = lIdx;
    }
    const rIdx = y * width + (width - 1);
    if (!visited[rIdx] && isBg(width - 1, y)) {
      visited[rIdx] = 1;
      queue[qEnd++] = rIdx;
    }
  }

  // BFS Flood-fill from borders
  while (qStart < qEnd) {
    const curr = queue[qStart++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      [cx - 1, cy],
      [cx + 1, cy],
      [cx, cy - 1],
      [cx, cy + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isBg(nx, ny)) {
          visited[nIdx] = 1;
          queue[qEnd++] = nIdx;
        }
      }
    }
  }

  // Set alpha of visited pixels to 0, and feather boundary pixels for smoothness
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const dataIdx = pIdx * 4;

      if (visited[pIdx]) {
        data[dataIdx + 3] = 0;
      } else {
        let bgNeighbors = 0;
        if (x > 0 && visited[pIdx - 1]) bgNeighbors++;
        if (x < width - 1 && visited[pIdx + 1]) bgNeighbors++;
        if (y > 0 && visited[pIdx - width]) bgNeighbors++;
        if (y < height - 1 && visited[pIdx + width]) bgNeighbors++;

        if (bgNeighbors > 0) {
          const r = data[dataIdx];
          const g = data[dataIdx + 1];
          const b = data[dataIdx + 2];
          const dr = 255 - r;
          const dg = 255 - g;
          const db = 255 - b;
          const dist = Math.sqrt(dr * dr + dg * dg + db * db);
          if (dist < 45) {
            data[dataIdx + 3] = Math.min(255, Math.max(0, Math.round((dist / 45) * 255)));
          }
        }
      }
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .trim()
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log(`Success: ${path.basename(outputPath)}`);
}

async function main() {
  for (const item of files) {
    const inPath = path.join(publicCategoriesDir, item.file);
    const outPath = path.join(outDir, item.name);
    try {
      await removeBackground(inPath, outPath);
    } catch (e) {
      console.error(`Error processing ${item.file}:`, e);
    }
  }
  console.log('All category images processed successfully!');
}

main();

