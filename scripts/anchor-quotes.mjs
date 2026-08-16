#!/usr/bin/env node
// anchor-quotes.mjs — every verbatim quotation in the handbook, anchored to
// the exact bytes of an obtained source, with a round trip that closes.
//
// The handbook's own Chapter 5.4 states the law this tool exists to satisfy:
// "A quoted passage can be followed to its source bytes and those bytes
// match the quote. An audit path that leads somewhere unverifiable is
// decoration." Until this tool, the handbook taught that rule and did not
// practice it on its own quotations — chapter footers named sources and
// declared passages verbatim, but nothing held the source bytes and nothing
// could be followed anywhere.
//
// What this does, in order:
//
//   --snapshot   Obtain the sources. Local documents (the eoreader6 files
//                the footers name) are copied into sources/local/ byte for
//                byte, with the origin repo, path, and commit recorded and
//                a sha256 over the snapshot. Web-fetched texts are added
//                separately (see --add-web) because fetching is a crossing
//                this script does not perform silently. Everything lands in
//                sources/MANIFEST.json; what could NOT be obtained is a
//                typed `unobtained` entry with its reason, never a silent
//                absence.
//
//   (default)    Extract every quotation of substance from every chapter,
//                locate it in the obtained sources' bytes, and write:
//                  · sources/ANCHORS.json — every quote, its segments, the
//                    source id and byte range (b0-b1, UTF-8 bytes of the
//                    snapshot file) of each located segment, and a typed
//                    status for every quote that could not be located;
//                  · an anchors block injected into each chapter (between
//                    <!-- anchors:start/end --> markers, mechanically
//                    regenerated, same discipline as the nav blocks).
//
//   --verify     The round trip: for every anchor in ANCHORS.json, slice
//                the recorded byte range out of the snapshot file and
//                compare it (under the same declared normalization) to the
//                quoted text. Any mismatch is a failure and the exit code
//                says so. This is what makes an anchor a claim rather than
//                a decoration.
//
//   --report     Print the coverage summary and change nothing.
//
// HONEST LIMITS, stated here because a tool that hides them lies:
// extraction finds text inside quotation marks; it cannot tell a verbatim
// quotation from a scare quote or a mentioned title, so short spans (below
// MIN_SEGMENT_WORDS) are never anchored and never counted. A quote whose
// source was never obtained stays `unobtained-source`; a quote that should
// be in an obtained source but is not found is `unlocated` — which is
// exactly the finding that matters most, because it means a passage the
// prose presents as verbatim may be a paraphrase wearing quotation marks.

import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES_DIR = path.join(ROOT, "sources");
const MANIFEST_PATH = path.join(SOURCES_DIR, "MANIFEST.json");
const ANCHORS_PATH = path.join(SOURCES_DIR, "ANCHORS.json");
const CHAPTER_RE = /^\d{3}-.*\.md$/;

// ── declared numbers ────────────────────────────────────────────────────────
// A segment shorter than this many words is not anchored: below it, a match
// is a coincidence of common phrasing, not evidence of quotation. Five is
// the smallest run that is a clause rather than a collocation — the same
// magnitude of floor the-fold's MIN_RUN/MIN_CLAUSE_WORDS discipline uses
// for "enough to mean something." Not tuned against any outcome.
const MIN_SEGMENT_WORDS = 5;

