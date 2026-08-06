# 6.1 — A Short History of Machines That Were Said to Read

<!-- nav:start -->
[← 5.6 — Senses, Memory, and Borrowed Models](506-senses-memory-and-borrowed-models.md) · [Contents](000-index.md) · [6.2 — The Fifty-Eight-Year-Old Objection, and Where the Project Is Actually Chipping at It →](602-the-fifty-year-old-objection.md)
<!-- nav:end -->



**Why this matters:** everything you've read so far might sound like the
first serious attempt at any of this. It isn't, and the people who built
this project are explicit about that. This chapter is the honest history —
told the way an outside reviewer of this project's own working notes told
it — so you can see this system as one entry in a much longer, mostly
failed, sequence rather than as something that fell from the sky.

## Reading has been redefined four times, and each time the definition was gamed

Here's the framing device this whole chapter is built on, stated plainly:
*"Reading is whatever the current benchmark measures. That has been true
four times, and each time the definition was gamed and then quietly
replaced."*

**First: reading as building something you could paraphrase from (1972).**
A sentence counted as understood once it had been converted into a
structured representation of basic actions, precise enough that a system
could generate paraphrases, answer questions, and draw the inferences a
text left implicit — a program could read "John gave Mary a book" and know,
without being told, that Mary now had it. This was real, and for a while
it worked strikingly well on the material it was built for. It died of
what's called the knowledge acquisition bottleneck: every one of those
structured scripts had to be hand-built, a restaurant script didn't
generalize to a hospital, and there was no finite list of scripts to
finish writing. One heroic attempt to just write down everything a system
would ever need to know started in 1984 and, decades later, is still the
standing demonstration of how large that list actually is.

**Second: reading as filling in a template (1987–1998).** A seven-year,
government-funded research program asked systems to read news reports and
fill in fixed slots — who did what to whom, with what, when, where. It
stalled: scores plateaued well below what a human could do, and,
tellingly, human annotators didn't even agree with each other often
enough to make the ceiling itself clear. The programs that resulted were
brittle and expensive to move from one kind of document to another.

**Third: reading as picking out the right span of text (1999 onward).**
Reading comprehension became a multiple-choice-style task: given a
passage and a question, select the span of text that answers it. It
scaled beautifully as a benchmark and was gamed almost as fast — large
portions of the most popular test sets turned out to be solvable without
reading both the passage and the question at all, and adding one
irrelevant, distracting sentence to a passage was enough to collapse
systems that had looked, by the numbers, like they were reading closely.

**Fourth: reading as producing text a human rates as good (today).** This
is barely a definition at all — it's a preference model. Its distinctive
property is that it can't be inspected from the outside: there's no
structure to audit, no record of what was actually used to produce the
answer. The system either satisfies you, or it doesn't, and there's
nothing else to check.

## What all four have in common

Each one of these was operationalized by whatever could actually be
scored at the time — and each, once it became the scoreboard, got
optimized against directly rather than genuinely solved. That pattern is
exactly why the next chapter matters: the project this book is about is,
by its own outside reviewer's account, implicitly proposing a fifth
definition of reading, and Chapter 6.3 is about what makes that one
different in kind rather than just newer.

**Where this comes from:** `eoreader6/prior-art-teachable-language-
comprehender.md`, §II, "Reading has been redefined four times, each time by
its scoreboard," including the framing sentence quoted at the top of this
chapter and the account of Schank's conceptual dependency (1972), the
Message Understanding Conferences (1987–1998), span-selection benchmarks
from Deep Read (1999) through SQuAD (2016), and the human-preference
definition dominant today.

<!-- nav:start -->
[← 5.6 — Senses, Memory, and Borrowed Models](506-senses-memory-and-borrowed-models.md) · [Contents](000-index.md) · [6.2 — The Fifty-Eight-Year-Old Objection, and Where the Project Is Actually Chipping at It →](602-the-fifty-year-old-objection.md)
<!-- nav:end -->
