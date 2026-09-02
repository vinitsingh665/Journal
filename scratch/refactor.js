const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('git grep -l @/lib/yahoo-finance').toString().split('\n').filter(Boolean);
files.forEach(f => {
  if (!f.includes('api/chart/route.ts') && !f.includes('yahoo-finance.ts')) {
    const content = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, content.replace(/@\/lib\/yahoo-finance/g, '@/lib/finance'));
    console.log('Updated ' + f);
  }
});
