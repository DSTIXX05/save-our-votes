import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcDir = path.join(__dirname, 'src', 'Views');
const destDir = path.join(__dirname, 'dist', 'Views');

// Create dest directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

// Copy all files from src/Views to dist/Views
const files = fs.readdirSync(srcDir);
files.forEach((file) => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${file}`);
});

console.log('All view files copied successfully!');
