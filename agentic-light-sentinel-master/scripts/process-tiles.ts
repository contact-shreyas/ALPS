import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

async function processTiles() {
  const dataDir = path.join(process.cwd(), 'data', 'bm');
  const outputDir = path.join(process.cwd(), 'data', 'tiles');
  
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Get list of HDF5 files
    const files = await fs.readdir(dataDir);
    const h5Files = files.filter(f => f.endsWith('.h5'));

    for (const file of h5Files) {
      console.log(`Processing ${file}...`);
      
      // Extract date information from filename
      const match = file.match(/A(\d{4})(\d{3})/);
      if (!match) continue;
      
      const year = match[1];
      const doy = match[2];
      const date = new Date(parseInt(year), 0, parseInt(doy));
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Create directory structure
      const tileDir = path.join(outputDir, year, month, day);
      await fs.mkdir(tileDir, { recursive: true });

      // Use gdal to process HDF5 to Cloud Optimized GeoTIFF
      const inputPath = path.join(dataDir, file);
      const cogPath = path.join(tileDir, 'radiance.tif');
      
      await execAsync(`gdal_translate -of COG -co COMPRESS=LZW -co PREDICTOR=2 HDF5:${inputPath}://HDFEOS/GRIDS/VNP_Grid_DNB/Data_Fields/DNB_BRDF_Corrected_NTL ${cogPath}`);

      // Generate tiles using gdal2tiles.py
      await execAsync(`gdal2tiles.py --zoom 0-12 --processes 4 ${cogPath} ${tileDir}`);

      console.log(`Completed processing ${file}`);
    }

    console.log('All files processed successfully');
  } catch (error) {
    console.error('Error processing tiles:', error);
    process.exit(1);
  }
}

processTiles();