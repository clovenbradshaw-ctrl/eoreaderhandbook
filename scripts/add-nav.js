#!/usr/bin/env node
// Regenerates the "Previous / Contents / Next" nav block at the top and
// bottom of every numbered chapter file (NNN-slug.md), in filename order.
// Idempotent: strips any nav block this script previously inserted before
// re-inserting a fresh one, so it's safe to re-run after adding chapters.
// 000-index.md and HANDBOOK-SPEC.md are not chapters and are left alone.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CHAPTER_RE = /^\d{3}-.*\.md$/;
const NAV_START = "<!-- nav:start -->";
const NAV_END = "<!-- nav:end -->";

function titleOf(content) {
  const m = content.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

function stripNav(content) {
  const re = new RegExp(
    `\\n?${NAV_START}[\\s\\S]*?${NAV_END}\\n?`,
    "g"
  );
  return content.replace(re, "\n").trim() + "\n";
}

function navBlock(prev, next) {
  const prevLink = prev
    ? `[← ${prev.title}](${prev.file})`
    : `← *(start of the book)*`;
  const nextLink = next
    ? `[${next.title} →](${next.file})`
    : `*(more chapters coming)* →`;
  return `${NAV_START}\n${prevLink} · [Contents](000-index.md) · ${nextLink}\n${NAV_END}\n`;
}

const files = fs
  .readdirSync(ROOT)
  .filter((f) => CHAPTER_RE.test(f) && f !== "000-index.md")
  .sort((a, b) => a.localeCompare(b));

const chapters = files.map((file) => {
  const content = fs.readFileSync(path.join(ROOT, file), "utf8");
  return { file, title: titleOf(content) || file };
});

chapters.forEach((chapter, i) => {
  const prev = i > 0 ? chapters[i - 1] : null;
  const next = i < chapters.length - 1 ? chapters[i + 1] : null;
  const full = path.join(ROOT, chapter.file);
  let content = fs.readFileSync(full, "utf8");
  content = stripNav(content);

  const nav = navBlock(prev, next);
  const lines = content.split("\n");
  // Insert the top nav right after the H1 title line.
  const titleIdx = lines.findIndex((l) => /^#\s+/.test(l));
  const insertAt = titleIdx >= 0 ? titleIdx + 1 : 0;
  lines.splice(insertAt, 0, "", nav.trim());
  content = lines.join("\n").trim() + "\n\n" + nav.trim() + "\n";

  fs.writeFileSync(full, content);
});

console.log(`Nav updated on ${chapters.length} chapter files.`);
