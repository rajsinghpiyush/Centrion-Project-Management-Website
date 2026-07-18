const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/KanbanBoard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Task Progress section
// "Task Progress" title
content = content.replace(
  /<h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Task Progress<\/h3>/g,
  `<h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#111827', letterSpacing: '-0.02em' }}>Task Progress</h3>`
);

// Donut Chart background ring
content = content.replace(
  /<circle cx="80" cy="80" r=\{radius\} fill="none" stroke="rgba\(255,255,255,0.06\)" strokeWidth="14" \/>/g,
  `<circle cx="80" cy="80" r={radius} fill="none" stroke={theme === 'dark' ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="14" />`
);

// Donut Chart text (completedPct and DONE)
content = content.replace(
  /<span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>\{completedPct\}%<\/span>/g,
  `<span style={{ fontSize: '2rem', fontWeight: 900, color: theme === 'dark' ? '#fff' : '#111827', lineHeight: 1 }}>{completedPct}%</span>`
);
content = content.replace(
  /<span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba\(255,255,255,0.35\)', marginTop: 2 }}>DONE<\/span>/g,
  `<span style={{ fontSize: '0.65rem', fontWeight: 600, color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(17,24,39,0.5)', marginTop: 2 }}>DONE</span>`
);

// Status breakdown cards (To Do, Active, etc.)
content = content.replace(
  /<span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba\(255,255,255,0.5\)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>\{s.name\}<\/span>/g,
  `<span style={{ fontSize: '0.65rem', fontWeight: 700, color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(17,24,39,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.name}</span>`
);
content = content.replace(
  /<span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba\(255,255,255,0.3\)' }}>\(\{s.pct\}%\)<\/span>/g,
  `<span style={{ fontSize: '0.7rem', fontWeight: 600, color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.4)' }}>({s.pct}%)</span>`
);
content = content.replace(
  /<div style={{ marginTop: 8, height: 4, borderRadius: 4, background: 'rgba\(255,255,255,0.06\)', overflow: 'hidden' }}>/g,
  `<div style={{ marginTop: 8, height: 4, borderRadius: 4, background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>`
);

// 2. Task Timeline section
// "Task Timeline" title
content = content.replace(
  /<h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Task Timeline<\/h3>/g,
  `<h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#111827', letterSpacing: '-0.02em' }}>Task Timeline</h3>`
);
content = content.replace(
  /<p style={{ fontSize: '0.65rem', color: 'rgba\(255,255,255,0.3\)', marginTop: 1 }}>14-day view · \{tasks.length\} tasks<\/p>/g,
  `<p style={{ fontSize: '0.65rem', color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.5)', marginTop: 1 }}>14-day view · {tasks.length} tasks</p>`
);

// Legend
content = content.replace(
  /<div style={{ display: 'flex', gap: 10, background: 'rgba\(255,255,255,0.04\)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba\(255,255,255,0.05\)' }}>/g,
  `<div style={{ display: 'flex', gap: 10, background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', padding: '6px 12px', borderRadius: 10, border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>`
);
content = content.replace(
  /<span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba\(255,255,255,0.4\)' }}>\{l\}<\/span>/g,
  `<span style={{ fontSize: '0.6rem', fontWeight: 600, color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(17,24,39,0.6)' }}>{l}</span>`
);

