---
name: Vegas Magic Squad
description: A 1930s deco theatre marquee and the printed bill beneath it, alternating as two materials of one world.
colors:
  night: "#07090f"
  night-2: "#0d1119"
  night-3: "#161c29"
  night-tx: "#efe9dd"
  night-tx2: "#a89c89"
  gold: "#c8a850"
  gold-hi: "#e6d193"
  gold-deep: "#8a6d2c"
  gold-ink: "#2a2008"
  bill: "#f2ece0"
  bill-2: "#e6ddcb"
  ink: "#14100c"
  ink-2: "#574c3c"
  red: "#a8141d"
  red-hi: "#c4212b"
  red-fg: "#fdf6ea"
  error-tx: "#f08a90"
typography:
  display:
    fontFamily: "Delauney, Futura, Century Gothic, system-ui, sans-serif"
    fontSize: "clamp(2.55rem, 9.2vw, 8.4rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Delauney, Futura, Century Gothic, system-ui, sans-serif"
    fontSize: "clamp(1.85rem, 5.4vw, 4.4rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.01em"
  title:
    fontFamily: "Delauney, Futura, Century Gothic, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3.4vw, 2.9rem)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.01em"
  body:
    fontFamily: "Libre Franklin, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(15px, 0.35vw + 14px, 17px)"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  lede:
    fontFamily: "Libre Franklin, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(15px, 1.25vw, 18.5px)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Libre Franklin, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.2em"
  billing:
    fontFamily: "Libre Franklin, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(11px, 0.92vw, 12px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.24em"
rounded:
  square: "0"
  hairline-focus: "1px"
  bulb: "50%"
spacing:
  gutter: "clamp(20px, 5vw, 72px)"
  section: "clamp(64px, 9vw, 140px)"
  section-tight: "clamp(46px, 5.6vw, 88px)"
  trim: "clamp(34px, 7.9vw, 150px)"
  heading-gap: "clamp(28px, 4vw, 56px)"
  field-gap: "clamp(14px, 1.6vw, 22px)"
  bulb-gap: "clamp(11px, 1.5vw, 20px)"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.red-fg}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.92em 1.5em"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.red-hi}"
    textColor: "{colors.red-fg}"
  button-primary-large:
    backgroundColor: "{colors.red}"
    textColor: "{colors.red-fg}"
    padding: "1.08em 1.9em"
    height: "54px"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.square}"
    padding: "0.92em 1.5em"
    height: "46px"
  button-gold-hover:
    backgroundColor: "{colors.gold-hi}"
    textColor: "{colors.gold-ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.gold-hi}"
    rounded: "{rounded.square}"
    padding: "0.92em 1.5em"
    height: "46px"
  button-ghost-hover:
    backgroundColor: "rgba(200,168,80,.13)"
    textColor: "{colors.gold-hi}"
  input:
    backgroundColor: "{colors.night-2}"
    textColor: "{colors.night-tx}"
    rounded: "{rounded.square}"
    padding: "13px 15px"
    width: "100%"
  input-focus:
    backgroundColor: "{colors.night-3}"
    textColor: "{colors.night-tx}"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.night-tx2}"
    padding: "7px 0"
  nav-link-hover:
    backgroundColor: "transparent"
    textColor: "{colors.gold-hi}"
  placeholder-flag:
    backgroundColor: "transparent"
    textColor: "{colors.gold-hi}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "6px 10px"
  card-bay:
    backgroundColor: "{colors.night-2}"
    textColor: "{colors.night-tx}"
    rounded: "{rounded.square}"
    padding: "clamp(18px, 1.9vw, 30px)"
  quote-card:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "clamp(22px, 2.6vw, 34px)"
---

# Design System: Vegas Magic Squad

## Overview

**Creative North Star: "The Marquee and the Bill"**

Two materials from one 1930s theatre, alternating down the page. Night is the street outside and the house during the show: a blue-black ground with a gold-hairline marquee frame and real bulbs chasing round it. Bill is the handbill printed for that engagement: warm stock, letterpress ink, heavy rule pairs, and a single second ink held back for the one action that matters. Nothing in this world is decorative for its own sake; every device is something a marquee or a printed bill actually does.

