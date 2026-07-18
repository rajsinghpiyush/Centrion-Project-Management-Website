const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/styles/KanbanBoard.css');
let content = fs.readFileSync(filePath, 'utf8');

// Replace kanban-empty-col
content = content.replace(
  /\.kanban-empty-col \{[\s\S]*?min-height: 120px;\n    transition: all 0\.3s ease;\n\}/g,
  `.kanban-empty-col {
    @apply py-8 px-4 text-center rounded-xl flex flex-col items-center justify-center gap-3 mt-2;
    background: rgba(17, 24, 39, 0.05);
    border: 1px dashed rgba(17, 24, 39, 0.15);
    min-height: 120px;
    transition: all 0.3s ease;
}

:root.dark .kanban-empty-col {
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.08);
}`
);

content = content.replace(
  /\.kanban-empty-col:hover \{\n    background: rgba\(255, 255, 255, 0\.04\);\n    border-color: rgba\(255, 255, 255, 0\.15\);\n\}/g,
  `.kanban-empty-col:hover {
    background: rgba(17, 24, 39, 0.08);
    border-color: rgba(17, 24, 39, 0.25);
}

:root.dark .kanban-empty-col:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.15);
}`
);

// kanban-column
content = content.replace(
  /\.kanban-column \{[\s\S]*?box-shadow: 0 20px 60px rgba\(0, 0, 0, 0\.4\);\n    transition: all 0\.3s cubic-bezier\(0\.22, 1, 0\.36, 1\);\n\}/g,
  `.kanban-column {
    @apply flex flex-col p-6;
    border-radius: 24px;
    flex: 1 1 0%;
    min-width: 220px;
    max-width: 100%;
    min-height: 380px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

:root.dark .kanban-column {
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}`
);

content = content.replace(
  /\.kanban-column:hover \{\n    background: rgba\(17, 24, 39, 0\.8\);\n    border-color: rgba\(255, 255, 255, 0\.12\);\n    box-shadow: 0 25px 50px rgba\(0, 0, 0, 0\.4\);\n\}/g,
  `.kanban-column:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

:root.dark .kanban-column:hover {
    background: rgba(17, 24, 39, 0.8);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}`
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed KanbanBoard.css UI issues.');
