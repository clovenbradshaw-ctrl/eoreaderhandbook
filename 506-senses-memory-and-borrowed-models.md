# 5.6 — Senses, Memory, and Borrowed Models

<!-- nav:start -->
[← 5.5 — Writing Something Long Without Losing the Thread](505-writing-something-long-without-losing-the-thread.md) · [Contents](000-index.md) · [6.1 — A Short History of Machines That Were Said to Read →](601-a-short-history-of-machines-that-were-said-to-read.md)
<!-- nav:end -->




**Why this matters:** Chapter 5.1 told you the application calls outside
language models as tools it doesn't own, never as the measurement itself.
This chapter shows exactly what that looks like in one real, small,
carefully-bounded feature — and, just as importantly, shows what happened
when an early version of it wasn't bounded carefully enough.

## The problem: remembering a conversation without re-reading it

A conversation with EO Chat can run long. Re-reading every previous
exchange, in full, before answering a new question, doesn't scale — and it
runs straight into Chapter 5.5's whole discipline: don't hand a model more
and more context as things grow. So the application keeps a small, running,
constantly-updated summary of the *shape* of the conversation so far —
its topic, its flow, which entities keep coming up — rather than the
conversation's actual words.

## How it's actually built: two small steps, one small model

The mechanism is explicit about staying small at every step. Once a turn
finishes, it gets reduced to one short line — under a hundred characters —
describing what that turn actually contributed to the discourse. That
line then gets folded into a running record with a handful of capped
fields: an overall topic, the current flow, and a short list of the
entities that keep recurring, each field capped at a strict character
limit. The whole running summary — every field combined — is capped at
around two hundred characters, permanently. It never grows past that, no
matter how long the conversation runs.

Both of those steps — the per-turn folding and the summary update — are
done by calling a separate, distinct, self-contained language model, not
the one carrying the actual conversation. The module that defines this
logic says, of itself, that it does no networking and no file access at
all: it's pure computation, and the actual outside call is supplied by
whoever's using it. Practically, this call runs cheaply, in the
background, after the real answer has already been sent to you — updating
the summary is never something you're kept waiting on.

## Gated off, on purpose, for exactly the reason you'd guess

Here's the part worth paying closest attention to, because it's a real,
tested design decision rather than an assumption. For the first several
turns of any conversation, this rolling summary is not injected into
anything at all — it's computed and kept, but withheld. The reason, in the
system's own words: *"The verbatim history fold already re-presents the
last [several] exchanges, so the summary adds no information until the
oldest of those has fallen out of the window — and injecting it earlier
only repeats the same old topic three times over... anchoring a fresh
question to the thread it left instead of answering it."*

That's a genuinely specific failure mode, caught and named: an
always-on summary, even a small and cheap one, can make a brand-new
question look like it belongs to the previous topic just because the
summary of that previous topic is sitting right there in view. The fix
isn't "make the summary smarter." It's "don't show it at all until it's
actually the only thing left that still remembers something the raw
history no longer does."

## Where this sits in Chapter 5.1's boundary

This whole feature is a clean, concrete instance of the host/engine line
Chapter 5.1 drew. The model doing the summarizing is explicitly a tool the
application reaches for and doesn't own — swappable, small, disposable if
it's ever wrong. Nothing about the engine's own reading, the measurement
Part III described, changes because this feature exists or doesn't. Delete
the whole discourse-summary mechanism, and the engine reads exactly the
same as it did before. That's Chapter 5.1's test, passing, on a feature
built after that rule was already in place.

**Where this comes from:** `eochat/server/conversation-summary.js`
(module header, size caps, and the two-step fold-then-update mechanism) and
`eochat/server/turn-controller.js` (the model call itself, run via
`setImmediate` after the answer is sent, and the gating logic quoted above
— *"injecting it earlier only repeats the same old topic three times
over... anchoring a fresh question to the thread it left"*).

<!-- nav:start -->
[← 5.5 — Writing Something Long Without Losing the Thread](505-writing-something-long-without-losing-the-thread.md) · [Contents](000-index.md) · [6.1 — A Short History of Machines That Were Said to Read →](601-a-short-history-of-machines-that-were-said-to-read.md)
<!-- nav:end -->