The page is the billing. Rank is carried by type size, not by badges or ornament, so the hero sets the company name at marquee scale and the three performers on one rule-separated tier in decreasing size. Density is high on the bill (rows separated by rules, metadata set in small caps) and open on night (photography at full bleed, type sitting on its lower edge). Sections butt into each other on a shallow guillotine diagonal cut in one direction only, so the alternation reads as one continuous printed object rather than a stack of blocks.

The build refuses the arrangement magic acts ship by default: violet smoke ground, glowing script logo, drifting sparkles, three identical performer cards, one floating BOOK NOW. It also refuses softness generally. There are no rounded corners, no drop shadows carrying elevation, no gradients used as surface, and no glow that is not a bulb.

**Key Characteristics:**
- Two grounds, alternating: night and bill, joined by guillotine trims.
- Gold is a brand constraint sampled from the client logo, not a palette choice.
- One second ink, bound to the primary action alone.
- Square corners everywhere; gold hairlines, never shadows, carry elevation.
- One authored motion grammar: the marquee chase, made of real bulb elements.
- Display type is unicase deco caps, ASCII only, by the face's own glyph limits.

## Colors

A two-ground palette with one metal and one second ink: night and bill are the materials, gold is the light, red is the single printed accent.

### Primary
- **Marquee Gold** (`gold`): The house metal, sampled from the client's existing logo raster and therefore fixed. It carries every hairline border, every rule, every icon stroke, the nav brand, the small-caps billing labels, the scrollbar thumb and the selection highlight. Gold is structure, not decoration.
- **Filament Gold** (`gold-hi`): The lit end of the ramp. Bulb bodies, display headings on night, focus outlines, hover states on gold surfaces, placeholder-flag text.
- **Deep Gold** (`gold-deep`): The unlit end. Resting hairlines that should recede, list-marker dashes, the face-off split beam, dashed placeholder borders on night, the scrollbar thumb at rest.
- **Gold Ink** (`gold-ink`): The dark brown-black that sits on gold. Text on gold buttons, on the skip link, and on the selection highlight.

### Secondary
- **Second Ink Red** (`red`): The second colour of a two-colour letterpress bill. It appears on the primary action and nowhere else. **Hover Red** (`red-hi`) is its pressed state and also draws the invalid-field border and underline, which is the only place red appears outside a button.
- **Bill White** (`red-fg`): The warm off-white that sits on red; never used as a ground.

### Neutral
- **Night** (`night`): The page ground for the hero, the face-off, the room and the booking section. Also the scrollbar track and the base of every photographic scrim.
- **Night Riser / Night Lift** (`night-2`, `night-3`): One and two steps up from the ground. `night-2` is the line-up board and footer ground and the resting input fill; `night-3` is the focused input fill only.
- **House Light / House Dim** (`night-tx`, `night-tx2`): Body text and secondary text on night. `night-tx2` is nav links at rest, captions, sub-copy and footer text.
- **Bill Stock** (`bill`): The printed ground for the formats, line-up and testimonial sections. **Bill Shade** (`bill-2`) is its one step down.
- **Letterpress Ink / Faded Ink** (`ink`, `ink-2`): Headings and body on bill, with `ink-2` for secondary rows, metadata values and captions.
- **Alarm** (`error-tx`): Inline validation text and the failed-send note, on night only.

### Named Rules
**The Second Ink Rule.** Red exists in exactly one styling rule, the primary button, and belongs to the primary action alone. It is never a heading colour, never a rule, never a badge, never a hover tint, never a decorative flourish. When a "flag this" need arose in the build, the flags were deliberately moved off red onto a dashed gold/ink annotation device so this binding would hold. A screen with two red things on it is broken.

**The Sampled Gold Rule.** The house gold is taken from the logo raster and is not open to adjustment. New surfaces pick from the four-step gold ramp; they do not introduce a fifth gold, a brass, or a warm yellow.

**The Two Grounds Rule.** Every section sits on night or on bill. There is no third ground, no card-on-card tinting, and no translucent panel floating over a photograph. Depth on night is the two riser steps and nothing else.

