# Daveedus - what lifters want from a tracker, and what the data says keeps them lifting

> Written 2026-09-15. The companion to [`RESEARCH-TRAINING.md`](RESEARCH-TRAINING.md):
> that one is about what to do with a barbell, this one is about the app around it.
> Three questions: why people stop, what the people who keep going were doing, and
> what a logging screen has to get right. Plus a hard look at what Jeff Nippard's
> audience actually gets from him, since that is the bar the owner set.
>
> Same evidence labels as the training document. Most "fitness app" numbers online
> are marketing; section 6 names the ones with no traceable source so nobody quotes
> them back into this project.

---

## 1. Why people stop, in real data rather than blog posts

**Strong (one very large observational cohort).** The best data set on resistance
training adherence is a 2026 analysis of the Fitbod app: 389,481 users, 100,709
self-described beginners followed for 12 months from their first logged workout,
published in Frontiers in Sports and Active Living. Adherence was defined as at
least one workout a week from day 29 to day 365, with six misses allowed. The
numbers, stated plainly:

- **10.1 %** of beginners were still adherent at 12 months; intermediates 18.3 %,
  advanced 25.8 %.
- Median time to dropout **19 weeks**; the steepest fall came **between weeks 10
  and 15**, not in the first fortnight.
- The strongest predictor by far was **how consistently a person trained in the
  first 28 days**: one standard deviation more active days cut the hazard of dropping
  out by 27 % at week 11 (hazard ratio 0.73), fading to 0.91 by week 40.
- Longer sessions protected only people who also trained often. Long and rare
  did not help.
- Using a wider variety of equipment and a higher share of resistance work (over
  cardio) both predicted staying, with the effect fading over time.
- Age helped (older users stayed more), and men stayed a little more than women.

**Grain of salt, from the authors themselves.** It is observational, so consistent
people may simply be consistent people; leaving the app is not the same as leaving
the gym; rest periods, intensity, motivation, injuries and home-versus-gym were all
unmeasured; and the sample already excludes anybody who quit inside the first four
weeks. What survives that: the thing worth protecting is the habit in the first
month, and the danger zone is month three to four, when novelty has worn off and
progress has slowed.

**What this means for Daveedus.** The app is built for the owner, who is past the
beginner cliff, but the design lessons hold for anyone: (1) every screen answers
"what do I do next" in one glance, because the friction of deciding is what a
28-day habit dies of; the Home screen's rotation card names the NEXT workout and
free-pick splits show how long ago each was done. (2) The History summary reports the
average gap between training days rather than a weekly count, because rhythm is
what predicted staying, and rhythm is not a calendar. (3) Weeks 10 to 15 are exactly
when linear progress stalls for a beginner; the stall watch, the wave and the
per-workout progress views exist so that the app has something honest to say
at that point other than "keep going".

---

## 2. What feedback does to motivation

**Strong (general psychology).** Deci, Koestner and Ryan (1999), meta-analysis of
128 experiments: positive feedback that signals competence increases intrinsic
motivation; negative feedback decreases perceived competence and with it the wish to
continue; expected tangible rewards (points, prizes) undermine intrinsic motivation
for the rewarded activity. The self-determination framework behind it, competence,
autonomy and relatedness as the three needs, is the most replicated account of
sustained voluntary behaviour there is.

**Moderate (in exercise apps specifically).** App studies mostly measure engagement
with the app, not exercise, over weeks rather than years; "gamification works" in that
literature usually means more opens, not more lifting. Reviews of periodic prompts and
reminders find mostly positive effects on behaviour, which is a different mechanism
(a cue at the right time) and better evidenced.

**Grain of salt.** Nothing here was tested on a lifter reading a red set. It is an
inference from the general finding: repeated negative feedback about competence is
demotivating, and a tracker that makes ordinary variation look like failure is
delivering exactly that several times a week.

**What this means for Daveedus.** The colour of a set was redesigned around this
(`setVerdict()`): a set is judged against the whole session so far, on either total
work or best strength, never one set against one set, because set-against-set turned
the right behaviour (a heavier first set, then a shorter second one) red. A lighter
week in the weekly sets view is neutral, not red, because it is usually the plan.
There are no points, badges or streaks (see section 4), and the one "reward" the
finish screen offers on a day without a record is a true statement about the
lifter's own history ("best hollow hold in 9 weeks", `masteryFact()`), which is
competence information rather than a prize. Autonomy is preserved structurally:
every automatic move is a suggestion the lifter can override in one tap.

---

## 3. What the logging screen has to get right

**Folk, but unanimous.** There is no controlled study of workout-logging UI. What
exists is a decade of user reviews and comparisons of the two apps lifters actually
argue about, Strong and Hevy, and they agree on the checklist: last session's
numbers pre-filled, one tap to confirm a set, a rest timer that starts itself, a
plate calculator one tap away, exercise search that is instant, and nothing that
demands attention between sets. Strong is consistently described as the faster
logger and Hevy as the better community; lifters who care about numbers pick the
first. Jeff Nippard's own advice on what to track is short: sets, reps, weight, and
an effort rating if you use one, aiming for small measurable increases week over
week.

**Inference (why speed matters more than features).** A set entry happens under time
pressure, between sets, with a heart rate up, on a phone held in one hand. Every
extra field per set is a decision made in that state, and section 1 says decisions are
what habits die of.

