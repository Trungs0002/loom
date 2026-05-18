const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) return walk(full);
    if (!f.endsWith('.js') && !f.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(full, 'utf8');
    const original = content;
    
    // Replace all occurrences of '${API_BASE}...' (single-quoted broken template literal)
    // with `${API_BASE}...` (real template literal)
    content = content.replace(/'(\$\{API_BASE\}[^']*)'/g, (match, inner) => {
      return '`' + inner + '`';
    });
    
    if (content !== original) {
      fs.writeFileSync(full, content);
      console.log('Fixed:', full);
    }
  });
}

walk(srcDir);
console.log('All done!');
