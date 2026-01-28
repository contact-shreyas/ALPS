// src/lib/viirs.ts
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import got from "got";
import { prisma } from "./prisma";

// Types for tile summaries
type BBox = [number, number, number, number]; // [west, south, east, north]
type TileSummary = {
  radiance: number;   // mean radiance in nW/cm²/sr
  hotspots: number;   // count of pixels above threshold
};

const TMP = path.join(process.cwd(), ".cache_viirs");
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });

function exe(name: string, fallback: string) {
  return process.env[name] || fallback;
}
function sh(cmd: string, args: string[]) {
  const p = spawnSync(cmd, args, { stdio: "pipe" });
  if (p.status !== 0) throw new Error(`${cmd} ${args.join(" ")}\n${p.stderr?.toString() || p.stdout?.toString()}`);
  return p.stdout?.toString() || "";
}

// Approx MODIS/VIIRS sinusoidal tiles over India (generous bounds)
const INDIA_TILES: Array<{h:number,v:number}> = [];
for (let h = 22; h <= 28; h++) for (let v = 4; v <= 8; v++) INDIA_TILES.push({h,v});

function ymdToDoy(iso: string) {
  const d = new Date(iso+"T00:00:00Z");
  const start = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.floor((+d - +start)/86400000)+1;
}

async function tryDownload(url: string, outPath: string) {
  const u = process.env.EARTHDATA_USERNAME;
  const p = process.env.EARTHDATA_PASSWORD;
  if (!u || !p) throw new Error("No EARTHDATA credentials");
  await got(url, { username: u, password: p, retry: {limit: 2} }).buffer().then(buf => fs.writeFileSync(outPath, buf));
  return outPath;
}

// Get tile summary for a region
export async function fetchViirsTileSummary(bbox: BBox, year: number): Promise<TileSummary> {
  if (process.env.USE_REAL_VIIRS !== "1") {
    // Use sample data for testing
    const samplePath = path.join(process.cwd(), 'src/data/samples/demo_radiance.csv');
    const data = fs.readFileSync(samplePath, 'utf-8');
    const rows = data.split('\n').slice(1); // skip header
    
    const values = rows.map(row => {
      const [lat, lon, rad] = row.split(',').map(Number);
      return { lat, lon, rad };
    }).filter(p => 
      p.lat >= bbox[1] && p.lat <= bbox[3] && 
      p.lon >= bbox[0] && p.lon <= bbox[2]
    );

    const radiance = values.reduce((sum, v) => sum + v.rad, 0) / values.length || 0;
    const hotspots = values.filter(v => v.rad > 15).length;

    return { radiance, hotspots };
  }

  // TODO: Implement real VIIRS tile summary
  throw new Error("Real VIIRS tile summary not implemented");
}

export async function buildDailyMosaic(dateISO: string): Promise<string | "SIMULATED"> {
  if (process.env.USE_REAL_VIIRS !== "1") return "SIMULATED";

  const yyyy = dateISO.slice(0,4);
  const doy = String(ymdToDoy(dateISO)).padStart(3,"0");
  const dayDir = path.join(TMP, `vnp46a2_${yyyy}${doy}`);
  const tifs: string[] = [];

  try {
    if (!fs.existsSync(dayDir)) fs.mkdirSync(dayDir, { recursive: true });

    for (const {h,v} of INDIA_TILES) {
      const hStr = String(h).padStart(2,"0");
      const vStr = String(v).padStart(2,"0");
      const base = `VNP46A2.A${yyyy}${doy}.h${hStr}v${vStr}.001.h5`;
      const url  = `https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/5200/VNP46A2/${yyyy}/${doy}/${base}`;
      const h5   = path.join(dayDir, base);
      const tif  = path.join(dayDir, base.replace(/\.h5$/,".tif"));

      if (!fs.existsSync(h5)) {
        try { await tryDownload(url, h5); }
        catch { continue; } // tile missing -> skip
      }

      // Extract NTL subdataset to GeoTIFF (EPSG:4326 later)
      const sub = `HDF5:"${h5}"://HDFEOS/GRIDS/VNP_Grid_DNB/Data Fields/DNB_BRDF-Corrected_NTL`;
      if (!fs.existsSync(tif)) {
        sh(exe("GDAL_TRANSLATE","gdal_translate"), ["-q", sub, tif]);
      }
      tifs.push(tif);
    }

    if (!tifs.length) return "SIMULATED";

    const mosaic = path.join(dayDir, `mosaic_${yyyy}${doy}.tif`);
    if (!fs.existsSync(mosaic)) {
      // Reproject + merge to WGS84
      const args = ["-q", "-t_srs", "EPSG:4326", "-r", "bilinear", "-of", "GTiff", ...tifs, mosaic];
      sh(exe("GDAL_WARP","gdalwarp"), args);
    }
    return mosaic;
  } catch (e) {
    // Any failure => keep app running with simulated data
    return "SIMULATED";
  }
}

export function simulatedRadiance(code: string, dateISO: string): number {
  // deterministic pseudo-random 14..36
  let h = 0;
  for (const ch of (code+"|"+dateISO)) h = (h*33 + ch.charCodeAt(0)) % 1000003;
  return 14 + (h % 23);
}

export function meanFromCut(mosaic: string, polygonGeoJSON: any): number {
  const cut = path.join(TMP, `cut_${Date.now()}_${Math.random().toString(36).slice(2)}.tif`);
  const poly = path.join(TMP, `poly_${Date.now()}_${Math.random().toString(36).slice(2)}.geojson`);
  fs.writeFileSync(poly, JSON.stringify(polygonGeoJSON));
  sh(exe("GDAL_WARP","gdalwarp"), ["-q", "-cutline", poly, "-crop_to_cutline", "-of", "GTiff", mosaic, cut]);
  const info = sh(exe("GDAL_INFO","gdalinfo"), ["-json", "-stats", cut]);
  const meta = JSON.parse(info);
  const band = meta?.bands?.[0];
  const mean = Number(band?.metadata?.STATISTICS_MEAN ?? band?.mean ?? NaN);
  fs.rmSync(poly, { force: true });
  fs.rmSync(cut, { force: true });
  if (!isFinite(mean)) throw new Error("No mean");
  return mean;
}
