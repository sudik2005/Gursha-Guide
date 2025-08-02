import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// List of Ethiopian food images from Unsplash (free to use)
const images = [
  {
    name: 'ethiopian-coffee-ceremony.jpg',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
    description: 'Traditional Ethiopian coffee ceremony'
  },
  {
    name: 'injera-bread.jpg',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    description: 'Fresh injera bread'
  },
  {
    name: 'ethiopian-spices.jpg',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    description: 'Ethiopian spices and berbere'
  },
  {
    name: 'ethiopian-platter.jpg',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    description: 'Traditional Ethiopian meal platter'
  },
  {
    name: 'ethiopian-kitchen.jpg',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    description: 'Ethiopian kitchen preparation'
  },
  {
    name: 'berbere-spice-mix.jpg',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    description: 'Berbere spice mixture'
  },
  {
    name: 'ethiopian-tea.jpg',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
    description: 'Ethiopian tea service'
  },
  {
    name: 'traditional-cooking.jpg',
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    description: 'Traditional Ethiopian cooking'
  }
];

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(imagesDir, filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
      } else {
        console.log(`❌ Failed to download: ${filename} (Status: ${response.statusCode})`);
        reject();
      }
    }).on('error', (err) => {
      console.log(`❌ Error downloading: ${filename} - ${err.message}`);
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('🚀 Starting to download Ethiopian food images...\n');
  
  for (const image of images) {
    try {
      await downloadImage(image.url, image.name);
    } catch (error) {
      console.log(`Failed to download ${image.name}`);
    }
  }
  
  console.log('\n🎉 Download complete!');
  console.log(`📁 Images saved to: ${imagesDir}`);
  console.log('\n📝 You can now use these images in your HTML like this:');
  console.log('<img src="/images/ethiopian-coffee-ceremony.jpg" alt="Ethiopian Coffee Ceremony">');
}

downloadAllImages(); 