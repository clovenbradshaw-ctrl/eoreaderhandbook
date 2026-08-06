# 7.1 — A Construction Language

<!-- nav:start -->
[← 6.4 — The Honest Gap List](604-the-honest-gap-list.md) · [Contents](000-index.md) · [7.2 — The Watchmaker's Discipline →](702-the-watchmakers-discipline.md)
<!-- nav:end -->

**Why this matters, and a boundary to draw first:** this chapter and the two
after it describe something real, but it isn't a description of EO Reader
6 or EO Chat. It's a related, earlier generation of the same lineage —
`eoreader4.1`/`eoreader4.2` — and keeping that boundary visible is more
important than anything else in this Part.

## Why this belongs in the book at all, and why it's flagged this way

Chapter 2.1 taught you nine verbs, and Chapter 2.5 warned you the cube they
come from is explicitly *"an instrument, not a runtime"* — something
builders hold an idea up against, never a machine that classifies real
content or drives a live system. A different, earlier generation of this
project took a genuinely different path: it built an entire application
construction language directly on top of the same nine operators, where a
kernel checks, in real time, whether an emitted action stays inside what
was declared. That's worth teaching, honestly, as a related project with a
real and different design choice — not as a hidden extra feature of the
engine you've spent six parts learning about. Neither generation is being
presented as the more correct one here; they made different bets, and
telling them apart clearly is itself a small worked example of this book's
own rule against hiding a gap.

## The two laws

Everything in this construction language follows from exactly two rules.

**Every part declares a contract, and every contract has the same shape.**
A "part" is anything you emit — a room, a surface, a filter, a whole app —
and every one of them declares, in the same three fields, what it's
allowed to do: which of the nine operators it may fire, which terrains its
events may land in, and which stances its events may resolve through. A
kernel checks every single emitted event against its part's declared
contract. There is exactly one contract shape, at every scale — learn it
once, and you've learned it everywhere in this language.

**Every app gets assembled the good watchmaker's way.** You'll meet this
rule properly in the next chapter — it's the same discipline Chapter 5.5
already taught you, arrived at again in a genuinely different corner of
this project's own history.

## A plain-punctuation surface

The language itself, called EOT, uses ordinary punctuation you already
recognize, mapped onto the operators from Chapter 2.1: a colon declares
what kind of thing something is, a dot and an equals sign set a property,
an arrow declares a connection, a tilde marks something explicitly absent.
A handful of rarer moves need an explicit marker (written `!OP`) — drawing
a boundary, synthesizing a whole from parts, or running a checkpoint. You
never choose which of the nine operators a line of EOT invokes; the
kernel recovers that from the punctuation shape itself, and it validates
your output rather than trusting you to have validated it yourself.

## A genuinely different bet about grain and dependency

One difference is worth naming directly, because it's a real, substantive
design choice, not a cosmetic one: this construction language treats the
nine operators as a **strict, linear dependency chain** — `NUL → SIG → INS
→ SEG → CON → SYN → DEF → EVA → REC` — arguing that of nearly thirteen
hundred possible orderings, only this one survives basic consistency
checks. Chapter 2.2 taught you a dependency ordering too, for the engine
you've spent most of this book learning about — but that one lives on the
*grain* axis (Ground, Figure, Pattern) and on specific, individually
checked dependencies between particular organs, not as one universal
sequence claimed to bind all nine operators at once. Both are real,
considered positions. They are not the same claim, and this book isn't
going to blur them into one just because they share a vocabulary.

**Where this comes from:** everything in this chapter is
`eoreader4.2/docs/eo-for-coders.md`, whose own canon line states its
lineage plainly: *"the nine operators as implemented in eoreader4.1
`core/operators.js`, the three faces as defined in `core/faces.js` and
`core/cube.js`."* The two laws are its opening section. The EOT punctuation
table and the "propose; the kernel disposes" line are from "Layer 0 — The
Legend." The linear dependency chain ("the helix") and its claim about
1,295 of 1,296 orderings failing is from "Layer 1 — The Nine Operators."
The contrast with `eoreader6/CUBE.md`'s "instrument, not runtime" framing
is drawn from that file directly, discussed in Chapter 2.5.

<!-- nav:start -->
[← 6.4 — The Honest Gap List](604-the-honest-gap-list.md) · [Contents](000-index.md) · [7.2 — The Watchmaker's Discipline →](702-the-watchmakers-discipline.md)
<!-- nav:end -->