// ── the local documents the chapter footers name ────────────────────────────
// Everything the handbook quotes from this project's own repos, snapshot
// byte for byte. Paths are relative to the sibling checkout. Adding a row
// here and re-running --snapshot is the whole procedure for a new source.
const LOCAL_SOURCES = [
  "SEED.md",
  "CUBE.md",
  "READING-POLICY.md",
  "CLAUDE.md",
  "11-terrain-occupancy-and-the-two-ascents.md",
  "12-nine-terrains-as-representation-standard.md",
  "prior-art-teachable-language-comprehender.md",
  "prior-art-surprise-segmentation-and-memory.md",
  "packages/engine/emergence/activation.js",
  "packages/engine/emergence/tiers.js",
  "packages/engine/emergence/surprise.js",
  "packages/engine/perceiver/text/relations.js",
  "packages/engine/perceiver/text/surfaces.js",
  "goldens/surprise/README.md",
  "scripts/RESULTS.md",
  "scripts/experiments/README.md",
  "scripts/experiments/FINDINGS.md",
  "scripts/lib/segmentation-baselines.mjs",
].map((p) => ({ repo: "clovenbradshaw-ctrl/eoreader6", root: path.join(ROOT, "..", "eoreader6"), path: p }));

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// How an unobtained source is recognized in a chapter's own prose, so an
// unlocated quote can say WHICH typed gap explains it instead of reading
// as an accusation. Hints are surface strings, checked against the chapter
// text — mechanical, and wrong at worst in the direction of saying less.
const UNOBTAINED_HINTS = {
  "eo-constitution/CONSTITUTION.md": ["CONSTITUTION.md", "eo-constitution"],
  "eoreader4.2/docs/eo-wiki.md": ["eo-wiki.md"],
  "eoreader4.2/docs/eo-for-coders.md": ["eo-for-coders.md"],
  "eochat/essay.md": ["eochat/essay.md", "essay.md"],
  "eoWebLLM/LAWS.md": ["LAWS.md", "eoWebLLM"],
  "bateson-1972-steps-to-an-ecology-of-mind": ["Bateson"],
  "bender-gebru-2021-stochastic-parrots": ["Stochastic Parrots"],
  "chow-1970-optimum-recognition-error": ["Chow"],
  "morris-1938-foundations-theory-of-signs": ["Morris"],
};

const readManifest = () =>
  fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
    : { sources: [], unobtained: [] };

const writeManifest = (m) => {
  fs.mkdirSync(SOURCES_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + "\n");
};

// ── snapshot ────────────────────────────────────────────────────────────────

function snapshot() {
  const manifest = readManifest();
  const byId = new Map(manifest.sources.map((s) => [s.id, s]));
  for (const spec of LOCAL_SOURCES) {
    const abs = path.join(spec.root, spec.path);
    const id = `eoreader6/${spec.path}`;
    if (!fs.existsSync(abs)) {
      if (!manifest.unobtained.some((u) => u.id === id))
        manifest.unobtained.push({ id, reason: `not present at ${abs} at snapshot time` });
      continue;
    }
    const buf = fs.readFileSync(abs);
    const rel = path.join("sources", "local", "eoreader6", spec.path);
    const dest = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    let commit = null;
    try {
      commit = execSync(`git -C ${JSON.stringify(spec.root)} rev-parse HEAD`, { encoding: "utf8" }).trim();
    } catch {
      commit = null;
    }
    byId.set(id, {
      id,
      kind: "local-snapshot",
      path: rel,
      bytes: buf.length,
      sha256: sha256(buf),
      origin: { repo: spec.repo, path: spec.path, commit },
    });
  }
  manifest.sources = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
  writeManifest(manifest);
  console.log(`snapshot: ${manifest.sources.length} source(s) on hand, ${manifest.unobtained.length} unobtained`);
}

// ── add a web-fetched source (the fetch itself happened elsewhere, and is
//    recorded here with its address and date — the crossing stays visible) ──

function addWeb([id, textPath, url, ...titleWords]) {
  if (!id || !textPath || !url) {
    console.error("usage: anchor-quotes.mjs --add-web <id> <textPath> <url> <title...>");
    process.exit(2);
  }
  const abs = path.join(ROOT, textPath);
  const buf = fs.readFileSync(abs);
  const manifest = readManifest();
  manifest.sources = manifest.sources.filter((s) => s.id !== id);
  manifest.sources.push({
    id,
    kind: "web",
    title: titleWords.join(" ") || null,
    path: textPath,
    bytes: buf.length,
    sha256: sha256(buf),
    origin: { url },
    retrievedAt: new Date().toISOString(),
  });
  manifest.sources.sort((a, b) => a.id.localeCompare(b.id));
  manifest.unobtained = (manifest.unobtained ?? []).filter((u) => u.id !== id);
  writeManifest(manifest);
  console.log(`added web source ${id} (${buf.length} bytes)`);
}

