import sharp from 'sharp';
import { join } from 'path';

// Create a 256x256 transparent PNG
const width = 256;
const height = 256;
const channels = 4; // RGBA
const transparentPixel = Buffer.alloc(width * height * channels, 0);

sharp(transparentPixel, {
  raw: {
    width,
    height,
    channels
  }
})
  .png()
  .toFile(join(process.cwd(), 'public', 'transparent.png'))
  .then(() => console.log('Created transparent tile'))
  .catch(err => console.error('Error creating transparent tile:', err));