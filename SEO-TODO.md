# SEO to-do

Open items from the SEO plan that need something only the owner can supply.
Every `[TODO: …]` and `[CONFIRM: …]` placeholder in the site is listed here.
Tick items off as they are answered.

The site went live for indexing on 2026-10-14 (see `LAUNCH.md`), so anything
below that is visible on a page is visible to search engines too.

## Needs facts from the client

- [ ] **Client logos (indexed now).** The homepage says "The brands you know already
      booked us" over eight logos carried over from Kent's own site (AT&T, IBM, Ford,
      Chase, Capital One, Xerox, Con Edison, Make-A-Wish). Keep only companies the
      Squad has genuinely performed for, or reword the line to name Kent. *(Phase 1)*
- [ ] **Email works.** Confirm `kent@vegasmagicsquad.com` actually receives mail. It
      is now the only email on the site, including Privacy and Terms (replacing
      `unrealvegas@gmail.com`). *(Phase 2)*
- [ ] **Business email.** Move to an `@magicsquad.vegas` address before launch
      marketing starts. Change `APPROVED` in `scripts/check-contact.js`, then the pages,
      until `npm run check-contact` passes. *(Phase 2)*
- [ ] **Local phone.** Move to a 702 or 725 (Las Vegas) number. The current
      (207) 458-3115 is a Maine area code, which undercuts a "Las Vegas" business
      for both buyers and local search. Same process as the email. *(Phase 2)*
- [ ] **Service-area address.** Decide whether to show a service-area address (or
      just "Las Vegas, Nevada", as now) on the site and in the business schema. *(Phase 2)*
- [ ] **Kent: gig length.** `kent-axell.html` shows `[TODO: realistic gig length range]`
      in "At a glance" (it said "10 – 1000 minutes"). *(Phase 2)*
- [ ] **Kent: Werner Herzog quote.** Removed from the press lines because it had no
      source. It can come back only with a verifiable one (where and when it was
      said or published). *(Phase 2)*
- [x] **Domain.** `https://www.magicsquad.vegas` is attached to the Vercel project
      and the bare `magicsquad.vegas` 308-redirects to it, matching every canonical,
      `og:url` and `sitemap.xml`. *(Phase 1; checked 2026-10-14)*
- [x] **Analytics.** Vercel plan is Hobby, so there are no custom click or submit
      events (removed in Phase 2) and no GA4 or cookie-based analytics. Vercel Web
      Analytics counts page views only. **Leads are tracked in GoHighLevel**: every
      booking-form submission carries the page it was sent from in its `pageUrl`
      field (and `source: "Website booking form"`). *(Phase 2)*

## Needs legal review

- [x] **Privacy Policy and Terms of Service.** Replaced on 2026-10-17 with the
      owner's own text, published word for word, plus the approved email and phone
      under each contact section. All eight earlier `[CONFIRM: …]` placeholders went
      with the old drafts.
- [ ] **SMS consent on the form.** Both documents describe SMS opt-in (marketing
      consent separate from transactional, 18+ for marketing). Check the booking
      form's consent boxes match that wording before SMS sending starts.
- [ ] **"Creator applications".** The Privacy Policy mentions creator applications
      and collaboration opportunities. The site has no such form today; fine if
      one is planned, otherwise worth removing from the policy.

## Needs photos / video

_Nothing yet._

## Content backlog

_Filled in Phase 5._
