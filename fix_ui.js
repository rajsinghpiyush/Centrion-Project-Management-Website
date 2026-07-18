const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Dashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the footer shadow
content = content.replace(
  'shadow-[0_-10px_40px_rgba(0,0,0,0.5)]',
  'shadow-none dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
);

// Fix New Project button
content = content.replace(
  /background: 'rgba\(255,255,255,0\.06\)', color: '#fff', fontWeight: 700, fontSize: '0\.875rem', border: '1px solid rgba\(255,255,255,0\.1\)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0\.3s'/g,
  `background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s'`
);

// We need to inject text-gray-900 dark:text-white into the headings that have hardcoded white color
// "Workspaces"
content = content.replace(
  /<h2 style={{ fontSize: '0\.8rem', fontWeight: 700, color: 'rgba\(255,255,255,0\.35\)',/g,
  '<h2 className="text-gray-500 dark:text-white/35" style={{ fontSize: \'0.8rem\', fontWeight: 700,'
);

// "My Projects"
content = content.replace(
  /<h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff',/g,
  '<h3 className="text-gray-900 dark:text-white" style={{ fontSize: \'1rem\', fontWeight: 700,'
);

// "Invited Projects"
content = content.replace(
  /<h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff',/g,
  '<h3 className="text-gray-900 dark:text-white" style={{ fontSize: \'1rem\', fontWeight: 700,'
);

// "AI Suggestions"
content = content.replace(
  /<h2 style={{ fontSize: '1\.25rem', fontWeight: 800, color: '#fff',/g,
  '<h2 className="text-gray-900 dark:text-white" style={{ fontSize: \'1.25rem\', fontWeight: 800,'
);

// "Recent Activity"
content = content.replace(
  /<h2 style={{ fontSize: '1\.25rem', fontWeight: 800, color: '#fff' }}/g,
  '<h2 className="text-gray-900 dark:text-white" style={{ fontSize: \'1.25rem\', fontWeight: 800 }}'
);

// AI suggestion text color
content = content.replace(
  /<span style={{ fontSize: '0\.9rem', color: '#E2E8F0', fontWeight: 500 }}>/g,
  '<span className="text-gray-800 dark:text-slate-200" style={{ fontSize: \'0.9rem\', fontWeight: 500 }}>'
);

// Background of AI Suggestion card
content = content.replace(
  /style={{ background: 'rgba\(255,255,255,0\.04\)', border: '1px solid rgba\(139,92,246,0\.15\)'/g,
  'className="bg-white/50 dark:bg-white/5" style={{ border: \'1px solid rgba(139,92,246,0.15)\''
);


fs.writeFileSync(filePath, content);
console.log('UI issues fixed in Dashboard.jsx');
