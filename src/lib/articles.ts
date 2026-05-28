// Article loader — czyta MD z disk i parsuje frontmatter
import fs from 'fs';
import path from 'path';

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'content', 'articles');

export type Article = {
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  readingTime: number;
  date: string;
  author: string;
  authorRole: string;
  tldr: string;
  content: string;
};

/** Parsuje YAML-like frontmatter (--- bloki na początku) */
function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlLines = match[1].split('\n');
  const content = match[2];
  const data: Record<string, any> = {};

  let currentKey: string | null = null;
  let multilineBuffer: string[] = [];

  for (const line of yamlLines) {
    // multiline value (key: |)
    if (currentKey && (line.startsWith('  ') || line.startsWith('\t'))) {
      multilineBuffer.push(line.replace(/^\s{2}/, ''));
      continue;
    }
    if (currentKey) {
      data[currentKey] = multilineBuffer.join('\n').trim();
      currentKey = null;
      multilineBuffer = [];
    }

    const m = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, value] = m;
    if (value === '|') {
      currentKey = key;
    } else {
      // Numeric?
      const num = Number(value);
      data[key] = !isNaN(num) && value.trim() !== '' ? num : value.replace(/^["']|["']$/g, '');
    }
  }
  if (currentKey) data[currentKey] = multilineBuffer.join('\n').trim();

  return { data, content };
}

export function getArticleSlugs(): string[] {
  try {
    return fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''));
  } catch {
    return [];
  }
}

export function getArticle(slug: string): Article | null {
  try {
    const filepath = path.join(ARTICLES_DIR, `${slug}.md`);
    const raw = fs.readFileSync(filepath, 'utf-8');
    const { data, content } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title || slug,
      metaDescription: data.metaDescription || '',
      category: data.category || '',
      readingTime: data.readingTime || 5,
      date: data.date || '',
      author: data.author || 'Redakcja',
      authorRole: data.authorRole || '',
      tldr: data.tldr || '',
      content,
    };
  } catch (err) {
    console.error(`[articles] Failed to load ${slug}:`, err);
    return null;
  }
}

export function getAllArticles(): Article[] {
  return getArticleSlugs()
    .map(getArticle)
    .filter((a): a is Article => a !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Bardzo prosty markdown renderer.
 * Obsługuje: # ## ###, **bold**, *italic*, [link](url), ![img](url),
 * listy (- / 1.), cytaty (>), tabele, code blocks, hr (---).
 * Zwraca HTML string.
 */
export function renderMarkdown(md: string): string {
  let html = md;

  // Code blocks ```...```
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return `<pre class="bg-cream-dark/40 rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono">${escapeHtml(code.trim())}</pre>`;
  });

  // Tables (header | --- | rows)
  html = html.replace(
    /^\|(.+)\|\n\|[\s\-:|]+\|\n((?:\|.+\|\n?)+)/gm,
    (_m, header, rows) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
      const rowsHtml = rows
        .trim()
        .split('\n')
        .map((row: string) => {
          const cells = row.split('|').map((c) => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1 || a.length === 1);
          // Hack: just split and remove empty edge cells
          const cleaned = row.split('|').slice(1, -1).map((c) => c.trim());
          return `<tr>${cleaned.map((c) => `<td class="border-b border-border-soft py-2 px-3 text-sm">${parseInline(c)}</td>`).join('')}</tr>`;
        })
        .join('');
      return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse"><thead><tr class="bg-cream-dark/40">${headers
        .map((h: string) => `<th class="border-b-2 border-navy/20 py-2 px-3 text-left font-medium text-navy text-sm">${parseInline(h)}</th>`)
        .join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
    }
  );

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-heading text-2xl text-navy mt-8 mb-3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-heading text-3xl text-navy mt-12 mb-4">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-heading text-4xl md:text-5xl text-navy mt-8 mb-6">$1</h1>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="my-10 border-border-soft" />');

  // Block quotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-accent-green pl-4 my-4 text-navy/70 italic">$1</blockquote>');

  // Unordered lists
  html = html.replace(/((?:^[-*] .+\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => line.replace(/^[-*] /, ''))
      .map((item) => `<li class="mb-2">${parseInline(item)}</li>`)
      .join('');
    return `<ul class="list-disc pl-6 my-4 text-navy/80">${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split('\n')
      .map((line) => line.replace(/^\d+\. /, ''))
      .map((item) => `<li class="mb-2">${parseInline(item)}</li>`)
      .join('');
    return `<ol class="list-decimal pl-6 my-4 text-navy/80">${items}</ol>`;
  });

  // Paragraphs (consecutive non-empty lines that aren't already wrapped)
  html = html
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Already wrapped in HTML tag?
      if (/^<(h[1-6]|ul|ol|div|blockquote|hr|pre|table)/i.test(trimmed)) return trimmed;
      return `<p class="text-navy/80 leading-relaxed mb-4">${parseInline(trimmed.replace(/\n/g, ' '))}</p>`;
    })
    .join('\n');

  return html;
}

function parseInline(text: string): string {
  let s = text;
  // Images ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4" />');
  // Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent-green underline hover:text-accent-green-hover">$1</a>');
  // Bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-navy">$1</strong>');
  // Italic
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Inline code
  s = s.replace(/`([^`]+)`/g, '<code class="bg-cream-dark/40 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  // Emojis ✅ ❌ 🚩 etc — passthrough (already unicode)
  return s;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
