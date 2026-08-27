const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. AnalyticsDashboard.tsx
const analyticsPath = path.resolve('apps/web/components/analytics/AnalyticsDashboard.tsx');
replaceInFile(analyticsPath, [
  { search: /, borderDash: \[5, 5\]/g, replace: '' },
  { search: /borderWidth: 0,\s*cutout: '75%',/g, replace: 'borderWidth: 0,' },
  { search: /options=\{\{ responsive: true, maintainAspectRatio: false, plugins: \{ legend: \{ display: false \} \} \}\}/g, replace: 'options={{ responsive: true, maintainAspectRatio: false, cutout: "75%", plugins: { legend: { display: false } } }}' }
]);

// 2. Risk Calculator page
const riskPath = path.resolve('apps/web/app/(dashboard)/risk-calculator/page.tsx');
replaceInFile(riskPath, [
  { search: /, borderDash: \[5, 5\]/g, replace: '' }
]);

// 3. Mistakes page
const mistakesPath = path.resolve('apps/web/app/(dashboard)/mistakes/page.tsx');
replaceInFile(mistakesPath, [
  { search: /weight: "500"/g, replace: 'weight: "bold"' }
]);

// 4. TradeForm.tsx
const tradeFormPath = path.resolve('apps/web/components/trades/TradeForm.tsx');
replaceInFile(tradeFormPath, [
  { search: /parseFloat\(prev\.price\)/g, replace: 'parseFloat(form.price)' }
]);

console.log("Fixes applied.");