function addUnobtained([id, ...reasonWords]) {
  const manifest = readManifest();
  if (!manifest.unobtained.some((u) => u.id === id))
    manifest.unobtained.push({ id, reason: reasonWords.join(" ") });
  writeManifest(manifest);
  console.log(`recorded unobtained: ${id}`);
}

// ── normalization, shared by locate and verify ──────────────────────────────
// One normalization, declared once: typographic quotes and dashes fold to
// plain, ellipses to "...", markdown emphasis marks vanish, whitespace
// collapses, case folds. Both sides of every comparison pass through it —
// the same both-sides discipline the-fold's grounding fold earned.

const CHAR_FOLD = {
  "‘": "'", "’": "'", "“": '"', "”": '"',
  "–": "-", "—": "-", "…": "...", " ": " ",
};

function normalizedIndex(text) {
  // Returns { norm, map } where map[i] is the index in `text` of the
  // character that produced norm[i] — so a match in norm space can be
  // walked back to exact original offsets.
  let norm = "";
  const map = [];
  let lastWasSpace = true;
  for (let i = 0; i < text.length; i++) {
    let ch = CHAR_FOLD[text[i]] ?? text[i];
    if (ch === "*" || ch === "_" || ch === "`") continue; // markdown emphasis is the chapter's, not the quote's
    if (/\s/.test(ch)) {
      if (lastWasSpace) continue;
      norm += " ";
      map.push(i);
      lastWasSpace = true;
      continue;
    }
    lastWasSpace = false;
    for (const c of ch.toLowerCase()) {
      norm += c;
      map.push(i);
    }
  }
  return { norm: norm.trimEnd(), map };
}

const normQuote = (s) => normalizedIndex(s).norm.trim();

// The needle a segment is searched by: the segment's words, with the
// LEADING AND TRAILING punctuation stripped — a quotation's final period is
// routinely the handbook sentence's punctuation, not the source's (measured:
// Quine's "value of a variable." against the source's «variable"; this»),
// and an anchor must not fail on the quoting sentence's own full stop.
const needleOf = (s) => normQuote(s).replace(/^[\s.,;:!?'"()-]+|[\s.,;:!?'"()-]+$/g, "");

// ── extraction ──────────────────────────────────────────────────────────────

const MASK_BLOCKS = [
  /<!-- nav:start -->[\s\S]*?<!-- nav:end -->\n?/g,
  /<!-- anchors:start -->[\s\S]*?<!-- anchors:end -->\n?/g,
  /```[\s\S]*?```/g,
];

/**
 * Every quoted span in the chapter, WITH its offsets in the original
 * markdown — start/end bound the content between the quote marks, so a
 * backport can rewrite exactly what sits inside them. Masked regions (nav
 * blocks, generated anchors blocks, code fences) are skipped by range, not
 * by pre-stripping, so offsets stay the file's own.
 */
function extractQuoteSpans(markdown) {
  const masked = [];
  for (const re of MASK_BLOCKS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(markdown)) !== null) masked.push([m.index, m.index + m[0].length]);
  }
  const inMask = (a, b) => masked.some(([s, e]) => a < e && b > s);
  const spans = [];
  const push = (raw, start, end) => {
    if (inMask(start, end)) return;
    const q = raw.trim().replace(/\s+/g, " ");
    const segments = q
      .split(/\.\.\.|…/)
      .map((s) => s.trim())
      .filter((s) => s.split(/\s+/).filter(Boolean).length >= MIN_SEGMENT_WORDS);
    if (!segments.length) return;
    spans.push({ quote: q, segments, start, end });
  };
  // Curly-quoted spans are never ambiguous.
  for (const m of markdown.matchAll(/“([^“”]+)”/g)) push(m[1], m.index + 1, m.index + 1 + m[1].length);
  // Straight quotes are paired by position: consecutive marks delimit a
  // span. A lazy regex mis-paired the marks whenever a quotation ran
  // across a line break, and captured the prose BETWEEN two quotations as
  // if it were one — measured on the first run of this tool.
  const marks = [];
  for (let i = markdown.indexOf('"'); i !== -1; i = markdown.indexOf('"', i + 1)) marks.push(i);
  for (let i = 0; i + 1 < marks.length; i += 2) push(markdown.slice(marks[i] + 1, marks[i + 1]), marks[i] + 1, marks[i + 1]);
  return spans;
}

