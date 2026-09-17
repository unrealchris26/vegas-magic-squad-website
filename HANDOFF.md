# Vegas Magic Squad — before you launch

Everything on the site works right now. This is the short list of things that are
deliberately fake and must be swapped for real values before the site goes public.
Nothing invented has been dressed up to look real, so each item below is visibly
marked on the page itself as well as in the code.

---

## 1. Hook the booking form up to something

Right now the form validates properly and shows its sending, success and error
states, but **nothing is transmitted anywhere**. Enquiries are not reaching you.

Open `script.js` and find the block marked:

```
PLACEHOLDER SUBMIT HANDLER  --  REPLACE BEFORE LAUNCH
```

The comment directly above `sendEnquiry()` contains a working Formspree example you
can paste in. Netlify Forms, Basin, Getform and a custom endpoint all follow the same
shape: POST the payload, throw on a non-ok response.

Two more things to change at the same time, so the page stops telling the truth about
being unwired once it no longer is:

- In `script.js`, the success message currently reads "Form checks out, but it is not
  connected yet, so nothing was sent." Replace it with a real confirmation.
- In `index.html`, delete the red banner above the submit button that reads
  "Not connected yet. Enquiries are not delivered until the form is wired up."
  (`<p class="placeholder-flag placeholder-flag--wide">`).

## 2. Replace the contact details

Both are invented. They appear twice each.

| What | Where | Current placeholder |
|---|---|---|
| Booking email | `index.html`, booking section and the error message in `script.js` | `booking@vegasmagicsquad.com` |
| Phone | `index.html`, booking section | `(702) 555-0147` |

The page carries a red "Email and phone above are placeholders" flag next to them.
**Delete that flag** (`<p class="placeholder-flag">`) once the real details are in.

## 3. Point the social links somewhere

The four icons in the footer are real Instagram, Facebook, YouTube and TikTok marks,
but every `href` is `#`. Search `index.html` for:

```
TODO BEFORE LAUNCH: point these at the real profiles.
```

If you are not on one of those platforms, delete that `<a>` entirely rather than
leaving a dead link. There is a red "Social links are placeholders" flag under the
icons (`<p class="foot__flag">`) — delete it once the links are real.

## 4. Add three real client quotes

The "What the room said" section ships with three visibly empty slots, hatched and
tagged "Awaiting a real quote". This was deliberate: no fake testimonials were
written. Each slot needs a quote of three lines or fewer, a name, and a role or
company.

To fill one, open `index.html`, find the `<li class="quote is-empty">`, then:

1. replace the quote text,
2. fill in the `<b>` name and the `<span>` role,
3. delete the `<p class="quote__todo">` line,
4. remove `is-empty` from the class.

The slot restyles itself as a finished quote automatically. Also delete the
"These slots are reserved for real client quotes" line above the grid once at least
one is real.

---

## Two things to look at and decide

**The private-events photo shows another venue's backdrop.** The photo on the
"Private" half of the Pick Your Room section is your own close-up show, but the
venue's branded backdrop is partly legible behind the performer. It is dimmed by the
overlay and mostly covered by the text, but if you would rather not show it, swap the
`src` on that `<img class="side__bg">` for another photo. Several unused originals are
still in `images/`.

**Residency shows are not mentioned anywhere.** You asked for them to be dropped, so
the page commits entirely to corporate events and private parties. If a residency
becomes real, it needs a venue, a schedule and a ticket link before it can go on the
page truthfully.

---

## How the files fit together

```
index.html          the whole page
styles.css          the whole visual system
script.js           marquee chase, nav, form validation, placeholder submit
fonts/              Delauney (your display face) + Libre Franklin, both self-hosted
images/             your original files, untouched
images/site/        the 8 optimised images the page actually loads
```

There is no build step and no dependencies. Open `index.html` in a browser and it
works. To publish, upload the whole folder to any static host.

A couple of notes worth knowing if you edit it later:

- **Headlines are ASCII only, on purpose.** The Delauney font file contains 112
  glyphs: capitals, lowercase, digits and basic punctuation. It has no accented
  characters and no curly quotes. If you type a curly apostrophe into a headline it
  will fall back to a different font and look wrong. Use a straight apostrophe.
- **Delauney is unicase.** Lowercase letters render as small capitals. That is the
  font, not a bug.
- `images/site/` files are resized and compressed copies. Your originals in `images/`
  are untouched, so you can always regenerate them.
- `.impeccable/` holds development tooling and review screenshots. It is not part of
  the site and does not need to be uploaded.
