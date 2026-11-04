"""Сборка визуала на согласование: подставляет фото (data URI) в шаблон.

Запуск: python3 -I scripts/build-visual.py <шаблон.html> <imgs.json> <выход.html>
imgs.json — {"P1": "data:image/jpeg;base64,...", ...}
"""
import json
import sys

template, images, out = sys.argv[1:4]
html = open(template, encoding="utf-8").read()
for key, uri in json.load(open(images)).items():
    html = html.replace("{{" + key + "}}", uri)
missing = [p for p in ("{{P%d}}" % i for i in range(1, 20)) if p in html]
if missing:
    sys.exit("Не хватает фото: " + ", ".join(missing))
open(out, "w", encoding="utf-8").write(html)
print("OK", out, len(html) // 1024, "KB")
