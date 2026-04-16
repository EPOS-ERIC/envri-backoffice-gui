import re

with open('src/pages/browse/browse-revisions/browse-revisions.component.html', 'r', encoding='utf-8') as f:
    html = f.read()

pattern = re.compile(r'\[innerHTML\]="(getDiff[^"]+)">\s*</span>')
def replacer(match):
    return f'>\n        <ng-container *ngTemplateOutlet="diffView; context: {{ chunks: {match.group(1)} }}"></ng-container>\n      </span>'

updated_html, count = pattern.subn(replacer, html)

print(f"Replacements made: {count}")
remaining = len(re.findall(r'\[innerHTML\]="(getDiff[^"]+)"', updated_html))
print(f"Remaining getDiff innerHTMLs: {remaining}")

with open('src/pages/browse/browse-revisions/browse-revisions.component.html', 'w', encoding='utf-8') as f:
    f.write(updated_html)
