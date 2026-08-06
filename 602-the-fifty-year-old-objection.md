# 6.2 — The Fifty-Eight-Year-Old Objection, and Where the Project Is Actually Chipping at It

<!-- nav:start -->
[← 6.1 — A Short History of Machines That Were Said to Read](601-a-short-history-of-machines-that-were-said-to-read.md) · [Contents](000-index.md) · [6.3 — What's Actually New Here →](603-whats-actually-new-here.md)
<!-- nav:end -->



**Why this matters:** Chapter 3.6 already showed you the role-fold arc as a
worked example of the growth rule in action. This chapter is about the
actual problem that arc is trying to solve — a specific, named, decades-old
objection this project has not fully answered — and about being precise
regarding exactly what was borrowed from where in the attempt.

## The objection, stated the way its author stated it

In 1968, the linguist Charles Fillmore published an argument that a
sentence's grammatical subject is not the same thing as its semantic
agent — the thing actually doing the action — and that any system treating
the two as interchangeable will fail on a large fraction of ordinary
language. His own examples: *"John broke the window,"* *"the hammer broke
the window,"* *"the window broke."* In all three, the broken window sits in
the same grammatical slot. But John is the one who did it, the hammer is
the tool he did it with, and in the third sentence there's no agent named
at all. A rule that reads "the thing before the verb is the doer" gets the
first sentence right and the other two wrong — not as an edge case, but as
a predictable consequence of the rule itself.

## This project's own mouth has exactly that problem, by direct measurement

This isn't a hypothetical risk. The organ in this project responsible for
finding *who did what to whom* worked, for a long time, by finding a verb
and reading the word immediately before it as the doer — a word-order
rule, in exactly the shape Fillmore spent a career arguing against. And it
was tested directly, against real text judged independently for who
actually acted in each clause. It lost 87% of what that independent
judgment said was actually there. That's not a rounding error. It's the
specific, predicted failure of exactly the assumption Fillmore named,
arriving on schedule, fifty-eight years later, in a system that had never
read his paper going in — the project's own working notes state the
connection plainly rather than treat the failure as a mystery.

## What the wider field did about it, and why this project isn't doing that

Fillmore's objection has a well-trodden answer in the research world:
semantic role labeling. Large hand-annotated collections of real
sentences, with each argument tagged as agent, instrument, patient, and so
on — FrameNet, PropBank, a long-running sequence of shared evaluation
tasks. It works, moderately well, and it is thoroughly **supervised**: it
depends on exactly the kind of large, hand-built, human-annotated resource
the "reading as filling a template" era already showed doesn't scale
cleanly. There's also an **unsupervised** version of the idea — inducing
role-like clusters from patterns in text with no hand labels at all — and
it's real, live research, with results that remain considerably weaker
than the supervised version.

**This project is not doing either of those things**, and it's worth being
precise about why not, rather than leaving the impression that role-fold
is a homegrown reimplementation of semantic role labeling. Nothing in
role-fold is trained against a hand-annotated corpus of agent/instrument/
patient labels, and nothing in it inherits FrameNet's or PropBank's
category system. What it borrows instead — and this is the same precise
sense of "borrowed" Chapter 3.6 already walked through — is a strategic
idea from a completely different field: research on how children actually
acquire verbs, which found that they build narrow, per-verb patterns of
"who does this with what" long before they generalize across verbs at all.
Role-fold took that one finding — cluster narrow, per verb, before you
ever pool across verbs — and used it to reorder its own clustering
question, then tested whether the reorder helped its own real data. It
did. A second technique for finding candidate word groups in the first
place borrows, in the same precise way, a statistical signature from
research on how infants segment continuous speech into word-like chunks
with no grammar at all.

## What this has actually earned, stated at the same size as the claim

A cross-lingual test found that the clustering mechanism itself reaches
real, structured groupings at similar rates across English, French,
German, and Finnish — evidence that the mechanism isn't secretly
English-specific, even though the earlier step that proposes candidate
words in the first place clearly is, and breaks predictably on German. The
short version, in the project's own words: *the mouth is language-specific
by construction, the organ isn't.*

And the honest ceiling, stated as plainly as the progress: what's been
found so far is **two unlabeled, position-shaped clusters per verb** — a
real structural finding, not nothing — and not yet Fillmore's actual goal,
which was named semantic roles like agent and instrument. Telling two
groups apart by their position in an event is a real step past a bare
word-order rule. It is not the same achievement as being able to say
*which* group is the agent and *which* is the instrument. That gap is
named directly, in the same file that reports the progress, rather than
left for a reader to notice on their own.

**Where this comes from:** Fillmore's argument and the field's response
(FrameNet, PropBank, unsupervised SRL) are from `eoreader6/prior-art-
teachable-language-comprehender.md`, §III, including the direct citation
*"Charles Fillmore, The Case for Case, 1968"* and its three examples. The
87% recall-loss measurement is from `eoreader6/scripts/experiments/
FINDINGS.md` §1 (PR #44, `goldens/agency-civic/`). The verb-island
reordering and its citation of usage-based language-acquisition research,
the transitional-probability chunking and its citation of infant
speech-segmentation research, and the cross-lingual result ("the mouth is
language-specific by construction, the organ isn't") are from `eoreader6/
scripts/experiments/README.md` (PRs #45–48). The stated ceiling against
Fillmore's actual goal (two coarse, unlabeled kinds rather than named
roles) is from `FINDINGS.md` §11.4.

<!-- nav:start -->
[← 6.1 — A Short History of Machines That Were Said to Read](601-a-short-history-of-machines-that-were-said-to-read.md) · [Contents](000-index.md) · [6.3 — What's Actually New Here →](603-whats-actually-new-here.md)
<!-- nav:end -->
