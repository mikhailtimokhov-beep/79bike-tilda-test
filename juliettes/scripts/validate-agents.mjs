// Проверка корректности внесения агентов. Запускает agent-registrar после каждого изменения.
// Запуск из корня проекта: node scripts/validate-agents.mjs   (код выхода 0 — всё OK)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.claude/agents';
const REGISTRY = 'agents/REGISTRY.md';
const ALLOWED_TOOLS = new Set(['Read', 'Grep', 'Glob', 'Write', 'Edit', 'Bash', 'WebFetch', 'WebSearch']);
const errors = [];

const files = existsSync(DIR) ? readdirSync(DIR).filter(f => f.endsWith('.md')) : [];
const agents = new Map();
for (const f of files) {
  const text = readFileSync(join(DIR, f), 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) { errors.push(`${f}: нет заголовка ---`); continue; }
  const meta = Object.fromEntries(m[1].split('\n').map(l => l.match(/^(\w+):\s*(.*)$/)).filter(Boolean).map(x => [x[1], x[2].trim()]));
  for (const k of ['name', 'description', 'tools']) if (!meta[k]) errors.push(`${f}: нет поля ${k}`);
  if (meta.name && meta.name + '.md' !== f) errors.push(`${f}: name «${meta.name}» не совпадает с именем файла`);
  if (meta.name && agents.has(meta.name)) errors.push(`${f}: имя ${meta.name} уже занято`);
  for (const t of (meta.tools || '').split(',').map(s => s.trim()).filter(Boolean))
    if (!ALLOWED_TOOLS.has(t)) errors.push(`${f}: инструмент «${t}» не разрешён`);
  if (meta.name) agents.set(meta.name, text);
}

if (!existsSync(REGISTRY)) errors.push(`нет реестра ${REGISTRY}`);
else {
  const rows = readFileSync(REGISTRY, 'utf8').split('\n').filter(l => /^\|\s*[a-z][\w-]*\s*\|/.test(l));
  const listed = new Set(rows.map(l => l.split('|')[1].trim()).filter(n => n !== 'name'));
  for (const n of agents.keys()) if (!listed.has(n)) errors.push(`агент ${n} есть в ${DIR}, но нет в реестре`);
  for (const n of listed) if (!agents.has(n)) errors.push(`в реестре есть ${n}, но нет файла ${DIR}/${n}.md`);
}

// Ссылки на других агентов вида `name.md` или `name` в обратных кавычках
for (const [name, text] of agents)
  for (const ref of text.matchAll(/`([a-z][a-z0-9-]+)(?:\.md)?`/g))
    if (/-/.test(ref[1]) && !agents.has(ref[1]) && /agent|registrar|control|seo|strategist|coordinator|compliance/.test(ref[1]))
      errors.push(`${name}: ссылка на несуществующего агента «${ref[1]}»`);

if (errors.length) { console.log('НЕ OK\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`OK: ${agents.size} агентов, реестр и файлы совпадают`);
