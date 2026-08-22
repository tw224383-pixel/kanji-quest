const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processAvatars() {
  const imagePath = 'C:\\Users\\wataru\\.gemini\\antigravity\\brain\\db5bbe1b-bee7-404b-80cc-00db5021a39a\\.user_uploaded\\media__1785498339531.jpg';
  const outDir = 'public/avatars';
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const metadata = await sharp(imagePath).metadata();
  const width = metadata.width;
  const height = metadata.height;
  
  console.log(`Original Image Size: ${width}x${height}`);
  
  // The image shows 5 vertical cards.
  // Judging from the image, they occupy most of the height and width, with some margin.
  const marginX = width * 0.05;
  const cardWidth = (width - marginX * 2) / 5;
  const cardHeight = height * 0.8;
  const startY = height * 0.1;
  
  const names = ['cute_princess', 'cute_angel', 'cute_magical', 'cute_fairy', 'cute_mermaid'];
  
  for (let i = 0; i < 5; i++) {
    const startX = marginX + i * cardWidth;
    
    // We want a square avatar, so we crop a square from the center of each card
    const cropSize = Math.floor(Math.min(cardWidth, cardHeight) * 0.9);
    const cropX = Math.floor(startX + (cardWidth - cropSize) / 2);
    const cropY = Math.floor(startY + (cardHeight - cropSize) / 2);
    
    const outPath = path.join(outDir, `${names[i]}.jpg`);
    await sharp(imagePath)
      .extract({ left: cropX, top: cropY, width: cropSize, height: cropSize })
      .toFile(outPath);
    console.log(`Saved ${outPath}`);
  }
}

processAvatars().catch(console.error);