// Left axis labels
content = content.replace(
  /<div style={{ width: 155, flexShrink: 0, paddingRight: 10, borderRight: '1px solid rgba\(255,255,255,0.06\)' }}>/g,
  `<div style={{ width: 155, flexShrink: 0, paddingRight: 10, borderRight: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>`
);
content = content.replace(
  /<span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba\(255,255,255,0.2\)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task<\/span>/g,
  `<span style={{ fontSize: '0.6rem', fontWeight: 700, color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task</span>`
);
content = content.replace(
  /<div key=\{task._id\} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba\(255,255,255,0.03\)' }}>/g,
  `<div key={task._id} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8, borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>`
);
// Left axis task text
content = content.replace(
  /<p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba\(255,255,255,0.75\)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>\{task.title\}<\/p>/g,
  `<p style={{ fontSize: '0.7rem', fontWeight: 700, color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(17,24,39,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{task.title}</p>`
);
content = content.replace(
  /<p style={{ fontSize: '0.55rem', fontWeight: 600, color: assignee \? 'rgba\(255,255,255,0.3\)' : 'rgba\(255,255,255,0.15\)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>\{assignee \? assignee.name : 'Unassigned'\}<\/p>/g,
  `<p style={{ fontSize: '0.55rem', fontWeight: 600, color: theme === 'dark' ? (assignee ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)') : (assignee ? 'rgba(17,24,39,0.6)' : 'rgba(17,24,39,0.4)'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{assignee ? assignee.name : 'Unassigned'}</p>`
);

// Day headers
content = content.replace(
  /<span style={{ fontSize: '0.45rem', fontWeight: 600, color: d.isToday \? 'rgba\(165,180,252,0.7\)' : 'rgba\(255,255,255,0.12\)', marginBottom: 2 }}>\{d.wd\}<\/span>/g,
  `<span style={{ fontSize: '0.45rem', fontWeight: 600, color: d.isToday ? 'rgba(165,180,252,0.7)' : (theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(17,24,39,0.4)'), marginBottom: 2 }}>{d.wd}</span>`
);
content = content.replace(
  /<span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba\(255,255,255,0.18\)' }}>\{d.day\}<\/span>/g,
  `<span style={{ fontSize: '0.6rem', fontWeight: 600, color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(17,24,39,0.5)' }}>{d.day}</span>`
);
content = content.replace(
  /<div key=\{i\} style={{ flex: 1, borderRight: \`1px solid rgba\\\(255,255,255,\$\{d.isToday \? '0.06' : '0.025'\}\\\)\` }} \/>/g,
  `<div key={i} style={{ flex: 1, borderRight: theme === 'dark' ? \`1px solid rgba(255,255,255,\${d.isToday ? '0.06' : '0.025'})\` : \`1px solid rgba(0,0,0,\${d.isToday ? '0.06' : '0.025'})\` }} />`
);

// Timeline Bars area
content = content.replace(
  /<div key=\{task._id\} style={{ height: 44, display: 'flex', alignItems: 'center', position: 'relative', borderBottom: '1px solid rgba\(255,255,255,0.03\)' }}>/g,
  `<div key={task._id} style={{ height: 44, display: 'flex', alignItems: 'center', position: 'relative', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.03)' }}>`
);
content = content.replace(
  /boxShadow: \`0 4px 18px \$\{color\}40, inset 0 1px 0 rgba\\\(255,255,255,0.18\\\)\`,/g,
  `boxShadow: theme === 'dark' ? \`0 4px 18px \${color}40, inset 0 1px 0 rgba(255,255,255,0.18)\` : \`0 4px 18px \${color}40, inset 0 1px 0 rgba(255,255,255,0.4)\`,`
);
content = content.replace(
  /onMouseEnter=\{\(e\) => \{ e.currentTarget.style.transform = 'translateY\(-1px\)'; e.currentTarget.style.boxShadow = \`0 6px 24px \$\{color\}55, inset 0 1px 0 rgba\\\(255,255,255,0.22\\\)\`; \}\}/g,
  `onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = theme === 'dark' ? \`0 6px 24px \${color}55, inset 0 1px 0 rgba(255,255,255,0.22)\` : \`0 6px 24px \${color}55, inset 0 1px 0 rgba(255,255,255,0.5)\`; }}`
);
content = content.replace(
  /onMouseLeave=\{\(e\) => \{ e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = \`0 4px 18px \$\{color\}40, inset 0 1px 0 rgba\\\(255,255,255,0.18\\\)\`; \}\}/g,
  `onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = theme === 'dark' ? \`0 4px 18px \${color}40, inset 0 1px 0 rgba(255,255,255,0.18)\` : \`0 4px 18px \${color}40, inset 0 1px 0 rgba(255,255,255,0.4)\`; }}`
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed KanbanBoard.jsx UI issues accurately.');
