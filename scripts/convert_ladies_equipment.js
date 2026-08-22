const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../public/images/gacha_equipment_ladies');
const OUTPUT_DIR = path.join(__dirname, '../public/images/gacha_equipment_ladies_webp');
const THUMBS_DIR = path.join(__dirname, '../public/images/gacha_equipment_ladies_webp/thumbs');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(THUMBS_DIR, { recursive: true });

const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.png'));

async function convertAll() {
  let count = 0;
  for (const file of files) {
    const name = path.basename(file, '.png');
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, name + '.webp');
    const thumbPath = path.join(THUMBS_DIR, name + '.webp');

    // Full size - quality 82, resize to max 600px
    await sharp(inputPath)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);

    // Thumb - 96x96
    await sharp(inputPath)
      .resize(96, 96, { fit: 'cover', position: 'centre' })
      .webp({ quality: 75 })
      .toFile(thumbPath);

    const origSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    const thumbSize = fs.statSync(thumbPath).size;
    console.log(`[${++count}/${files.length}] ${name}: ${(origSize/1024/1024).toFixed(1)}MB -> ${(newSize/1024).toFixed(0)}KB (thumb: ${thumbSize}B)`);
  }
  console.log('Done!');
}

convertAll().catch(console.error);