## Typography

**Display Font:** Delauney (self-hosted from `fonts/`, with Futura and Century Gothic as fallback)
**Body Font:** Libre Franklin variable, weights 400-800 (self-hosted, with system-ui fallback)

**Character:** Delauney is a unicase art-deco face: lowercase renders as small caps, so display copy always reads as one even band of caps regardless of how it is typed. Libre Franklin is the bill's fine print, tightly tracked in small caps at label sizes and plain at reading sizes. The pairing is a marquee board over a printing-press gutter.

### Hierarchy
- **Display** (400, line-height .84): The company name at marquee scale in the hero, in filament gold, capped at 15ch.
- **Headline** (400, line-height .9): Section headings, capped at 18ch and text-balanced. Ink on bill, filament gold on night via the gold variant; one larger step (clamp 2.1rem to 5.6rem) exists for the full-bleed proof section.
- **Title** (400, line-height .92): Format names, performer names, face-off room headings, pull quotes and testimonial bodies. Sizes step down per context (performer bays clamp 1.28rem to 2.1rem, face-off clamp 1.9rem to 3.6rem, booking sidebar clamp 1.1rem to 1.55rem), but always Delauney caps on a line-height under 1.2.
- **Body** (400, line-height 1.62): All running copy. Measure is capped explicitly per context: 46ch hero lede, 62ch format bodies, 56ch and 52ch for section notes, 34ch footer.
- **Label** (800, 11px, .2em-.24em tracking, uppercase): Field labels, metadata terms, billing lines, captions, placeholder flags. The bill's fine print voice.
- **Billing** (700, .24em tracking, uppercase): The engagement line above the hero lede and the performer billing designations on the board.

### Named Rules
**The ASCII Rule.** Delauney carries 112 glyphs: full ASCII, but no accented characters and no curly quotes. Display copy is therefore written in plain ASCII with straight apostrophes. Any character outside ASCII must be set in Libre Franklin or not set at all. Test: run the display string through an ASCII-only filter; if anything drops, it cannot go in Delauney.

**The Unicase Rule.** Delauney has one case. Never fake a capital by size, never pair it with a lowercase display face, and never apply `text-transform: capitalize` to it; every display element already sets uppercase and that is the face's only mode.

**The Rank-By-Size Rule.** Billing hierarchy is expressed by type size alone. The three hero tiers step down (2.42rem, 1.98rem, 1.62rem at full width) and the middle bay of the line-up board is given the wider column instead of a badge. No "featured" chips, no stars, no ribbons.

## Layout

A single centred measure of 1320px with an inline gutter of the gutter token, applied by one wrapper class. Vertical rhythm is the section token as block padding on every ordinary section, with the face-off running tighter on the section-tight token.

Sections alternate ground and are joined by **guillotine trims**: the trim clips the section with `polygon(0 var(--trim), 100% 0, 100% 100%, 0 100%)`, pulls itself up by the negative trim, and adds the same amount back as top padding. Because the trim is `clamp(34px, 7.9vw, 150px)`, the cut holds a near-constant angle of about 4.5 degrees at every viewport width. The cut runs one direction only, high on the right.

Grids in use: format rows are 7fr / 5fr (main copy beside a metadata column), the line-up board is 1fr / 1.16fr / 1fr with the lead bay in the wider centre, the booking area is 1.5fr / 1fr with the form leading, the footer is 1.5fr / 1fr / auto, and the testimonial slots are three equal columns. The face-off is a single absolutely-positioned stack: the corporate side is the base plate and the private side is clipped over it with `polygon(57% 0, 100% 0, 100% 100%, 43% 100%)`; source order matches visual order.

Responsive steps are at 1080px (booking and footer collapse to one and two columns; the booking sidebar swaps its left border for a top border), 900px (nav becomes a disclosure panel and withdraws its inline CTA, the board stacks, quotes go single-column, the face-off drops its clip-path and becomes an ordered stack with a hairline between the two sides), 720px (format rows stack and their metadata becomes a wrapping row, the hero marquee inset tightens to 8px), and 460px (hero billing tiers become full-width rows separated by hairlines, hero buttons go full width).

