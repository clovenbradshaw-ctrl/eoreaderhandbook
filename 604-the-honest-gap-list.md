# 6.4 — The Honest Gap List

<!-- nav:start -->
[← 6.3 — What's Actually New Here](603-whats-actually-new-here.md) · [Contents](000-index.md) · [7.1 — A Construction Language →](701-a-construction-language.md)
<!-- nav:end -->




**Why this matters:** this book has followed one rule since Chapter 0.1 —
never hide a gap. This closing chapter of Part VI is where that rule gets
applied at the largest scale in the whole book: a direct, sourced list of
what this project's own reading still doesn't do, stated by the same
outside review that named what's genuinely new in the last chapter.

## A note on where this diagnosis comes from

Everything in this chapter is one outside reviewer's assessment of the
codebase, checked against established psychology-of-reading research —
**not** claims the codebase makes about itself. That distinction matters.
Nowhere in this project's own working files does it say "we implement
Kintsch's model" or "we satisfy Zwaan and Radvansky's checklist." A
reviewer familiar with that research read the actual code and measured
results and reported where they lined up and where they didn't. Three
separate, independently-developed theories from cognitive psychology
happen to agree with each other on one point, and the reviewer used that
agreement as a diagnostic tool — a checklist to hold the project's own
measurements up against, not a design document the project was following.

## The gap three theories agree on

The shared claim, from research spanning 1978 to 1998: comprehension has
two phases. The first is described as promiscuous and undiscriminating —
a passage activates everything associated with it, irrelevant material
included, with no filtering yet. The second is a settling process, where
things that reinforce each other strengthen and things that don't get
suppressed. **The theories' shared claim is that the first phase alone is
not comprehension. It's the raw material — comprehension is the
settling.**

Read against this project's own organs, the reviewer's finding is that the
first phase is genuinely built, and the second mostly isn't. There's no
step where an already-resolved binding actively dampens whatever
competed with it, so a competitor that lost stays exactly as active as it
was before it lost — and the project's own measurements are quietly
consistent with this gap: the raw count of things that responded to a
passage carries real signal, while the strength of any one response
carries far less.

## Three of five situation-model dimensions, honestly absent

A separate piece of research proposes that readers track a situation
along five dimensions at once — time, space, causation, motivation, and
who's involved — and pay a measurable cost whenever any one of those five
breaks continuity. Checked against this project's organs: *who's involved*
is tracked well. Something adjacent to *causation* is tracked, indirectly.
*Time* is tracked only as the order material was presented in, not as
time within the events being described. *Space* and *motivation* aren't
tracked at all. Stated as what it is: not a criticism so much as a map of
where the remaining work actually goes, with the dimension this project
has invested most in being only one of five.

## What Chapter 6.2 already told you, in this list's terms

Chapter 6.2's ceiling belongs on this list too, stated at the same size:
the role-fold arc has found two unlabeled, position-shaped clusters per
verb, not yet Fillmore's actual named roles. Real progress, clearly short
of the fifty-eight-year-old goal, and — following this whole chapter's
discipline — stated as one honest sentence rather than left as two
different impressions depending on which part of the project someone
happened to read.

## What this chapter is not saying

None of this is presented, in the source material or here, as evidence
the project doesn't work or isn't worth taking seriously. It's the same
move Chapter 1.4 taught you about the two deaths, run on the project's own
self-assessment: naming a gap precisely is what lets it eventually get
closed, and a project that can't say exactly what it's missing is a
project that has quietly stopped being able to tell the difference between
"not built yet" and "doesn't exist."

**Where this comes from:** the two-phase comprehension theories (Kintsch
and van Dijk, 1978; Kintsch's construction-integration model, 1988;
Gernsbacher's Structure Building Framework, 1990) and the reviewer's
finding about suppression are from `eoreader6/prior-art-teachable-
language-comprehender.md`, §V. Zwaan and Radvansky's five-dimension
situation-model checklist and its comparison against this project's organs
is from the same file, end of §V. Both are explicitly the outside
reviewer's own analysis, stated as such in the essay's closing note: *"The
connections drawn between this literature and the engine's behaviour are
mine and have not been checked against anyone else's reading of it."*

<!-- nav:start -->
[← 6.3 — What's Actually New Here](603-whats-actually-new-here.md) · [Contents](000-index.md) · [7.1 — A Construction Language →](701-a-construction-language.md)
<!-- nav:end -->
