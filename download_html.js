const fs = require('fs');
const https = require('https');
const path = require('path');

const jsonPath = "C:/Users/PV/.gemini/antigravity/brain/c46b9d8e-4b66-42bc-baa1-3e54d915bc3f/.system_generated/steps/143/output.txt";
const outputDir = path.join(__dirname, 'stitch_screens');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

data.screens.forEach(screen => {
  if (screen.htmlCode && screen.htmlCode.downloadUrl) {
    const safeTitle = screen.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(outputDir, `${safeTitle}.html`);
    
    https.get(screen.htmlCode.downloadUrl, (response) => {
      let html = '';
      response.on('data', (chunk) => {
        html += chunk;
      });
      response.on('end', () => {
        fs.writeFileSync(filePath, html);
        console.log(`Downloaded: ${screen.title} -> ${filePath}`);
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${screen.title}:`, err.message);
    });
  }
});