### Named Rules
**The Trim Clearance Rule.** Any section that sets its own `padding-top` must add `var(--trim)` back, or the guillotine cut eats its heading. The face-off section is the reference implementation: `padding-top: calc(clamp(46px,5.6vw,88px) + var(--trim))`.

## Elevation & Depth

This system has no elevation shadows. Depth is carried by three things and nothing else: **gold hairlines** at varying alpha (`rgba(200,168,80,.18)` through `.42`, plus solid deep gold), **ground steps** on night (night to night-2 to night-3), and **photographic scrims** (multi-stop linear gradients of the night colour laid over full-bleed imagery). A panel does not float; it is drawn.

The only `box-shadow` values in the build are non-elevation: the bulb glow inside the chase keyframes, and a one-pixel underline on focused and invalid inputs (`0 1px 0 0`), which is a rule, not a lift. Hover feedback is a 1px translate on buttons and a 1.035 image scale in the line-up bays, never a raised shadow.

### Shadow Vocabulary
- **Filament glow** (`0 0 13px 3px rgba(230,209,147,.92), 0 0 28px 9px rgba(200,168,80,.44)` at the chase peak, easing to `0 0 4px 0 rgba(230,209,147,.3)` at rest): belongs to bulbs only. It is light, not elevation, and may not be borrowed to lift a panel.
- **Focus / error underline** (`0 1px 0 0 var(--gold)`, or the hover red when invalid): the input's own drawn rule.

### Named Rules
**The Hairline Rule.** A surface is separated from its neighbour by a 1px gold line (or a 1px/2px ink line on bill), never by a shadow, never by a radius, never by a tint alone. When something needs to read as lifted, step the ground, not the shadow.

## Shapes

Square corners, everywhere. `border-radius: 0` is set explicitly on buttons and inputs so no user-agent rounding survives. The only curves in the build are literal circles: the chase bulbs and the submit spinner (the bulb token), plus a 1px softening on the focus outline. There is no radius scale to pick from because there is nothing to pick.

The recurring geometry is the cut and the rule. Guillotine diagonals join sections; a heavy **rule pair** (a 2px gold-to-transparent gradient over a 1px 60%-opacity repeat, ink-coloured on bill) opens a billing block; 1px hairlines divide bays, format rows, billing tiers and metadata items; and short 9-10px dashes stand in for list bullets. Borders are 1px except the button stroke (1.5px), the format table's top rule (2px) and the leading rule of a pair (2px).

## Components

### Buttons
- **Shape:** Hard square, 1.5px stroke, 46px minimum height (54px large), uppercase Libre Franklin at 700 with .2em tracking, sized `clamp(11px, .9vw, 12.5px)`.
- **Primary (red):** The second ink on the enquiry action only. Hover deepens to the hover red. Large and full-width variants exist for the hero and the form's submit.
- **Gold:** A solid gold plate with gold-ink text, used for the two face-off routing actions. Hover lifts to filament gold.
- **Ghost:** Transparent with a deep-gold stroke and filament-gold text, the hero's secondary action. Hover washes in `rgba(200,168,80,.13)` and brightens the stroke to full gold.
- **States:** All variants translate -1px on hover and +1px on active, transitioned on `cubic-bezier(.16,1,.3,1)`. Disabled drops to 50% opacity and cancels the translate. The submit carries a 15px ring spinner revealed by a sending class.

### Inputs / Fields
- **Style:** Full-width, square, night-2 fill with a `rgba(200,168,80,.3)` hairline, 13px/15px padding, 15.5px Libre Franklin with tabular numerals. Labels sit above in the 11px/800 gold label voice with a bordered "required" chip beside them.
- **Hover:** Hairline strengthens to `rgba(200,168,80,.55)`.
- **Focus:** Fill steps to night-3, border goes solid gold, and a 1px gold underline is drawn. The native outline is suppressed here only because the field draws its own equivalent.
- **Error:** Hover-red border and underline driven by `aria-invalid`, with inline alarm-coloured text in a live region beneath. The select uses a custom gold chevron SVG; the date field recolours its native picker indicator with a filter so it reads gold.

