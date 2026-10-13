# Launch checklist: making magicsquad.vegas indexable

The site is deliberately hidden from search engines until launch. Two things
hide it, and **both** have to change. Do not do this until the owner says
"go live" and `SEO-TODO.md` has no open item in "Needs facts from the client"
or "Needs legal review".

## Before you flip it

- [ ] The custom domain `www.magicsquad.vegas` is attached to the Vercel project
      (`vegas-magic-squad`), with `magicsquad.vegas` redirecting to `www`.
      Every canonical, `og:url`, `og:image` and the sitemap use
      `https://www.magicsquad.vegas`. If the domain ends up different, change
      them all first (search the repo for `www.magicsquad.vegas`).
- [ ] HTTPS works on both `www.` and the bare domain. `Strict-Transport-Security`
      is already sent with `includeSubDomains; preload`. Only submit the domain
      to <https://hstspreload.org> once every subdomain you will ever use serves
      HTTPS: preload is hard to undo.
- [ ] `sitemap.xml` lists every indexable page with a current `<lastmod>`.

## The two changes that make the site indexable

1. **robots.txt**: replace its contents with `robots.launch.txt`:

   ```sh
   cp robots.launch.txt robots.txt
   ```

2. **The `X-Robots-Tag: noindex, nofollow` header**: delete it.
   - On **Vercel** (the live host) it is in **`vercel.json`**, in the
     `"source": "/(.*)"` block. Delete the line
     `{ "key": "X-Robots-Tag", "value": "noindex, nofollow" },`.
     Vercel does not read `_headers`.
   - Also delete the `X-Robots-Tag: noindex, nofollow` line from **`_headers`**,
     so a Netlify deploy of `dist/` stays in step.

   Leave `<meta name="robots" content="noindex">` in `privacy.html`, `terms.html`
   and `404.html`. Those pages stay out of search permanently.

Then build and deploy (`vercel deploy --prod`), and check:

```sh
curl -sI https://www.magicsquad.vegas/ | grep -i x-robots   # should print nothing
curl -s  https://www.magicsquad.vegas/robots.txt            # should show Allow: / and the Sitemap line
curl -s  https://www.magicsquad.vegas/sitemap.xml | head    # should be the XML sitemap
```

## After launch

1. **Google Search Console**: add `https://www.magicsquad.vegas` as a property,
   verify it (DNS TXT record at the registrar is the most durable), submit
   `https://www.magicsquad.vegas/sitemap.xml`, then use URL Inspection to
   request indexing for the homepage and the most important pages.
2. **Bing Webmaster Tools**: add the site (it can import from Search Console),
   submit the same sitemap.
3. A week later, check Search Console's Pages report for anything excluded
   that should not be, and the Enhancements reports for structured-data errors.
4. Re-run the Rich Results Test (<https://search.google.com/test/rich-results>)
   on the homepage, one service page and one performer page.