function extractQuotes(markdown) {
  const quotes = [];
  for (const s of extractQuoteSpans(markdown)) {
    if (!quotes.some((prev) => prev.quote === s.quote)) quotes.push({ quote: s.quote, segments: s.segments });
  }
  return quotes;
}

// ── locate ──────────────────────────────────────────────────────────────────

function loadSources() {
  const manifest = readManifest();
  return manifest.sources.map((s) => {
    const text = fs.readFileSync(path.join(ROOT, s.path), "utf8");
    const { norm, map } = normalizedIndex(text);
    // byte offset of each JS-char index, so anchors are UTF-8 byte ranges
    // into the snapshot file — the engine's own b0/b1 coordinate space.
    const byteAt = new Array(text.length + 1);
    let b = 0;
    for (let i = 0; i < text.length; i++) {
      byteAt[i] = b;
      b += Buffer.byteLength(text[i], "utf8");
    }
    byteAt[text.length] = b;
    return { ...s, text, norm, map, byteAt };
  });
}

function locate(sources, chapterText, quotes) {
  // Sources the chapter's own prose names get first claim on a segment
  // found in more than one place.
  const named = sources.filter((s) => chapterText.includes(path.basename(s.origin?.path ?? s.id)));
  const ordered = [...named, ...sources.filter((s) => !named.includes(s))];
  const findIn = (needle) => {
    let hit = null;
    const alsoIn = [];
    for (const src of ordered) {
      const at = src.norm.indexOf(needle);
      if (at === -1) continue;
      if (!hit) {
        const startChar = src.map[at];
        const endChar = src.map[at + needle.length - 1] + 1;
        hit = { source: src.id, b0: src.byteAt[startChar], b1: src.byteAt[endChar] };
      } else if (!alsoIn.includes(src.id)) alsoIn.push(src.id);
    }
    return hit ? { ...hit, ...(alsoIn.length ? { alsoIn } : {}) } : null;
  };

  // A long quotation with one OCR hiccup in the middle must not lose its
  // whole anchor: a segment that fails whole is BISECTED at its middle word
  // and each half tried independently, down to a floor of MIN_SEGMENT_WORDS
  // + 1 words per piece. Every anchored piece is still an EXACT byte match —
  // bisection narrows what is claimed, it never fuzzes the claim — and the
  // pieces that stay unfound are counted, so a partially anchored quote
  // says exactly how partial it is.
  const locateSegment = (seg, out) => {
    const needle = needleOf(seg);
    if (!needle) return 0;
    const whole = findIn(needle);
    if (whole) {
      out.push({ text: seg, ...whole });
      return 0;
    }
    const words = seg.split(/\s+/).filter(Boolean);
    if (words.length <= 2 * (MIN_SEGMENT_WORDS + 1)) return 1;
    const mid = Math.floor(words.length / 2);
    return (
      locateSegment(words.slice(0, mid).join(" "), out) + locateSegment(words.slice(mid).join(" "), out)
    );
  };

  return quotes.map(({ quote, segments }) => {
    const anchored = [];
    let missing = 0;
    let pieces = 0;
    for (const seg of segments) {
      const before = anchored.length;
      missing += locateSegment(seg, anchored);
      if (anchored.length - before > 1 || (anchored.length > before && anchored[before].text !== seg)) pieces++;
    }
    const status = !anchored.length ? "unlocated" : missing ? "partial" : pieces ? "partial" : "anchored";
    const entry = { quote, status, segments: anchored, unlocatedSegments: missing };
    if (status === "unlocated") {
      const candidates = Object.entries(UNOBTAINED_HINTS)
        .filter(([, hints]) => hints.some((h) => chapterText.includes(h)))
        .map(([id]) => id);
      if (candidates.length) entry.unobtainedCandidates = candidates;
    }
    return entry;
  });
}