### Navigation
- **Style:** Fixed 72px bar, `rgba(7,9,15,.9)` with a 10px backdrop blur and a gold hairline beneath. The brand lockup is the logo raster plus two lines of Delauney at 13px in gold.
- **Links:** 11.5px/600 uppercase at .2em tracking in night-dim, over a transparent 1.5px bottom border that fills gold on hover as the text goes filament gold.
- **Mobile (900px and below):** Links become a full-width fixed panel under the bar, toggled by a three-bar button that folds into an X; the inline red CTA is withdrawn so the hero's action stays the only one on screen.

### Cards / Containers
- **Line-up board:** One bordered container, not three cards. A single night-2 plate with a gold hairline, divided into three bays by internal hairlines; the picture wells are a fixed `clamp(340px,36vw,500px)` so all three captions start on the same line. Images sit at `saturate(.88) contrast(1.04)` and warm to full saturation with a 1.035 scale on hover.
- **Testimonial slots:** 1px ink-bordered boxes on bill, with the empty state described under the placeholder flag.

### The Marquee Chase (signature)
Real bulb elements, 9px, filament gold, animated on a 2.6s linear chase keyframe whose delay is set per bulb by script. On the hero frame the four edge rails are concatenated clockwise (top, right, bottom reversed, left reversed) into one ring, so a single pulse walks the entire marquee rather than four rails pulsing independently. The face-off strip is rotated to the measured angle of the diagonal cut, and the footer carries its own rail along its top edge. **Bulb counts are derived** at layout time from the measured bulb width and the computed gap, clamped to what actually fits the rail (minimum 3), so a run can never overrun its rail when the bulb size changes. Under `prefers-reduced-motion` the bulbs hold steady-lit at .92 opacity with a soft resting glow: the marquee stays on, it just stops travelling.

### The Placeholder Flag (signature)
The honesty device. Any deliberately unfilled slot is marked with a 1px **dashed** border and no fill: deep-gold dashes with filament-gold text on night, ink dashes with faded-ink text on bill. It appears on the unwired form, the contact block, the social row, and inside each empty testimonial slot (which additionally takes a dashed border and a -45deg 9px/18px hatch at 3.5% ink). The flag is never red, never filled, and never dressed to look finished; it sizes to what it annotates, not to its column.

### Browser Surfaces
Selection is gold with gold-ink text; the focus ring is a 2px filament-gold outline at 3px offset; the scrollbar is an 11px night track with a deep-gold thumb that brightens to gold on hover; the skip link is a gold plate that drops in from off-canvas on focus. These are part of the world, not defaults.

## Do's and Don'ts

### Do:
- **Do** put every new section on one of the two grounds and join it to its neighbour with the trim, adding `var(--trim)` back to any custom `padding-top`.
- **Do** carry separation and depth on gold hairlines and ground steps (night, night-2, night-3).
- **Do** set all display type in Delauney uppercase, in plain ASCII with straight quotes.
- **Do** keep the second ink on the primary action alone; mark anything provisional with the dashed placeholder flag instead.
- **Do** derive repeated ornament counts (bulbs, rails) from measured geometry rather than a fixed step, so a run always fits its rail.
- **Do** keep the reduced-motion path lit: the marquee stops travelling, it does not go dark.
- **Do** cap reading measure explicitly (46-62ch for copy, 15-26ch for display).

### Don't:
- **Don't** use red for anything but the primary action, or introduce a second accent colour.
- **Don't** add a corner radius. Curves belong only to things that are literally round, like bulbs and spinners.
- **Don't** use a shadow to lift a surface; a shadow in this world is a filament glow or a 1px underline, nothing else.
- **Don't** invent a gold outside the four-step ramp, or re-sample the logo gold.
- **Don't** set display copy that needs accents, curly quotes or any non-ASCII character in Delauney.
- **Don't** turn the line-up into three equal cards, or rank performers with badges, stars or ribbons instead of type size.
- **Don't** run a second guillotine diagonal in the opposite direction; the cut has one angle and one direction.
- **Don't** dress a placeholder to look finished; unfilled slots ship dashed and labelled.
