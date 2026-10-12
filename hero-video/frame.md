# frame.md - hero background loop

Concept: a luxury Las Vegas show trailer slowed right down. Real photographs,
graded into one night-and-gold world, under drifting haze and slow gold dust.
It is a backdrop: the headline is the subject, so the frame stays quiet where
the type sits.

## Tokens (from magicsquad.vegas)

| token        | hex     | use                                              |
| ------------ | ------- | ------------------------------------------------ |
| --night      | #07090f | base fill, text-safe gradient, black point       |
| --night-2    | #0d1119 | haze shadow tint                                 |
| --night-3    | #161c29 | cool haze body                                   |
| --gold       | #c8a850 | dust, light sweep, leak body                     |
| --gold-hi    | #e6d193 | dust cores, spotlight, leak hot spot             |
| --gold-deep  | #8a6d2c | warm haze                                        |
| --red        | #a8141d | never added; survives only where photographed    |
| --cream      | #fdf6ea | the live headline colour the frame must carry    |

No type is rendered in the video.

## Layout

- Desktop 1920x1080: left 55% is the headline zone - darkest, least motion.
  Performers and active elements sit right. Pushes anchor at left-centre so
  the zone barely moves.
- Mobile 1080x1920: bottom 45% is the headline zone. Subjects in the upper
  half; pushes anchor at bottom-centre.

## Motion

One slow move per shot, ease sine.inOut everywhere. Atmosphere runs on the
15s loop period so the last frame flows into the first.