**What this means for Daveedus.** The set row is the ghost of last time as
placeholder, one tap to confirm, and the rest clock starts on its own. The warm-up
ramp, the plate calculator, the swap-in alternative and the level ladder are each
one tap from the set row. Nothing prompts for an effort rating per set (the training
document, section 3, gives the evidence side of that decision). The keyboard does not
open when a set is confirmed. The rule for any new control on that screen is the
same one Strong's users keep repeating: if it costs a tap per set, it costs the habit.

---

## 4. Gamification, streaks and the things that look like motivation

**Folk (the industry claims).** "75 % of users stay because of gamified elements",
"60 % retention lift", "80 % churn in two weeks", "7 in 10 quit within three months":
every one of these traces back to a vendor blog quoting another vendor blog. Section 6
lists them so they never get cited here as evidence.

**Moderate (what is actually known).** Streaks are a commitment device and they do
raise short-term frequency; the same reviews note "streak fatigue": when a long streak
breaks, engagement drops below where it started, which is the cost side of the same
mechanism. Deci's meta-analysis (section 2) predicts the general pattern: an expected
reward for an activity shifts the reason for doing it, and when the reward stops, so
does the activity.

**What this means for Daveedus.** No streaks, no points, no badges, no leaderboards.
The only "counter" on Home is the rounds-since-deload count per workout, which is a
planning fact. This is a deliberate refusal, and it is written down here so that the
next person who thinks a streak would be "a quick motivational win" reads why it was
left out: it works until it breaks, and it always breaks.

---

## 5. What Jeff Nippard's audience actually gets from him

The owner's brief was "Jeff Nippard type" work: evidence first, then application.
Read across his programs, his channel and his 2024 book, the recurring content is a
short list, and it is worth separating the parts with strong evidence from the parts
that are his (well-informed) coaching judgement.

| What he emphasises | Evidence status | Where Daveedus has it |
|---|---|---|
| Weekly sets per muscle as the main lever, around 10 to 20 | Strong (training doc s.2) | Weekly sets view with the band |
| Most sets 1 to 3 reps short of failure, isolation closer | Strong (s.3) | Exercise notes on the card, no per-set field |
| Each muscle about twice a week | Strong that it does not matter for size when volume is equated; helps strength (s.4) | Seeded 4-day upper/lower rotation |
| Small, measurable progression: add reps, then weight | Moderate (s.1) | Double progression, ladders, session verdict |
| Substitute exercises without breaking the plan | Practice | Alternatives per slot, one-tap swap, own history per variant |
| Track sets, reps, weight (and effort) | Practice | Sets, reps, weight; effort as a note and an F flag |
| Deload every 4 to 8 weeks or when performance says so | Moderate, contested (s.10) | Manual deload cycle plus a passive advisor |
| Full range of motion, controlled lowering, stable exercise selection | Moderate to strong (s.13) | Notes on the card; no fields |
| Technique videos and form cues | Practice | Not in scope: the app assumes the lifter knows the movement |

What is taken from him is the ordering of priorities, which the literature supports:
volume and effort first, then progression, then everything else. What is NOT taken is
the per-set effort rating and any form of prescribed percentages, for the reasons in
the training document. What he does that no app can do is teach the movement; the app
stays out of that and keeps a permanent note per exercise for the lifter's own cues.

---

## 6. Claims with no traceable source

- "Most fitness apps lose 80 % of users within two weeks." Vendor blogs, no study.
- "7 out of 10 people quit fitness apps within three months." A "2021 survey" that no
  blog links to. The Fitbod cohort, which is real, puts the median at 19 weeks for
  beginners who had already made it through the first month.
- "75 % of users stay engaged because of gamification"; "60 % retention increase from
  gamified elements." Marketing pages.
- "Feedback must land within 30 seconds or the reward doesn't count." A design
  heuristic stated as a finding; no source.
- "Streaks improve long-term adherence." Short-term frequency, with a documented
  downside; long-term is not shown.

---

## Sources

- Fitbod adherence cohort 2026, Frontiers in Sports and Active Living, [full text](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2026.1855668/full), [PMC13500638](https://pmc.ncbi.nlm.nih.gov/articles/PMC13500638/)
- Deci, Koestner and Ryan 1999, extrinsic rewards and intrinsic motivation, [PDF](https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf)
- Supervised, online-coached and self-guided resistance training compared, randomized trial, [PMC12529976](https://pmc.ncbi.nlm.nih.gov/articles/PMC12529976/)
- Strong vs Hevy, representative user-side comparisons: [RepReturn](https://repreturn.com/strong-app-vs-hevy/), [GymNote](https://www.gymnoteplus.com/blog/hevy-vs-strong), [PRPath](https://prpath.app/blog/strong-vs-hevy-2026.html)
- Hevy on RPE and RIR logging, [article](https://www.hevyapp.com/rpe-scale/)
- Jeff Nippard's progressive overload method, summarised with sources, [Male Optimal](https://www.maleoptimal.co.uk/guides/jeff-nippard-progressive-overload); his programs, [jeffnippard.com](https://jeffnippard.com/)
- Industry retention claims, quoted here only as examples of unsourced numbers: [Mindster](https://mindster.com/mindster-blogs/fitness-app-user-retention/), [Stormotion](https://stormotion.io/blog/fitness-app-features/), [Imaginovation](https://imaginovation.net/blog/why-fitness-apps-lose-users-ai-ar-gamification-fix/)
