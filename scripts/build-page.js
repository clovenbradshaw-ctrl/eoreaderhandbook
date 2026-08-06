#!/usr/bin/env node
// Builds a single, self-contained index.html containing every written
// chapter, in order, with a table of contents, plus a button to download
// the same content as one combined markdown file. Re-run this after
// adding or editing chapters; it always reflects what's on disk.

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const ROOT = path.join(__dirname, "..");
const CHAPTER_RE = /^\d{3}-.*\.md$/;
const NAV_RE = /<!-- nav:start -->[\s\S]*?<!-- nav:end -->\n?/g;

const PART_OF = {
  0: "Part 0 — Before You Start",
  1: "Part I — The One Idea Everything Is Built On",
  2: "Part II — The Grammar of Everything That Happens",
  3: "Part III — How EO Reader 6 Reads",
  4: "Part IV — Why the Rules Are the Rules",
  5: "Part V — EO Chat: Where You Meet It",
  6: "Part VI — Where This Sits in History",
  7: "Part VII — Building Something With It",
};

function titleOf(content) {
  const m = content.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

function partNumberOf(file) {
  return Number(file[0]);
}

const files = fs
  .readdirSync(ROOT)
  .filter((f) => CHAPTER_RE.test(f) && f !== "000-index.md")
  .sort((a, b) => a.localeCompare(b));

const chapters = files.map((file) => {
  const raw = fs.readFileSync(path.join(ROOT, file), "utf8");
  const body = raw.replace(NAV_RE, "").trim();
  return {
    file,
    slug: file.replace(/\.md$/, ""),
    title: titleOf(body) || file,
    part: partNumberOf(file),
    body,
  };
});

// Combined raw markdown, for the download button -- grouped by part.
let combinedMd = "# The EO Reader 6 / EO Chat Handbook\n\n";
let currentPart = null;
for (const ch of chapters) {
  if (ch.part !== currentPart) {
    currentPart = ch.part;
    combinedMd += `\n\\newpage\n\n## ${PART_OF[currentPart] || "Part " + currentPart}\n\n`;
  }
  combinedMd += ch.body + "\n\n---\n\n";
}

// Table of contents (HTML, not markdown -- built directly so anchors are exact).
let tocHtml = '<nav class="toc"><h2>Contents</h2>\n';
currentPart = null;
for (const ch of chapters) {
  if (ch.part !== currentPart) {
    if (currentPart !== null) tocHtml += "</ol>\n";
    currentPart = ch.part;
    tocHtml += `<h3>${escapeHtml(PART_OF[currentPart] || "Part " + currentPart)}</h3>\n<ol>\n`;
  }
  tocHtml += `<li><a href="#${ch.slug}">${escapeHtml(ch.title)}</a></li>\n`;
}
tocHtml += "</ol>\n</nav>\n";

// Body: each chapter rendered to its own anchored section.
let bodyHtml = "";
currentPart = null;
for (const ch of chapters) {
  if (ch.part !== currentPart) {
    currentPart = ch.part;
    bodyHtml += `<h2 class="part-heading">${escapeHtml(PART_OF[currentPart] || "Part " + currentPart)}</h2>\n`;
  }
  bodyHtml += `<section id="${ch.slug}" class="chapter">\n${marked.parse(ch.body)}\n</section>\n`;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const generatedAt = new Date().toISOString().slice(0, 10);
const mdForDownload = JSON.stringify(combinedMd);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The EO Reader 6 / EO Chat Handbook</title>
<style>
:root {
  --fg: #1b1b1b;
  --bg: #fdfcfb;
  --muted: #6b6b6b;
  --accent: #7a3e2e;
  --rule: #e2ddd6;
  --code-bg: #f2efe9;
  --max: 720px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fg: #e9e6e1;
    --bg: #16140f;
    --muted: #a9a39a;
    --accent: #e0a385;
    --rule: #3a352c;
    --code-bg: #221f18;
  }
}
:root[data-theme="dark"] {
  --fg: #e9e6e1; --bg: #16140f; --muted: #a9a39a; --accent: #e0a385; --rule: #3a352c; --code-bg: #221f18;
}
:root[data-theme="light"] {
  --fg: #1b1b1b; --bg: #fdfcfb; --muted: #6b6b6b; --accent: #7a3e2e; --rule: #e2ddd6; --code-bg: #f2efe9;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
  line-height: 1.6;
}
.wrap { max-width: var(--max); margin: 0 auto; padding: 2.5rem 1.5rem 6rem; }
header.page-head {
  border-bottom: 1px solid var(--rule);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}
header.page-head h1 { font-size: 1.9rem; margin: 0 0 .35rem; }
header.page-head p.sub { color: var(--muted); margin: 0 0 1.2rem; font-size: .95rem; }
.actions { display: flex; gap: .6rem; flex-wrap: wrap; }
button.dl {
  font: inherit;
  font-size: .9rem;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  padding: .55rem 1rem;
  cursor: pointer;
}
button.dl:hover { opacity: .88; }
button.dl.secondary {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--rule);
}
nav.toc { border: 1px solid var(--rule); border-radius: 8px; padding: 1rem 1.3rem; margin-bottom: 2.5rem; }
nav.toc h2 { margin-top: 0; font-size: 1.1rem; }
nav.toc h3 { font-size: .95rem; color: var(--accent); margin: 1rem 0 .3rem; }
nav.toc ol { margin: 0 0 0 1.1rem; padding: 0; font-size: .92rem; }
nav.toc a { color: var(--fg); text-decoration: none; }
nav.toc a:hover { text-decoration: underline; }
h2.part-heading {
  margin-top: 3.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--accent);
  font-size: 1.5rem;
}
section.chapter { margin-bottom: 2.8rem; scroll-margin-top: 1rem; }
section.chapter h1 { font-size: 1.35rem; margin-bottom: .8rem; }
section.chapter h2 { font-size: 1.1rem; color: var(--accent); }
section.chapter blockquote {
  margin: 1rem 0;
  padding: .4rem 1rem;
  border-left: 3px solid var(--accent);
  color: var(--muted);
}
section.chapter code {
  background: var(--code-bg);
  padding: .1rem .3rem;
  border-radius: 4px;
  font-size: .9em;
}
section.chapter pre { background: var(--code-bg); padding: 1rem; border-radius: 6px; overflow-x: auto; }
section.chapter table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: .92rem; overflow-x: auto; display: block; }
section.chapter table th, section.chapter table td { border: 1px solid var(--rule); padding: .4rem .6rem; text-align: left; }
section.chapter a { color: var(--accent); }
.top-link { display: inline-block; margin-top: .5rem; font-size: .85rem; }
footer.page-foot { color: var(--muted); font-size: .85rem; border-top: 1px solid var(--rule); padding-top: 1rem; margin-top: 3rem; }
@media print {
  button.dl, .actions { display: none; }
}
</style>
</head>
<body>
<div class="wrap">
  <header class="page-head">
    <h1>The EO Reader 6 / EO Chat Handbook</h1>
    <p class="sub">All ${chapters.length} written chapters, on one page. Generated ${generatedAt}.</p>
    <div class="actions">
      <button class="dl" id="download-md">Download as Markdown</button>
      <button class="dl secondary" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </header>

  ${tocHtml}

  ${bodyHtml}

  <footer class="page-foot">
    Generated from the chapter files in this repository by
    <code>scripts/build-page.js</code>. Re-run that script after editing or
    adding a chapter to refresh this page.
  </footer>
</div>
<script>
const COMBINED_MARKDOWN = ${mdForDownload};
document.getElementById('download-md').addEventListener('click', () => {
  const blob = new Blob([COMBINED_MARKDOWN], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'eo-reader-6-eo-chat-handbook.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "index.html"), html);
fs.writeFileSync(
  path.join(ROOT, "eo-reader-6-eo-chat-handbook.md"),
  combinedMd
);
console.log(`Built index.html and eo-reader-6-eo-chat-handbook.md from ${chapters.length} chapters.`);
