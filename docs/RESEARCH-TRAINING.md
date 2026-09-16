# Daveedus - what the training research actually says

> Written 2026-09-15. The question behind this document: which of the rules this app
> runs on are actually supported by evidence, for whom they hold, and where each one
> is applied in the code, with the exact thresholds, so that anybody can check the
> reasoning or change a number with open eyes.
>
> Every section ends with a line on what it means for Daveedus. A finding that does not
> change or justify something in the product does not belong here. Section 15 lists what
> we should NOT build and section 16 lists popular claims that turned out to have no
> traceable source or a much weaker one than the way they are repeated.
>
> Grain of salt, up front: almost everything below is a population average from studies
> of 8 to 40 people over 6 to 12 weeks. The owner of this app is one person. Section 0
> is about that gap and it colours every other section.

## How to read the evidence labels

- **Strong** - meta-analysis or repeatedly replicated experimental work.
- **Moderate** - a small number of controlled studies, or a large study not yet replicated.
- **Weak** - single small study, uncontrolled, or preliminary.
- **Inference** - the mechanism is evidenced but the specific application is not tested.
- **Folk** - coaching vocabulary with no research behind the specific claim. Not
  worthless, but not evidence.

Where a number in the code comes from a study, the study is named. Where it is a
judgement call, it says so. The code references are function names; search the `js/`
folder for them.

---

## 0. The caveat over everything: individuals differ, a lot

**Strong.** Ahtiainen et al. (2016) pooled 287 untrained men and women aged 19 to 78
after 20 to 24 weeks of the same resistance training. Muscle size changed by 4.8 %
on average, with a range from **-11 % to +30 %**. Strength changed 21.1 % on average,
range **-8 % to +60 %**. Some of that spread is measurement noise, but a 2025
repeated-training study found that the same person responds similarly when the same
program is repeated, so a meaningful part of it is real individual response.

**What this means for Daveedus.** Every threshold in this app is a starting point, and
the app measures the owner, not the population. That is why the training brain is
built on the lifter's own history (estimated 1RM series, cumulative session work,
weekly sets) rather than on a formula that says what a person "should" lift. It is
also why nothing here locks: every suggestion is a placeholder that one tap overrides,
and every automatic move (level up, wave round, deload advice) can be undone or
ignored. When a section below says "10 to 20 sets" or "2 minutes", read it as "the
band where most people land", never as a rule the owner is failing.

---

## 1. Progressive overload and double progression

**Strong (the principle).** Getting stronger over time requires the stimulus to rise
over time. This is not controversial. What IS open is how: load, reps, sets or
something else.

**Moderate (load vs reps).** Plotkin et al. (2022) trained about forty people for 8
weeks with either load progression or repetition progression at matched effort. Both grew;
strength favoured load progression slightly, one quadriceps head favoured rep
progression slightly, and the authors call the differences of questionable practical
significance. So "add reps, then add weight" (double progression) is as good as any
other scheme for muscle, and slightly better for strength when the weight does go up.

**Folk (the increments).** The 2.5 kg step is a plate, not a finding. The one study on
very small steps (0.5 lb increments in older adults) found they work, but nothing
says 1.25 kg beats 2.5 kg for a trained lifter. Jeff Nippard's programs use "add 1 to 2
reps a week, or 2.5 to 5 kg" and that matches ordinary coaching practice, nothing more.

**What this means for Daveedus.** Double progression is opt-in per exercise, and the
rule is deliberately strict: `dpDue()` offers a step only when EVERY working set of the
last session on the same template reached the top of the rep range. It stays silent
during a wave, during a deload pass, after a layoff (`cbFactor() < 1`) and once
anything is typed. `applyDp()` adds the exercise's own step (1.25 / 2.5 / 5 kg or
2.5 / 5 lb, see `dpSteps()`) to each set's previous load. The step is a plate pair
because that is what the bar accepts; there is no evidence-based increment to prefer.
For bodyweight work the same rule moves the level ladder instead of the weight
(section 14).

---

## 2. Weekly volume: the 10 to 20 set band

**Strong (direction).** More weekly sets per muscle give more growth, with diminishing
returns. Schoenfeld, Ogborn and Krieger (2017), 15 studies: under 5 weekly sets
averaged 5.4 % muscle growth over a study, 5 to 9 sets 6.6 %, 10 or more 9.8 %.
Baz-Valle et al. (2022), review of trained men: 12 to 20 weekly sets is the range
they call optimal, with no advantage found above 20 for most muscles.

**Strong, and newer (shape).** Pelland et al. (2025), Sports Medicine, 67 studies and
2,058 participants, the largest dose-response meta-regression to date: hypertrophy
keeps rising with volume but with diminishing returns, and strength shows
**considerably more pronounced** diminishing returns. Their estimate is roughly a
0.24 % extra gain per additional weekly set at the average volume of about 12 sets,
against Schoenfeld's earlier 0.38 %. Two details matter for anybody counting sets:

- Counting **fractional** sets (an indirect set, such as the triceps in a bench press,
  counted as half a set) predicted outcomes better than counting only direct sets.
