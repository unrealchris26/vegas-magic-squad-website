---
workflow: general-video
flow: automation
storyboard: no
message: "Real magic, at real events - a calm, cinematic backdrop the headline can sit on"
destination: website-hero-background
aspect: 1920x1080 + 1080x1920
language: none
audience: event planners and hosts visiting magicsquad.vegas
length: 16s seamless loop
---

## Intent

A looping background video for the magicsquad.vegas hero. It sits BEHIND the
live HTML headline and buttons, so it has to be atmospheric, cinematic and calm
enough that text on top stays readable: "a luxury Las Vegas show trailer slowed
right down, not a busy promo". Built only from real event photos.

The first cut (5 shots, 15s, from the site's own photo library) shipped first,
then was replaced by this 8-shot cut built from the client's chosen frames.
The first cut's site files are kept in output/v1-5shot-site/ (ignored by git).

## Assets

The client's own 1920x1080 frames, from "For Hyperframes/" (1.jpg-8.jpg),
copied to assets/photos/f1-f8.jpg. Film order and what each shows (the spec
lives in tools/build.py SHOTS):

1. f4 - Kent, back to us, the room
2. f6 - Kent on stage, arms out (match dissolve from shot 1)
3. f7 - Dream, cards at the table
4. f3 - Kent and a guest, arms out
5. f5 - Brandon, a reception
6. f2 - the gasp, rooftop
7. f1 - Dream, rooftop group
8. f8 - trade-show crowd

The first cut's source photos are in assets/photos-v1/.

## Customizations

- One grade for all shots: night-blue shadows, gold highlights, lifted blacks, rich skin, stage-spotlight contrast; red only where the photo already has it. Built as one shared media-treatment payload (tools/grade/look-canonical.json) plus a per-shot exposure trim (SHOTS in tools/build.py), BAKED into assets/graded/ by tools/bake.py using HyperFrames' own grading engine. (Applied at runtime, the engine only graded the first clip - later clips start hidden and were never treated.)
- A new image every 2s, 0.8s transitions centred on each boundary. Moves: slow push-ins (1 -> 1.06 toward the subject), two lateral drifts (shots 3 and 6).
- Transitions, by arrival: dissolve, gold light leak, smoke wipe, dissolve, gold light leak, dissolve, smoke wipe; then shot 1's opening state fades in 14.8-15.6 and holds to 16.0 (the loop seam).
- Atmosphere: drifting cool and warm haze, sparse gold dust with some bokeh, a swaying spotlight cone, film grain. All seeded, all on the 16s period.
- Text-safe: a --night scrim and soft vignette over the frame; mobile crops keep subjects in the upper half.
- Outputs: hero-desktop.mp4/.webm, hero-mobile.mp4/.webm, two posters, hero-embed.html, hero-shots.jpg contact sheet, qa.txt.

## Notes

- Real people: never generate, add, replace or morph faces, hands or bodies. Depth effects move people as one rigid cutout layer.
- No text, logo or buttons baked in; the website renders those.
- Every move eases sine.inOut; nothing snappy.
- Targets: desktop mp4 <= 4 MB, webm <= 3 MB; mobile mp4 <= 3 MB, webm <= 2.5 MB. Never below 1600px wide on desktop.
- Cream #fdf6ea at 64px bold over the darkest-required zone must pass WCAG AA across sampled frames (tools/deliver.py), and the site's real headline and lede must pass over the real film on the page (tools/site-contrast.cjs + .py, every 1s of the loop).
- Delivery into the site is a copy: output/hero-*.{mp4,webm} -> ../video/, output/hero-poster-*.jpg -> ../images/site/. deliver.py does not do it.