// ── the anchors block a chapter carries ─────────────────────────────────────

function anchorsBlock(entries) {
  const anchored = entries.filter((e) => e.status !== "unlocated");
  const unlocated = entries.filter((e) => e.status === "unlocated");
  if (!entries.length) return null;
  const lines = [
    "<!-- anchors:start -->",
    "",
    "---",
    "",
    "**Byte anchors** (generated — `node scripts/anchor-quotes.mjs`, verified by `--verify`; sources and their provenance in `sources/MANIFEST.json`). Each anchor is the UTF-8 byte range of the quoted words in the snapshot the manifest names:",
    "",
  ];
  const shorten = (s) => {
    const words = s.split(/\s+/);
    return words.length <= 8 ? s : words.slice(0, 8).join(" ") + "…";
  };
  for (const e of anchored) {
    const spans = e.segments.map((s) => `\`${s.source}#b${s.b0}-${s.b1}\``).join(", ");
    lines.push(
      `- “${shorten(e.quote)}” → ${spans}` +
        (e.status === "partial" ? ` *(+${e.unlocatedSegments} segment(s) not located)*` : ""),
    );
  }
  const gapExplained = unlocated.filter((e) => e.unobtainedCandidates?.length);
  const suspect = unlocated.filter((e) => !e.unobtainedCandidates?.length);
  if (gapExplained.length) {
    const ids = [...new Set(gapExplained.flatMap((e) => e.unobtainedCandidates))];
    lines.push(
      "",
      `Not located because a source this chapter names is **not yet obtained** (${ids.map((i) => `\`${i}\``).join(", ")} — see the manifest's \`unobtained\` list for each one's reason):`,
      "",
    );
    for (const e of gapExplained) lines.push(`- “${shorten(e.quote)}”`);
  }
  if (suspect.length) {
    lines.push(
      "",
      "Quoted spans **not located in any obtained source** and not explained by a known gap — each is either the book's own illustrative speech, or a passage that reads as verbatim and is not, which is itself a finding to resolve:",
      "",
    );
    for (const e of suspect) lines.push(`- “${shorten(e.quote)}”`);
  }
  lines.push("", "<!-- anchors:end -->");
  return lines.join("\n");
}

function injectBlock(markdown, block) {
  const cleaned = markdown.replace(/\n?<!-- anchors:start -->[\s\S]*?<!-- anchors:end -->\n?/g, "\n");
  if (!block) return cleaned;
  // Before the trailing nav block when there is one, else at the end.
  const navAtEnd = cleaned.lastIndexOf("<!-- nav:start -->");
  if (navAtEnd > cleaned.length / 2) {
    return cleaned.slice(0, navAtEnd).replace(/\n+$/, "\n\n") + block + "\n\n" + cleaned.slice(navAtEnd);
  }
  return cleaned.replace(/\n+$/, "\n\n") + block + "\n";
}

// ── backport: the chapter's quotes become the source's own bytes ────────────
//
// The anchor made the quote CHECKABLE; the backport makes it TRUE BY
// CONSTRUCTION. For every anchored segment, the quoted words in the chapter
// are replaced by the exact bytes at the anchor — so what the book prints
// IS the slice, not a remembered version of it, and drift between the prose
// and the source (case, punctuation, a re-worded phrase that still matched
// under normalization, a paraphrase that happened to share the words)
// disappears at the byte level.
//
// Two transformations on a slice, both declared because "verbatim" must not
// silently mean "almost": (1) whitespace runs collapse to one space — a
// slice may cross the source's own line wrap, and the wrap is the source
// FILE's layout, not the quotation's content; (2) a double quotation mark
// INSIDE the slice becomes a single mark, because the chapter's own quote
// delimiters are double marks and an inner double would split the quote in
// two on the next read. Everything else — case, accents, punctuation,
// wording — is the source's bytes, untouched.

function backport() {
  const sources = loadSources();
  if (!sources.length) {
    console.error("no sources on hand — run --snapshot first");
    process.exit(2);
  }
  const bufs = new Map(sources.map((s) => [s.id, fs.readFileSync(path.join(ROOT, s.path))]));
  // Three declared transformations between the source's bytes and the
  // printed quote — the anchor still names the true byte range; these
  // govern only what sits between the chapter's quotation marks:
  //   whitespace runs → one space   (the source FILE's line wrap is layout)
  //   markdown emphasis marks drop  (typesetting, not words — and a slice
  //                                  cut inside an emphasis pair would
  //                                  carry an unbalanced mark that breaks
  //                                  the chapter's own rendering)
  //   inner double quotes → single  (an inner double mark would split the
  //                                  chapter's quote in two on re-read)
  const cleanSlice = (raw) =>
    raw.replace(/[*_`]/g, "").replace(/\s+/g, " ").replace(/["“”]/g, "'").trim();

  let filesTouched = 0;
  let quotesTouched = 0;
  let segmentsRewritten = 0;
  for (const file of chapterFiles()) {
    const md = fs.readFileSync(path.join(ROOT, file), "utf8");
    const spans = extractQuoteSpans(md);
    const entries = locate(sources, md, spans);
    // Right-to-left through the file so earlier offsets stay valid.
    const jobs = [];
    entries.forEach((e, i) => {
      if (!e.segments?.length) return;
      jobs.push({ span: spans[i], entry: e });
    });
    jobs.sort((a, b) => b.span.start - a.span.start);
    let out = md;
    let changedHere = 0;
    for (const { span, entry } of jobs) {
      let content = out.slice(span.start, span.end);
      const { norm, map } = normalizedIndex(content);
      // Segments in order of appearance; the search cursor only moves
      // forward so repeated words land on their own occurrence.
      const repls = [];
      let cursor = 0;
      for (const seg of entry.segments) {
        const needle = needleOf(seg.text);
        if (!needle) continue;
        const at = norm.indexOf(needle, cursor);
        if (at === -1) continue;
        const c0 = map[at];
        const c1 = map[at + needle.length - 1] + 1;
        cursor = at + needle.length;
        const slice = cleanSlice(bufs.get(seg.source).subarray(seg.b0, seg.b1).toString("utf8"));
        // Whitespace and emphasis are layout, not content — the chapter
        // hard-wraps and italicizes as its own typesetting, exactly as the
        // source file does. A segment is rewritten only when it differs
        // from the source bytes in WORDS OR CHARACTERS after both sides
        // shed layout; a wrap- or emphasis-only difference is already
        // verbatim and stays as the chapter set it.
        const existing = content.slice(c0, c1).replace(/[*_`]/g, "").replace(/\s+/g, " ").trim();
        if (existing !== slice) repls.push({ c0, c1, slice });
      }
      if (!repls.length) continue;
      for (const r of repls.sort((a, b) => b.c0 - a.c0)) {
        content = content.slice(0, r.c0) + r.slice + content.slice(r.c1);
        segmentsRewritten++;
      }
      out = out.slice(0, span.start) + content + out.slice(span.end);
      changedHere++;
    }
    if (out !== md) {
      fs.writeFileSync(path.join(ROOT, file), out);
      filesTouched++;
      quotesTouched += changedHere;
      console.log(`${file}: ${changedHere} quote(s) rewritten to source bytes`);
    }
  }
  console.log(
    `backport: ${segmentsRewritten} segment(s) in ${quotesTouched} quote(s) across ${filesTouched} file(s) now carry the source's own bytes`,
  );
}

// ── run / verify / report ───────────────────────────────────────────────────

function chapterFiles() {
  return fs.readdirSync(ROOT).filter((f) => CHAPTER_RE.test(f)).sort();
}

function run({ write }) {
  const sources = loadSources();
  if (!sources.length) {
    console.error("no sources on hand — run --snapshot first (and --add-web for fetched texts)");
    process.exit(2);
  }
  const out = { normalization: "typographic quotes/dashes folded, ellipsis to '...', markdown emphasis stripped, whitespace collapsed, case folded", minSegmentWords: MIN_SEGMENT_WORDS, chapters: {} };
  let totals = { quotes: 0, anchored: 0, partial: 0, unlocated: 0 };
  for (const file of chapterFiles()) {
    const md = fs.readFileSync(path.join(ROOT, file), "utf8");
    const entries = locate(sources, md, extractQuotes(md));
    if (entries.length) out.chapters[file] = entries;
    for (const e of entries) {
      totals.quotes++;
      totals[e.status === "anchored" ? "anchored" : e.status === "partial" ? "partial" : "unlocated"]++;
    }
    if (write) {
      const injected = injectBlock(md, anchorsBlock(entries));
      if (injected !== md) fs.writeFileSync(path.join(ROOT, file), injected);
    }
  }
  if (write) fs.writeFileSync(ANCHORS_PATH, JSON.stringify({ ...out, totals }, null, 2) + "\n");
  console.log(
    `${totals.quotes} quotation(s) of substance across ${Object.keys(out.chapters).length} chapter(s): ` +
      `${totals.anchored} anchored, ${totals.partial} partially anchored, ${totals.unlocated} unlocated` +
      (write ? " — ANCHORS.json and chapter blocks written" : ""),
  );
  return totals;
}

function verify() {
  const anchors = JSON.parse(fs.readFileSync(ANCHORS_PATH, "utf8"));
  const manifest = readManifest();
  const byId = new Map(manifest.sources.map((s) => [s.id, s]));
  let checked = 0;
  let failed = 0;
  for (const [file, entries] of Object.entries(anchors.chapters)) {
    for (const e of entries) {
      for (const seg of e.segments ?? []) {
        const src = byId.get(seg.source);
        if (!src) {
          console.error(`FAIL ${file}: anchor names unknown source ${seg.source}`);
          failed++;
          continue;
        }
        const buf = fs.readFileSync(path.join(ROOT, src.path));
        if (sha256(buf) !== src.sha256) {
          console.error(`FAIL ${file}: ${seg.source} bytes no longer match their manifest sha256`);
          failed++;
          continue;
        }
        const slice = buf.subarray(seg.b0, seg.b1).toString("utf8");
        checked++;
        if (needleOf(slice) !== needleOf(seg.text)) {
          console.error(`FAIL ${file}: bytes at ${seg.source}#b${seg.b0}-${seg.b1} do not match the quote\n  quote: ${seg.text}\n  bytes: ${slice}`);
          failed++;
        }
      }
    }
  }
  console.log(`round trip: ${checked} anchor(s) sliced and compared, ${failed} failure(s)`);
  process.exit(failed ? 1 : 0);
}

// ── main ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args[0] === "--snapshot") snapshot();
else if (args[0] === "--add-web") addWeb(args.slice(1));
else if (args[0] === "--add-unobtained") addUnobtained(args.slice(1));
else if (args[0] === "--verify") verify();
else if (args[0] === "--report") run({ write: false });
else if (args[0] === "--backport") backport();
else run({ write: true });