- With volume equated, **frequency did not matter for hypertrophy**, and helped
  strength with diminishing returns (section 4).

**Moderate (per session).** Schoenfeld et al. (2019) had trained men do 1, 3 or 5 sets
per exercise for 8 weeks: more volume gave more muscle but the same strength. Strength
saturates at lower volume than size does.

**Grain of salt.** Studies compare groups doing different volumes for 6 to 12 weeks;
what an individual can recover from over a year is a different question that no
study answers. "Too much" exists (the inverted U in Pelland's non-linear models) but
where it sits for one person is not knowable from the literature.

**What this means for Daveedus.** The weekly sets view (`weeklyMuscleSets()`) counts
working sets per muscle group per calendar week, Monday-anchored, warmups excluded,
four weeks side by side, and draws a **muted band at 10 to 20**. The band is a guide
drawn from the studies above; it is never a grade, there is no red, and a lower week
is shown as neutral information (`.wv-down`) because a lighter week is often the plan.
Two honest limitations of the count: it assigns each exercise to ONE primary muscle
group (`EX_DB` has no secondary muscles), so it under-counts triceps, rear delts and
hamstrings that get indirect work, which is exactly the fractional counting Pelland
found most predictive; and 10 to 20 is the band for people already training
seriously, not a floor for a beginner. Both are stated in the on-screen hint.

---

## 3. How close to failure

**Strong (hypertrophy).** Robinson et al. (2024), 55 studies, meta-regressions on
estimated reps in reserve (RIR): muscle growth improves the closer sets get to
failure, roughly linearly across the 0 to 5 RIR range, with 0 to 5 RIR recommended.
Refalo et al. (2024), within-subject, 26 trained adults, 8 weeks: one leg to failure,
the other at 1 to 2 RIR, **similar hypertrophy**, more fatigue and perceived exertion
on the failure side.

**Strong (strength).** Same Robinson meta-regression: no clear relationship between
proximity to failure and strength gain; the confidence intervals contain zero in every
model. The authors suggest 3 to 5 RIR with heavier loads for strength and warn that
near-failure training is "harder to recover from, potentially impacting long-term
performance negatively".

**Moderate (autoregulation).** Hickmott et al. (2022), meta-analysis: RIR- or
RPE-based load prescription and fixed percentage prescription produced similar
strength gains; a small edge appeared when autoregulation ended up prescribing higher
intensities. So logging effort does not by itself make a program better.

**What this means for Daveedus.** The app does NOT ask for an RPE or RIR number on
every set. Each field per set is a tap under time pressure (see `RESEARCH-APP.md`, section
3), and the evidence above says the useful instruction is coarse: isolation and
higher-rep work near failure, heavy compounds a few reps short. That instruction lives
where it is read, in the exercise note shown on the workout card (`pnote`): the
seeded program says "1 RIR, last set 0 RIR" on bench, "1 to 2 RIR, never to failure"
on squats, "To failure" on lateral raises. A set that actually failed can be flagged
(`fail`) and shows as F in history. If a future owner wants per-set RIR, the data
model has room for it, but it is a deliberate omission today, not an oversight.

---

## 4. Frequency

**Strong.** Schoenfeld, Grgic and Krieger (2019), meta-analysis: when weekly volume is
equated, training a muscle once, twice or three times a week produces the same
hypertrophy; frequency is a tool for distributing volume, not a driver on its own.
Grgic et al. (2018) for strength: more frequent training helped, but the effect
disappeared in the volume-equated subgroup. Pelland (2025) refines this: negligible
for hypertrophy, a real but diminishing benefit for strength, which fits strength
being partly a skill that improves with practice.

**What this means for Daveedus.** The seeded program is a 4-day upper/lower rotation,
so every muscle is hit about twice a week, which is where high weekly volumes are
practical to recover from within a session. Beyond that the app does not preach a
frequency: it shows the facts. Program views report sessions per week
(`folderProgStats().perWeek`), free-pick splits show "how often and how long ago", and
the History summary shows the average gap between training days. The evidence says the
number that matters is weekly sets, and that is the one drawn in a band (section 2).

---

## 5. Rest between sets

**Strong.** Under 60 seconds of rest costs hypertrophy; from about 1 to 2 minutes
upward the differences are small. Singer et al. (2024), Bayesian meta-analysis: best
growth with 1 to 2 minutes and little difference between 1 to 2, 2 to 3 and 3 or more.
Schoenfeld et al. (2016), trained men, 1 vs 3 minutes: 3 minutes won for both strength
and size, the study that moved the field away from short rests. De Salles et al.
(2009), review: 3 to 5 minutes for strength with heavy loads. The mechanism is simple:
short rest cuts the reps you can do on the next set, which cuts volume.

**Moderate (a caveat).** When the shorter-rest group is allowed extra sets to match
volume, hypertrophy comes out similar; rest is a means to volume, not a stimulus.

**What this means for Daveedus.** Rest is per exercise (`rt` on the template, `ex.rt`
in the session): the seeded program uses 240 s on heavy bench and squat, 180 s on
rows, dips and pull-ups, 120 s on presses and leg press, 90 s on curls and pulldowns,
60 s on isolation work, and the global default (`restTarget`) is 120 s. The timer
starts by itself when a set is confirmed, because the study-relevant failure mode is
not "rested too long" but "went again at 40 seconds because nothing said otherwise".
The timer is a target, not a gate; nothing blocks the next set.

---

## 6. Load and rep ranges

**Strong.** Schoenfeld et al. (2021), re-examination of the "repetition continuum":
muscle grows about equally across a wide range of loads, from roughly 6 to 30 or more
reps per set, as long as sets are taken close to failure; the 2017 low-load vs
high-load meta-analysis found no whole-muscle hypertrophy difference above and below
60 % 1RM. **Maximal strength is different**: it needs heavy loads, because part of
strength is skill and neural drive specific to the load.

**Grain of salt.** Very high-rep sets (25 and up) near failure are unpleasant and
hard to judge, and low-load work fails on the "close to failure" condition more often
in practice than in a lab.

**What this means for Daveedus.** Rep targets are ranges per exercise (`targetReps`,
parsed by `repsParse()`), and the seeded program pairs heavy compounds with 3 to 6 reps
and isolation work with 12 to 20, which is the strength-plus-size split the evidence
supports. The app does not push a "hypertrophy zone". It does something more useful
with the range: the top of the range is the trigger for progression (section 1), so a
range is a contract with next session, not a style preference.

---

## 7. Estimated 1RM: a comparison index, not a prediction

**Weak (the formulas).** The Epley formula, `weight × (1 + reps / 30)`, comes from a
poundage chart in a 1985 training manual, not from a peer-reviewed derivation, and
Brzycki's from a practitioner article. Validation studies since agree on the useful
part: both are reasonably accurate for **2 to 10 reps** (within a few percent, 3 to 5
rep sets best), and both drift above 10 reps, Epley upward, because fatigue and
technique breakdown, not strength, decide how many reps a 15-rep set gets.

**Strong (the noise floor).** Grgic et al. (2020), systematic review of 32 studies and
1,595 people on 1RM test-retest: median coefficient of variation **4.2 %**, range
0.5 to 12.1 %. A real 1RM measured twice a week apart differs by about 4 % on
average with nothing having changed. An ESTIMATED 1RM from a submaximal set inherits
that plus the formula error.

**What this means for Daveedus.** `sessionE1rm()` takes the best estimate among a
session's working sets (warmups and drop sets excluded, deload sessions excluded), on
TOTAL load: added weight, plus the lifter's body weight on bodyweight lifts, plus the
machine base on plate-loaded machines, times two on paired dumbbells. That makes a
heavier lifter and a heavier sled compare on one scale. It is used ONLY to compare a
lift with itself over time, never to prescribe a percentage, and the on-screen label
says "est.". Two consequences follow from the evidence above and both are in the code:

- Every detector uses a **dead band** wider than single-session noise. Trend
  direction ignores changes under 1.5 % of averaged halves (`seriesTrend()`), the
  stall watch needs a lift to fail to beat its best by more than 0.25 % four sessions
  running (`stallInfo()`), the fatigue check calls a lift "down" only when the last
  two sessions both sit 5 % or more under the 4-week peak and "flat" when three
  sessions gain nothing beyond 2.5 % on the three before (`liftFatigue()`), and the
  wave counts a new best only above 0.5 % (`waveVerdict()`).
- On 15 to 20 rep isolation work the estimate is inflated, and the app does not
  pretend otherwise: it never converts it to a load, and because a lift is compared
  with itself at similar rep ranges the trend survives. What does NOT survive is a
  switch of rep range: moving lateral raises from 20s to 8s will shift the level of
  the series. The stall watch is therefore attached to tracked lifts, which are
  meant to be the heavy ones.
- A single is its own one-rep max. `e1rmOf()` returns the load of a one-rep set as it
  is and applies Epley only from two reps up, because Epley's `1 + 1/30` would add 3 %
  to every heavy single and to every tested max.

### Testing a real max

**Strong (the protocol).** The NSCA procedure is the one most studies use: a light
warm-up for 5 to 10 reps, a heavier one for 3 to 5, then single attempts with **3 to
5 minutes** of rest, raising the load each time, and the max found within **3 to 5
attempts**. Tested this way the 1RM is safe across populations, older adults included,
and repeatable to the 4 % median noise above. One caution recurs: people new to
lifting get more soreness from it and gain little information, because their max
changes week to week anyway.

**Folk (the attempt percentages).** Powerlifting coaches pick an opener near 90 to 92
% of the expected max (a weight you could triple on a bad day), a second near 96 to
98 %, and a third at or just above 100 %. This is meet strategy, not a study, but it
has the right shape for anybody: the opener builds confidence, the second tells you
what the day holds, the third is the attempt.

**Folk (how often).** Coaching advice for non-competitors ranges from every 8 to 12
weeks to once or twice a year. No trial compares testing frequencies. A tested max
is a measurement with a noise floor, not a training stimulus, so testing more often
mostly buys more noise.

**Grain of salt.** A missed max on a tired morning is inside the 4 % noise, so it says
little about strength. And a tested max and an Epley estimate are not the same
instrument: for some lifters Epley under-reads their single and for others it
over-reads it, so the two should not be averaged into one trend.

**What this means for Daveedus.** A max test is a card in a workout. It is added from a
card's menu and sits above that lift, which fits the usual order on a deload day: test
first, then the light work. It can also start on an exercise screen, as part of the
running workout or as a session of its own (`addMaxCard()`, `openMaxTest()`). Its
rows are single attempts, each logged made or missed with its own clock time, with 4
minutes of rest between them. The W button builds the same big-plate warm-up ramp as
any barbell card, aimed at the opener (section 12). The suggested attempts are 92 %,
97 % and 101 % of what the lift shows now, snapped to the plate step, and the third
is always one step above the estimate (`maxPlan()`). When there is no real estimate,
meaning fewer than three recent sessions and no recent test, the rows stay empty. In
history the entry carries a max flag, and `isRecordEntry()` decides where it counts:

- **Records: yes, even on a deload pass.** The best lift, the rep-max table, the PR
  feed and the finish screen all see a made single. A miss is kept in the log and
  never becomes a record.
- **Training: no.** The trend arrow, stall watch, fatigue check, wave, double
  progression, ghosts and charts all skip a test, for the grain-of-salt reasons above.
  A bad test morning must not read as a strength drop, and a single must not become
  next week's ghost.
- **"Where the lift is now": yes, for 90 days.** `currentE1rm()` takes the higher of
  the training estimate and any test inside the current-form window. The goal bar and
  the next test's suggestions therefore move when a test beats the estimate, and an
  old test ages out.

Nothing reminds you to test and nothing suggests when. The evidence gives no
frequency worth nudging toward.

---

## 8. Reading a trend without fooling yourself

This section is statistics hygiene, not a training finding. Label it **Inference**.

- **One point per session.** A lift logged twice in a session (top set plus back-off
  slot) is one session, not two (`e1rmSeries()`). Every window downstream counts
  sessions, so this keeps them honest.
- **A trend is a comparison of halves, not a slope.** `seriesTrend()` needs at least
  4 points and compares the mean of the first half with the mean of the last half,
  with the 1.5 % dead band from section 7. Averaging shrinks the 4 % single-session
  noise; a slope through four noisy points would not.
- **Current form, not lifetime.** Progress logic looks at the last 12 sessions within
  90 days (`recentSeries()`), and a direction call never crosses a break of 60 days or
  more nor speaks at all if the last session is over 120 days old (`trendWindow()`).
  After a cut, an injury or a program change, the old peak ages out and the detectors
  recalibrate to what the lifter can do now. Records and the PR feed stay all-time on
  purpose, because that is what a record is.
- **A projected date is only shown when it is earnable.** `etaFor()` fits a line
  through at most the last 10 sessions and shows a month only if the trend is up, there
  are at least 4 points spanning at least 14 days, and the answer lands within three
  years. Four sessions in one week would extrapolate nonsense, so they extrapolate
  nothing.
- **A falling trend stays silent.** The stall watch fires on FLAT only. A fall is a
  cut, an illness or life happening, and a wave does not fix a calorie deficit.

**What this means for Daveedus.** The arrows, the stall watch, the deload advisor and
the goal date all read the same series with the same windows, so the app cannot show
an up-arrow next to a "stalled" badge. When any of them is wrong, it is wrong once,
in one place.

---

## 9. Periodization and the 4-week wave

**Moderate (periodization in general).** Varying load and reps over time beats never
varying them, in trained people. Undulating versus linear: for hypertrophy no
difference (Grgic et al. 2017, meta-analysis); for strength in trained lifters a small
edge to undulating models (Prestes et al. 2009; a 2026 meta-analysis in Frontiers in
Public Health agrees), with differences that shrink when volume is equated.

**Folk (the specific wave shape).** "Wave loading" (5 / 4 / 3, back to 6, up a step)
is coaching practice with a sound mechanism (heavy, short sets potentiate the next
set, and a fixed prescription removes the daily decision) but no study tests THIS
shape against another. Treat the shape as one reasonable way to put undulation on a
stalled lift, not as a validated protocol.

**What this means for Daveedus.** The wave is opt-in and only suggested after the
stall watch fires. `waveTarget()` prescribes, per session: base × 5, base + 1 step × 4,
base + 2 steps × 3, base × 6, then the next round starts one step higher.
`waveRecommend()` proposes a base at 85.5 % of the current-form best estimated 1RM,
which is what a five with a rep or two in reserve sits at in any load chart, rounded to
a plate. The wave ends itself, because in practice blocks run 3 to 6 weeks and never
open-ended: a new estimated 1RM best during the wave (above 0.5 %, section 7) means it
did its job, and 3 rounds without one means stop and deload or change the lift
(`waveVerdict()`). Because the direct evidence is thin, the app never starts a wave on
its own.

---

## 10. Deloads: planned versus earned

**Strong (what coaches do).** Bell et al. (2023), Delphi consensus of 21 to 34 expert
coaches, agreed a definition: "a period of reduced training stress designed to
mitigate physiological and psychological fatigue, promote recovery, and enhance
preparedness for subsequent training." Rogerson et al. (2024) surveyed 246
competitive strength and physique athletes: a deload typically lasts **6.4 ± 1.7 days**,
comes every **5.6 ± 2.3 weeks**, is planned in advance, cuts volume by reducing reps
per set and sets per week, and **keeps frequency unchanged**.

**Moderate, and it cuts the other way (whether it is needed).** Coleman et al. (2024),
the only controlled trial: trained lifters, 9 weeks, half took a full week off at the
midpoint. No difference in hypertrophy, power or endurance, and the continuous group
gained slightly MORE lower-body strength. Over a 9-week block a deload that nobody
needed carried a small cost.

**Grain of salt.** A survey tells you what athletes believe works, not what works; the
one trial tested one deload shape (a week off, not a light week) in one 9-week window.
Neither says anything about a year of training or about the joints.

**What this means for Daveedus.** Two things follow and both are in the code.
First, the manual deload is one light pass over every workout of the main program,
not a calendar week: `dlW()` scales suggested loads to a chosen 50 to 100 % (default
`DL_FACTOR` 0.6), 100 % means "same weight, half the sets", and loads under 20 kg are
only trimmed to 80 % (`DL_LIGHT_KG`, `DL_LIGHT_FLOOR`) because athletes mostly keep
isolation loads and cut volume instead. Deload sessions are tagged, and stay out of
records, PRs, ghosts and every estimated-1RM series. Second, because Coleman says an
unneeded deload costs something, the passive advisor (`dlAdvice()`) leads with
performance and uses the calendar only as a backstop: it stays quiet for the first 3
hard weeks, speaks at once when two tracked lifts are trending down, otherwise after
8 weeks of continuous training, after 6 weeks with one tired lift, or after 4 weeks
with two. "Hard weeks" (`hardWeeks()`) reset on a real break of 3 weeks or more,
because a layoff already IS a deload as far as fatigue goes. It can be snoozed, it
never starts anything, and a calendar reminder (`dlEvery`, 6 / 7 / 8 weeks) replaces it
entirely for a lifter who prefers Rogerson's planned style.

---

## 11. Layoffs: how much comes back and how fast

**Strong (short breaks).** Two to three weeks off costs a trained lifter essentially no
maximal strength. Hwang et al. (2017): trained men kept their strength gains after 2
weeks of detraining. Ogasawara et al. (2013): 6 weeks on, 3 weeks off, repeated for
24 weeks, ended with the same muscle and strength as continuous training.

**Strong (long breaks come back fast).** Halonen et al. (2024): a 10-week break in the
middle of 30 weeks of training made no difference to the final strength or muscle
size; what was lost was back within about 5 weeks of retraining, on a much faster
slope than the first time ("muscle memory", with evidence for retained myonuclei and
an epigenetic memory of training). Encarnação et al. (2022), review of 20 trials:
losses grow with time off, size before strength, and the advantage over untrained
controls persists for 16 to 24 weeks.

**Inference (why come back below what was lost).** Tendon and connective tissue
adapt on a slower clock than muscle (turnover is lower, the literature on tendon
adaptation talks in months), and a sudden load spike after a low-load period is the
classic injury window. The acute:chronic workload ratio (Gabbett) that team sports
used to quantify that spike has been sharply criticised (Impellizzeri et al. 2020: no
evidence it predicts injury, and the ratio is statistically flawed), so the app uses
the idea, not the number.

**What this means for Daveedus.** Comeback easing (`cbFactor()`) lowers only the
SUGGESTED weights after a gap on that lift and lets them climb back session by
session, because each comeback session becomes the new reference. The factors follow
the evidence above: nothing under 14 days (Hwang, Ogasawara), 0.95 at 2 weeks, 0.90
at 3, 0.85 at 4, 0.75 at 4 to 8 weeks, 0.65 at 8 to 12, 0.55 to 6 months and 0.5
beyond, each a notch under the strength the studies say is lost, for the tendon reason.
A deload pass counts as training (`lastTrainedTs()`), so a deload week never earns a
second reduction. Double progression is blocked while the factor is under 1. The
factor is a placeholder, not a cap: a lifter who feels fine types the old number.

---

## 12. Warm-ups

**Strong (do one, and make it specific).** Fradkin et al. (2010), review: warming up
improves performance in the large majority of studies. Abad et al. (2011): a general
warm-up plus a specific one raised leg-press 1RM by about 8 % over the specific
warm-up alone. Ribeiro et al. (2014): a specific warm-up improved bench and squat
performance in trained men; a general one alone did not.

**Moderate (shape).** The specific set that helps is heavy and short, near the working
load: studies of specific warm-ups use a set at 80 to 90 % of the work weight, and
coaching practice converges on 85 to 90 % for the last one. Post-activation
performance enhancement (a heavy set potentiating the next) is real but small and
individual, and a 2024 set of crossover trials found that adding a potentiation
protocol on top of a proper warm-up added nothing further. Long, high-rep ramps
fatigue rather than prime.

**What this means for Daveedus.** `warmupLoads()` builds the barbell ramp the way a
bar gets loaded and the way the evidence shapes it: the empty bar for 10, then only
plates of 10 kg and up from the lifter's own plate set; the first loaded set at one
standard plate a side (60 kg / 135 lb) whenever that is still under 70 % of the work
weight; the last set at the heaviest big-plate load at or under 90 %; and in between
just enough evenly spaced steps that no jump exceeds 20 % of the target (never more
than 4 jumps, and never a step smaller than a pair of the smallest big plate). Reps
taper 10 / 6 / 4 / 2 / 1 by ramp length (`WARM_REPS`), so the ramp ends on a short,
heavy rehearsal: 20 / 60 / 80 / 90 on the way to 100, 20 / 60 / 80 / 100 / 120 to 140,
45 / 135 / 165 / 195 lb to 225. Dumbbell and machine work uses 40 / 60 / 80 % at
6 / 4 / 2 because there is no bar to load. Warmup sets are typed W and stay out of
volume, records and every trend.

---

## 13. Technique variables the app does not track

- **Range of motion.** Full range beats short-range partials for growth (Wolf et al.
  meta-analysis), and partials in the stretched position match full range in trained
  lifters (Wolf et al. 2025). **Moderate.** Practical reading: go deep, or at least
  stretched. This is a technique note, not a number to log.
- **Tempo.** Schoenfeld et al. (2015), meta-analysis: anything from 0.5 to 8 seconds
  per rep grows muscle about equally. **Strong.** A controlled lowering is good
  practice for joints and for honest reps, not a stimulus to measure.
- **Exercise order.** Nunes et al. (2021), meta-analysis of 11 studies: identical
  hypertrophy whichever exercise comes first; the exercise done first gains the most
  strength. **Strong.**

**What this means for Daveedus.** None of these earns a field per set. The app carries
them where a lifter reads them: exercise notes on the card ("2 to 3 s lowering", "only
clean seconds count"), and the order a workout was actually performed in is saved
(`order`) and offered back next time, so the lift the owner cares about most can stay
first, which is the only order effect the evidence supports.

---

## 14. Bodyweight ladders and core work

**Moderate (bodyweight progressions build strength).** Kotarsky et al. (2018):
4 weeks of progressive push-up variations produced strength and chest-thickness gains
comparable to bench press in moderately trained men; Kikuchi and Nakazato (2017)
found the same for push-ups against low-load bench over 8 weeks. The principle is the
one from section 6: load does not matter much for growth if the set is hard; for
bodyweight lifts "harder" means a harder variation, which is what a ladder is.

**Moderate (which core exercises).** Escamilla et al. (2006, 2010), EMG on 12 to 13
abdominal exercises: the wheel roll-out and the hanging leg raise produced the highest
rectus abdominis and oblique activation of the lot, well above crunches. EMG says
which muscle works hardest, not what grows most, so this is a reasonable ranking, not
a growth study. **Weak (core work and lifting performance).** Reviews of core
training on athletic performance are mixed; nothing shows extra abs work raises a
squat.

**Folk (the ladder order and the promotion rule).** Knee raise before leg raise before
toes-to-bar is coaching consensus about leverage, not a study. "Two clean sessions at
the top of the range, then move up" is our own rule; it is the double progression of
section 1 applied to variations instead of plates, with one repeat to filter out a
lucky day.

**What this means for Daveedus.** A template slot can carry an ordered ladder
(`lvls`), and its current rung is mirrored onto the slot so the rest of the app sees a
normal exercise (`lvlApply()`). `lvlCleanSession()` says whether every planned working
set reached the top of the range; `finishWorkout()` counts two clean sessions in a row
and moves the rung up, never down on its own, and any manual move wins. Time-based
holds count seconds and are judged on total held and longest single hold. Added load
on bodyweight lifts is logged as a plus and counted into total load everywhere, so a
weighted dip and a bodyweight dip sit on one scale.

---

## 15. What not to build

- **RPE / RIR per set.** Section 3: effort matters, logging it does not make a program
  better (Hickmott 2022), and it costs a tap per set. Keep it in the exercise note.
- **A "hypertrophy zone" rep hint.** Section 6: growth is load-agnostic near failure.
  The range is a progression contract, not a style rule.
- **Automatic deloads.** Section 10: the one trial says an unneeded deload has a
  small cost. Advise from performance, never impose.
- **Automatic waves.** Section 9: the shape is folk. Suggest after a stall, let the
  owner start it.
- **1RM percentages as prescriptions.** Section 7: the estimate has a 4 % noise floor
  and the formula is off above 10 reps. Compare, do not prescribe.
- **Red for a lighter week.** Section 2 and `RESEARCH-APP.md` section 4: a lower
  volume week is often the plan and negative feedback has a known cost.
- **A tempo field, a range-of-motion field, an order coach.** Section 13.
- **An injury-risk ratio.** Section 11: the ACWR is not an injury predictor.

---

## 16. Claims with no traceable source, or a weaker one than repeated

- **"Muscles need 48 to 72 hours to recover, so train each once or twice a week."**
  Recovery time is muscle-, dose- and person-specific; the frequency evidence
  (section 4) says distribute volume however you like.
- **"Deload every 4 weeks."** Coaches average 5.6 weeks with a wide spread (Rogerson
  2024), and the only trial found no benefit at the 9-week midpoint (Coleman 2024).
- **"10 to 20 sets is the rule."** It is the band where studies land; Pelland (2025)
  shows a continuous curve with diminishing returns, no cliff at either end, and
  fractional counting changes the number.
- **"Epley / Brzycki predict your 1RM."** They match a real 1RM within a few percent
  from 2 to 10 rep sets and drift beyond; and the origin of Epley is a chart in a
  manual, not a study.
- **"Wave loading is proven."** No study tests the wave shape as such.
- **"Two weeks off and you lose it all."** Two to three weeks costs a trained lifter
  nothing measurable (section 11).
- **"You must train to failure to grow."** Similar growth at 1 to 2 RIR in trained
  people (Refalo 2024); failure adds fatigue, not muscle.
- **"Slow negatives build more muscle."** 0.5 to 8 seconds per rep grows the same
  (Schoenfeld 2015).

---

## Sources

Individual variability
- Ahtiainen et al. 2016, heterogeneity of responses in 287 people, [PubMed 26767377](https://pubmed.ncbi.nlm.nih.gov/26767377/)
- Within-individual designs for true individual responses, [PMC11825802](https://pmc.ncbi.nlm.nih.gov/articles/PMC11825802/)
- Repeated training reveals reproducible individual responses, [PMC12659766](https://pmc.ncbi.nlm.nih.gov/articles/PMC12659766/)

Overload and progression
- Plotkin et al. 2022, load vs repetition progression, [PMC9528903](https://pmc.ncbi.nlm.nih.gov/articles/PMC9528903/)
- The effectiveness of 0.5 lb increments, [PDF](https://paulogentil.com/pdf/H8.pdf)

Volume
- Schoenfeld, Ogborn, Krieger 2017, dose-response, [PubMed 27433992](https://pubmed.ncbi.nlm.nih.gov/27433992/)
- Baz-Valle et al. 2022, systematic review of volumes, [PMC8884877](https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877/)
- Schoenfeld et al. 2019, 1 / 3 / 5 sets in trained men, [PMC6303131](https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/)
- Pelland et al. 2025, dose-response meta-regressions, [Sports Medicine](https://link.springer.com/article/10.1007/s40279-025-02344-w), [preprint](https://sportrxiv.org/index.php/server/preprint/view/460)

Proximity to failure and autoregulation
- Robinson et al. 2024, proximity to failure meta-regressions, [PubMed 38970765](https://pubmed.ncbi.nlm.nih.gov/38970765/)
- Refalo et al. 2024, failure vs reps in reserve in trained people, [J Sports Sci](https://www.tandfonline.com/doi/full/10.1080/02640414.2024.2321021)
- Hickmott et al. 2022, autoregulation meta-analysis, [Sports Med Open](https://sportsmedicine-open.springeropen.com/articles/10.1186/s40798-021-00404-9)

Frequency
- Schoenfeld, Grgic, Krieger 2019, frequency and hypertrophy, [PubMed 30558493](https://pubmed.ncbi.nlm.nih.gov/30558493/)
- Grgic et al. 2018, frequency and strength, [PubMed 29470825](https://pubmed.ncbi.nlm.nih.gov/29470825/)

Rest
- Singer et al. 2024, Bayesian meta-analysis of inter-set rest, [Frontiers](https://www.frontiersin.org/journals/sports-and-active-living/articles/10.3389/fspor.2024.1429789/full)
- De Salles et al. 2009, rest interval review, [PubMed 19691365](https://pubmed.ncbi.nlm.nih.gov/19691365/)
- Stronger by Science, rest times for muscle growth (summary of Schoenfeld 2016 and later), [article](https://www.strongerbyscience.com/rest-times-for-muscle-growth/)

Load and reps
- Schoenfeld et al. 2021, repetition continuum re-examined, [PMC7927075](https://pmc.ncbi.nlm.nih.gov/articles/PMC7927075/)
- Schoenfeld et al. 2017, low vs high load meta-analysis, [PubMed 28834797](https://pubmed.ncbi.nlm.nih.gov/28834797/)

Estimated 1RM
- Grgic et al. 2020, 1RM test-retest reliability, [PMC7367986](https://pmc.ncbi.nlm.nih.gov/articles/PMC7367986/)
- Validation of Brzycki and Epley equations, [SIU](https://opensiuc.lib.siu.edu/cgi/viewcontent.cgi?article=1744&context=gs_rp)
- On the undocumented origin of the 1RM equations, [arXiv 2603.17495](https://arxiv.org/pdf/2603.17495v1.pdf)
- 1RM testing, the NSCA protocol summarised, [Science for Sport](https://www.scienceforsport.com/1rm-testing/)
- Attempt selection percentages, [StrengthLog](https://www.strengthlog.com/powerlifting-competition-attempt-calculator/), [PowerliftingToWin](https://www.powerliftingtowin.com/how-to-pick-your-attempts-at-a-powerlifting-meet/)
- How often to test a 1RM, coaching view, [Powerlifting Watch](https://www.powerliftingwatch.com/test-your-1-rep-max/)

Periodization
- Grgic et al. 2017, linear vs undulating and hypertrophy, [PMC5571788](https://pmc.ncbi.nlm.nih.gov/articles/PMC5571788/)
- Prestes et al. 2009, linear vs daily undulating in trained men, [PubMed 19910831](https://pubmed.ncbi.nlm.nih.gov/19910831/)
- 2026 meta-analysis, linear vs undulating, [Frontiers](https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2026.1707627/full)

Deloads
- Bell et al. 2023, Delphi consensus on deloading, [PMC10511399](https://pmc.ncbi.nlm.nih.gov/articles/PMC10511399/)
- Rogerson et al. 2024, deloading practices survey, [Sports Med Open](https://link.springer.com/article/10.1186/s40798-024-00691-y)
- Coleman et al. 2024, one-week deload trial, [PeerJ](https://peerj.com/articles/16777/)
- Bell et al. 2025, a practical approach to deloading, [PDF](https://shura.shu.ac.uk/35313/3/Bell-APracticalApproach(AM).pdf)

Detraining and comeback
- Hwang et al. 2017, strength kept after 2 weeks off, [PubMed 28328712](https://pubmed.ncbi.nlm.nih.gov/28328712/)
- Ogasawara et al. 2013, periodic vs continuous training, [Semantic Scholar](https://www.semanticscholar.org/paper/85af377c45a71b31ecc8d67aebb796f575d9dfc0)
- Halonen et al. 2024, a 10-week break, [Scand J Med Sci Sports](https://onlinelibrary.wiley.com/doi/10.1111/sms.14739)
- Encarnação et al. 2022, detraining systematic review, [MDPI](https://www.mdpi.com/2813-0413/1/1/1)
- Bosquet et al. 2013, training cessation meta-analysis, [Wiley](https://onlinelibrary.wiley.com/doi/abs/10.1111/sms.12047)
- Tendon and connective tissue adaptation timelines, [PubMed 18661335](https://pubmed.ncbi.nlm.nih.gov/18661335/)
- Impellizzeri et al. 2020, the ACWR critique, [PubMed 32502973](https://pubmed.ncbi.nlm.nih.gov/32502973/)
- Stronger by Science, a guide to detraining, [article](https://www.strongerbyscience.com/detraining/)

Warm-ups
- Fradkin et al. 2010, warm-up and performance review, [PubMed 19996770](https://pubmed.ncbi.nlm.nih.gov/19996770/)
- Abad et al. 2011, general plus specific warm-up and 1RM, [PubMed 21544000](https://pubmed.ncbi.nlm.nih.gov/21544000/)
- Ribeiro et al. 2014, specific warm-up in trained men, [PubMed 25153744](https://pubmed.ncbi.nlm.nih.gov/25153744/)
- Specific warm-up and bar velocity, [PMC7558980](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7558980/)
- Potentiation protocols add nothing beyond a proper warm-up, [Frontiers 2024](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2024.1447421/full)
- Xu et al. 2025, optimizing post-activation performance enhancement, [Sports Medicine](https://link.springer.com/article/10.1007/s40279-024-02170-6)

Technique
- Wolf et al. 2025, lengthened partials vs full range, [PMC11829627](https://pmc.ncbi.nlm.nih.gov/articles/PMC11829627/)
- Longer muscle length training review, [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2666337625000332)
- Schoenfeld et al. 2015, repetition duration, [PubMed 25601394](https://pubmed.ncbi.nlm.nih.gov/25601394/)
- Nunes et al. 2021, exercise order, [PubMed 32077380](https://pubmed.ncbi.nlm.nih.gov/32077380/)

Bodyweight and core
- Kotarsky et al. 2018, progressive push-up vs bench, [PubMed 29466268](https://pubmed.ncbi.nlm.nih.gov/29466268/)
- Kikuchi and Nakazato 2017, push-up vs low-load bench, [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1728869X17301028)
- Escamilla et al. 2006 and 2010, EMG of abdominal exercises, summarised at [The Barbell](https://thebarbell.com/science-says-the-best-and-worst-ab-exercises/)
- Core training and performance, systematic review with meta-analysis, [PMC10588579](https://pmc.ncbi.nlm.nih.gov/articles/PMC10588579/)
