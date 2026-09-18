# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS/JS, no build step. Confirmed by the user when offered the choice between plain static, a framework, and a delegated recommendation. No deploy target was named, so nothing constrains the answer further. The site must open correctly from the filesystem and drop onto any static host, which rules out npm-dependent tooling and bare-module imports.

## Users

Two primary buyers, both of whom arrive already looking for entertainment and leave the page either having enquired or not:

- **Corporate event planners and executive assistants** booking entertainment for a company party, conference reception, product launch, trade-show booth, or holiday dinner. They are risk-averse, buying on behalf of someone else, and judged on whether the room worked. They need to believe the act is professional, insurable, and will not embarrass them.
- **Private hosts** booking a wedding reception, milestone birthday, or house party. They buy on feel and on whether guests will talk about it afterwards.

Both audiences evaluate on a phone as often as a desktop, frequently while doing something else, and both convert through the same single enquiry form.

## Product Purpose

Vegas Magic Squad is an ensemble of three Las Vegas magicians who perform together or individually at corporate events and private parties. The site is the only sales surface: its job is to convert an interested planner or host into a booking enquiry. Success is a submitted enquiry with enough detail (date, event type, headcount, venue) that the squad can quote without a round trip.

## Positioning

Three named specialists with genuinely distinct disciplines, bookable as an ensemble or individually, rather than one magician with a generic act or an agency roster of interchangeable performers. The line-up itself is the differentiator: a card specialist, a mentalist, and a classical magician cover close-up strolling work, stage work, and one-to-one table work within a single booking.

## Operating Context

Work happens inside someone else's event, on someone else's schedule, in rooms the squad does not control: banquet halls, hotel ballrooms, conference receptions, private homes. Two performance formats recur and should be treated as factual:

- **Strolling / close-up:** performers move between tables and groups during a reception or dinner.
- **Stage / parlour:** a seated audience watching a set.

Planners typically evaluate several entertainment options at once and make contact well before the event date.

## Capabilities and Constraints

**The line-up (confirmed, and the spelling is binding):**

> Corrected 2026-09-17: this file previously recorded the card specialist as
> "Brandon Well". The user confirmed the correct name is **Brandon Williams**,
> which matches the portrait supplied as "THE CARD SHARK Brandon Williams
> Instagram Size.jpg". All site copy, alt text and meta descriptions were
> updated to match.

| Performer | Billing | Discipline |
|---|---|---|
| Brandon Williams | The Card Shark | Card work and sleight of hand |
| Kent Axell | The Mentalist | Mentalism and mind-reading |
| Dream Upright | The Magician | Classical magic and illusion |

**Services in scope:** corporate events and private parties.

**Explicitly out of scope:** residency shows. The user removed residency from the page after it appeared in the original brief; there is no venue, schedule, or ticket link to point at, so the page must make no residency claim.

**Booking mechanism:** a single inline enquiry form with client-side validation and a placeholder submit handler, clearly marked in code for the user to swap for a real endpoint. There is no backend, no payment, no calendar integration, and no live availability. The page must never imply a confirmed booking, only a submitted enquiry.

**Undecided / not yet supplied:** pricing, package tiers, travel radius, insurance and licensing details, real client list, real contact details.

## Brand Commitments

- **Name:** Vegas Magic Squad.
- **Logo:** `images/VMS-LOGO-PNG.png`, a gold embossed badge lockup reading "Vegas ★ Magic Squad" with a spade-and-moustache motif. Transparent background, 1752x2180, portrait-stacked. Gold is therefore an established brand colour and not a free choice.
- **Display typeface:** `fonts/DelauneyRegular-BWAdB.otf`, supplied by the user and binding for headline type. A TTF of the same face sits alongside it at `fonts/DelauneyRegular-8MArM.ttf`. Glyph coverage is unverified and the OTF is only 10KB, so the build must confirm what characters exist before setting copy in it.
- **Layout reference:** the user supplied `Website Reference.jpg` for layout DNA only, specifically diagonal section cuts, a split-composition hero, alternating dark and light rhythm, oversized cinematic type, and a dual-CTA face-off mechanic. The reference is a Marvel Civil War fansite; none of its names, characters, marks, or copy may appear anywhere in the build.

## Evidence on Hand

**Real photography, all in `images/`:**

- `Hero Section.png` (1763x892): the three performers together against dark teal smoke with flying playing cards. User-designated hero background.
- `brandon-portrait-1.png` (466x984, alpha): Brandon Williams, dark suit, bar interior.
- `ChatGPT Image Sep 15, 2026, 09_56_12 AM.png` (1024x1536, alpha): Kent Axell, purple plaid jacket, arms open, spotlit.
- `dream-portrait.png` (488x1106, alpha): Dream Upright, bowler hat, performing linking rings.
- `DSC01124-1-scaled.jpg` (2560x1440): a real audience on its feet applauding at a holiday event. The single strongest piece of proof on hand.
- Four square strolling-magic shots at corporate events, plus three close-up performance and portrait shots.

**Real first-party copy** exists in the image filenames, drawn from the squad's own social captions, including Brandon Williams's line "It is within our suspension of disbelief where mystery lies and magic begins to happen." These are the performers' own words and may be used as such.

**Absences that must not be fabricated:** there are no client testimonials, no named corporate clients, no press quotes, no awards, no audience or booking numbers, and no pricing. The testimonial section ships with clearly-marked placeholders for the user to replace. Contact details (booking email, phone, Instagram) are likewise placeholders pending real values. One venue, the Ahern Hotel, appears in a photo filename but was not confirmed for publication and must not be claimed on the page.

## Product Principles

1. **One conversion, one form.** Every path through the page ends at the same enquiry form. Multiple CTAs may differ in framing but must not fragment into competing destinations.
2. **The photography is the proof.** With no testimonials or client list, credibility rests on real images of real rooms reacting. Give them scale rather than burying them in cards.
3. **Three specialists, not three cards.** The line-up is the product's actual argument, so the performers must be presented as distinct people with distinct disciplines, not as an interchangeable grid.
4. **Claim nothing that is not supplied.** No invented clients, quotes, numbers, venues, prices, or residency. Placeholders ship visibly marked rather than dressed up as real.
5. **Answer the planner's questions.** Format, group size, and event type are what a buyer needs before enquiring, and the page owes them plainly.

## Accessibility & Inclusion

No product-specific standard was established. The build follows the ordinary floor: WCAG AA contrast across the page's dark and light passages, full keyboard operation of the nav and the enquiry form, labelled inputs with inline error text, and a `prefers-reduced-motion` path for every scroll and hover effect.
