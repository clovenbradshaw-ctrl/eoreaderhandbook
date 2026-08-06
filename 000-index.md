# The EO Reader 6 / EO Chat Handbook

This repository is the handbook itself. `HANDBOOK-SPEC.md` is the outline
and the contract every chapter here follows — read it first if you haven't.
This file is the table of contents and a running status of what's actually
written.

## Status

Parts 0 through VI are written in full. Part VII is planned next; Part
VIII (reference material) is built incrementally, from what the earlier
parts actually cite, rather than up front.

## Part 0 — Before You Start

- [0.1 What this book is and isn't](001-what-this-book-is-and-isnt.md)
- [0.2 A ten-minute grammar and meaning primer](002-grammar-and-meaning-primer.md)
- [0.3 A ten-minute ontology and epistemology primer](003-ontology-and-epistemology-primer.md)
- [0.4 What a language model is, in plain terms, and why this project keeps its distance from one](004-what-a-language-model-is.md)

## Part I — The One Idea Everything Is Built On

- [1.1 Noticing](101-noticing.md)
- [1.2 The difference that makes a difference](102-the-difference-that-makes-a-difference.md)
- [1.3 Witness](103-witness.md)
- [1.4 The two deaths](104-the-two-deaths.md)
- [1.5 Three numbers and a vital sign](105-three-numbers-and-a-vital-sign.md)

## Part II — The Grammar of Everything That Happens

- [2.1 Nine verbs](201-nine-verbs.md)
- [2.2 The order things happen in](202-the-order-things-happen-in.md)
- [2.3 Nine kinds of "where"](203-nine-kinds-of-where.md)
- [2.4 Nine kinds of "how"](204-nine-kinds-of-how.md)
- [2.5 Why all three have to agree](205-why-all-three-have-to-agree.md)

## Part III — How EO Reader 6 Reads

- [3.1 A reading, from the inside](301-a-reading-from-the-inside.md)
- [3.2 Gifts, not guesses](302-gifts-not-guesses.md)
- [3.3 A guided tour of the organs](303-a-guided-tour-of-the-organs.md)
- [3.4 Turns and memory](304-turns-and-memory.md)
- [3.5 Refusal as an answer](305-refusal-as-an-answer.md)
- [3.6 How the engine is allowed to grow](306-how-the-engine-is-allowed-to-grow.md)

## Part IV — Why the Rules Are the Rules

- [4.1 Four boxes](401-four-boxes.md)
- [4.2 The tests, in plain language](402-the-tests-in-plain-language.md)
- [4.3 A constitution that edits itself](403-a-constitution-that-edits-itself.md)
- [4.4 One amendment, start to finish](404-one-amendment-start-to-finish.md)

## Part V — EO Chat: Where You Meet It

- [5.1 A thin front door](501-a-thin-front-door.md)
- [5.2 Instructions all the way down](502-instructions-all-the-way-down.md)
- [5.3 Four promises to the reader, in plain language](503-four-promises-to-the-reader.md)
- [5.4 A citation you can actually check](504-a-citation-you-can-actually-check.md)
- [5.5 Writing something long without losing the thread](505-writing-something-long-without-losing-the-thread.md)
- [5.6 Senses, memory, and borrowed models](506-senses-memory-and-borrowed-models.md)

## Part VI — Where This Sits in History

- [6.1 A short history of machines that were said to read](601-a-short-history-of-machines-that-were-said-to-read.md)
- [6.2 The fifty-eight-year-old objection, and where the project is actually chipping at it](602-the-fifty-year-old-objection.md)
- [6.3 What's actually new here](603-whats-actually-new-here.md)
- [6.4 The honest gap list](604-the-honest-gap-list.md)

## Part VII and Part VIII — not yet written

See `HANDBOOK-SPEC.md` §6 for the planned content of every remaining part.

## Where this repository lives, and why

This handbook used to be drafted inside `eochat/docs/handbook/`, next to
the spec that first proposed it (PR #38 there). Once a dedicated
`eoreaderhandbook` repository turned out to already exist — created for
exactly this, sitting empty — the whole handbook, spec included, moved
here. `eochat`'s own copy is being removed from its feature branch to
avoid two diverging copies existing at once; nothing about that touches
`eochat`'s already-merged history.

## Decisions made so far, provisionally

- **Q1 (location):** resolved — here, in this repository, not in
  `eochat/docs/handbook/`.
- **Q3 (format):** one file per chapter, numbered `NNN-slug.md`, mirroring
  `eochat/instruction-set/`'s convention. The numbering leaves a block of
  ten per part (`0XX` for Part 0, `1XX` for Part I, and so on) so later
  insertions don't require renumbering existing chapters.

**Q2 (is Part VII in scope), Q4 (full ~35-chapter depth), and Q5 (how
fast-moving citations like Part III.6 and Part VI.2 should be anchored and
re-checked)** are addressed as each relevant part is written — see each
part's own chapters for how they were actually handled, since the answer
turned out to be chapter-specific rather than a single global policy.

<!-- nav:start -->
← *(start of the book)* · [Contents](000-index.md) · [0.1 — What This Book Is, and Isn't →](001-what-this-book-is-and-isnt.md)
<!-- nav:end -->
