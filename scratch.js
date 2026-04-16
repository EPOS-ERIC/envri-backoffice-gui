const fs = require('fs');
const html = fs.readFileSync('src/pages/browse/browse-revisions/browse-revisions.component.html', 'utf8');

const updatedHtml = html.replace(/\[innerHTML\]="(getDiff\([^"]+\))">\s*<\/span>/g, 
  '>\n        <ng-container *ngTemplateOutlet="diffView; context: { chunks: $1 }"></ng-container>\n      </span>');

console.log("Replacements made:", (html.match(/\[innerHTML\]="(getDiff\([^"]+\))">\s*<\/span>/g) || []).length);
console.log("Remaining getDiff innerHTMLs:", (updatedHtml.match(/\[innerHTML\]="(getDiff[^"]+)"/g) || []).length);
// fs.writeFileSync('src/pages/browse/browse-revisions/browse-revisions.component.html', updatedHtml);
