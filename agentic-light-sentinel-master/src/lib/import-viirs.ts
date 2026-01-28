import { got } from "got";
import fs from "fs";
import path from "path";
import { simulatedRadiance, meanFromCut } from "./viirs";
import { prisma } from "./prisma";

interface VIIRSImportOptions {
  dateISO: string;
  useSimulated?: boolean;
  skipExisting?: boolean;
}

export async function importVIIRSData({
  dateISO,
  useSimulated = process.env.USE_REAL_VIIRS !== "1",
  skipExisting = true,
}: VIIRSImportOptions) {
  try {
    const date = new Date(dateISO + "T00:00:00Z");

    // Skip if already imported and skipExisting is true
    if (skipExisting) {
      const existing = await prisma.districtDailyMetric.count({
        where: { date }
      });
      if (existing > 0) {
        console.log(`Data for ${dateISO} already exists, skipping...`);
        return true;
      }
    }

    // 1) Process districts
    const districts = await prisma.district.findMany({
      select: { code: true, geomGeoJSON: true, stateCode: true },
    });
    if (!districts.length) {
      console.log("No districts in DB. Run: pnpm import:geo");
      return false;
    }

    console.log(`Processing ${districts.length} districts for ${dateISO}...`);
    let dCnt = 0;

    for (const d of districts) {
      let radiance: number;
      if (useSimulated) {
        radiance = simulatedRadiance(d.code, dateISO);
      } else {
        // Get real VIIRS data for district bounds
        const bbox = getBoundingBox(d.geomGeoJSON);
        radiance = meanFromCut(await downloadVIIRSDataForBBox(bbox, date), d.geomGeoJSON);
      }

      const hotspots = Math.max(0, Math.round((radiance - 18) * 1.1));

      await prisma.districtDailyMetric.upsert({
        where: { code_date: { code: d.code, date } },
        create: { code: d.code, date, radiance, hotspots },
        update: { radiance, hotspots },
      });

      dCnt++;
      if (dCnt % 100 === 0) {
        console.log(`...${Math.round((dCnt / districts.length) * 100)}% complete`);
      }
    }

    // 2) Aggregate to states
    const states = await prisma.state.findMany({ select: { code: true } });
    for (const s of states) {
      const districtsInState = await prisma.district.findMany({
        where: { stateCode: s.code },
        select: { code: true },
      });
      if (!districtsInState.length) continue;

      const metrics = await prisma.districtDailyMetric.findMany({
        where: { 
          code: { in: districtsInState.map((p) => p.code) }, 
          date 
        },
        select: { radiance: true, hotspots: true },
      });
      if (!metrics.length) continue;

      const meanRadiance = metrics.reduce((a, b) => a + b.radiance, 0) / metrics.length;
      const sumHotspots = metrics.reduce((a, b) => a + b.hotspots, 0);

      await prisma.stateDailyMetric.upsert({
        where: { code_date: { code: s.code, date } },
        create: { code: s.code, date, radiance: meanRadiance, hotspots: sumHotspots },
        update: { radiance: meanRadiance, hotspots: sumHotspots },
      });
    }

    console.log(`Successfully imported VIIRS data for ${dateISO}`);
    return true;
  } catch (error) {
    console.error("Error importing VIIRS data:", error);
    return false;
  }
}

function getBoundingBox(geojson: any): [number, number, number, number] {
  // Parse GeoJSON if it's a string
  const data = typeof geojson === 'string' ? JSON.parse(geojson) : geojson;
  
  // Helper to get coordinates from any geometry type
  function getCoords(obj: any): number[][] {
    const type = obj.type;
    const coords = obj.coordinates;
    
    switch (type) {
      case 'Point':
        return [coords];
      case 'LineString':
        return coords;
      case 'Polygon':
        return coords[0]; // Use outer ring
      case 'MultiPolygon':
        return coords.flatMap((poly: any) => poly[0]);
      default:
        throw new Error(`Unsupported geometry type: ${type}`);
    }
  }

  // Get all coordinates from all features
  let allCoords: number[][] = [];
  if (data.type === 'Feature') {
    allCoords = getCoords(data.geometry);
  } else if (data.type === 'FeatureCollection') {
    allCoords = data.features.flatMap((f: any) => getCoords(f.geometry));
  } else {
    allCoords = getCoords(data);
  }

  // Calculate bounds
  const [minX, minY, maxX, maxY] = allCoords.reduce(
    ([minX, minY, maxX, maxY], [x, y]) => [
      Math.min(minX, x),
      Math.min(minY, y),
      Math.max(maxX, x),
      Math.max(maxY, y),
    ],
    [Infinity, Infinity, -Infinity, -Infinity]
  );

  return [minX, minY, maxX, maxY] as [number, number, number, number];
}

async function downloadVIIRSDataForBBox(
  bbox: [number, number, number, number],
  date: Date
): Promise<string> {
  const year = date.getFullYear();
  const doy = getDayOfYear(date);
  const doyStr = String(doy).padStart(3, '0');
  
  // Create a unique directory for this request
  const cacheDir = path.join(process.cwd(), '.cache_viirs', `${year}${doyStr}`);
  fs.mkdirSync(cacheDir, { recursive: true });

  // Get tiles that intersect with the bbox
  const tilesToDownload = getTilesForBBox(bbox);
  const downloadedTiles: string[] = [];

  // Download each tile
  for (const { h, v } of tilesToDownload) {
    const hStr = String(h).padStart(2, '0');
    const vStr = String(v).padStart(2, '0');
    const filename = `VNP46A2.A${year}${doyStr}.h${hStr}v${vStr}.001.h5`;
    const localPath = path.join(cacheDir, filename);

    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      downloadedTiles.push(localPath);
      continue;
    }

    // Download from NASA servers
    const url = `https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/5200/VNP46A2/${year}/${doyStr}/${filename}`;
    try {
      if (!process.env.EARTHDATA_USERNAME || !process.env.EARTHDATA_PASSWORD) {
        throw new Error('NASA EarthData credentials not configured');
      }

      const response = await got.get(url, {
        username: process.env.EARTHDATA_USERNAME,
        password: process.env.EARTHDATA_PASSWORD,
        timeout: { request: 30000 },
        retry: { limit: 3 }
      });

      const stream = got.stream(url, {
        username: process.env.EARTHDATA_USERNAME,
        password: process.env.EARTHDATA_PASSWORD
      });

      const writeStream = fs.createWriteStream(localPath);
      await new Promise((resolve, reject) => {
        stream.pipe(writeStream)
          .on('finish', resolve)
          .on('error', reject);
      });
      downloadedTiles.push(localPath);
    } catch (error) {
      console.warn(`Failed to download tile h${h}v${v}:`, error);
      continue;
    }
  }

  return downloadedTiles.join(',');
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + 
    ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getTilesForBBox(bbox: [number, number, number, number]): Array<{h: number, v: number}> {
  // Convert geographic bounds to MODIS tile numbers
  // This is a simplified version - in reality need proper sinusoidal projection math
  const [west, south, east, north] = bbox;
  
  // Approximate MODIS/VIIRS sinusoidal tiles (rough calculation)
  const minH = Math.floor((west + 180) / 10);
  const maxH = Math.floor((east + 180) / 10);
  const minV = Math.floor((90 - north) / 10);
  const maxV = Math.floor((90 - south) / 10);

  const tiles: Array<{h: number, v: number}> = [];
  for (let h = minH; h <= maxH; h++) {
    for (let v = minV; v <= maxV; v++) {
      tiles.push({ h, v });
    }
  }
  return tiles;
}