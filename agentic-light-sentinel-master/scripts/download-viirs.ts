import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const NASA_API_KEY = process.env.NASA_API_KEY;
const BASE_URL = 'https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/5000/VNP46A3';

async function downloadVIIRSData() {
  const dataDir = join(process.cwd(), 'data', 'bm');
  
  try {
    // Create data directory if it doesn't exist
    await mkdir(dataDir, { recursive: true });

    // Get the most recent date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // Construct URL for the required tiles
    const tiles = [
      'h24v06', // India North
      'h24v07', // India Central
      'h25v06', // India Northeast
      'h25v07'  // India Southeast
    ];

    for (const tile of tiles) {
      const url = `${BASE_URL}/${year}/${tile}`;
      
      // Fetch file list
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${NASA_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file list: ${response.statusText}`);
      }

      const files = await response.json();
      
      // Download each file
      for (const file of files) {
        if (!file.name.endsWith('.h5')) continue;

        const fileUrl = `${url}/${file.name}`;
        const filePath = join(dataDir, file.name);

        console.log(`Downloading ${file.name}...`);
        
        const fileResponse = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${NASA_API_KEY}`
          }
        });

        if (!fileResponse.ok) {
          throw new Error(`Failed to download file: ${fileResponse.statusText}`);
        }

        const buffer = await fileResponse.buffer();
        await writeFile(filePath, buffer);

        console.log(`Downloaded ${file.name}`);
      }
    }

    console.log('Data download completed successfully');
  } catch (error) {
    console.error('Error downloading VIIRS data:', error);
    process.exit(1);
  }
}

downloadVIIRSData();