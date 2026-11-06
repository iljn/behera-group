# Behera Group · UCLA

A small, static research group website. Content lives in Markdown; one Node script builds HTML and CSS. There is no client JavaScript, CMS, framework, analytics, cookie banner, CDN dependency, or package installation.

## Edit and build

Requires Node 22 or newer. From the repository root:

```sh
node scripts/build.mjs
node scripts/check.mjs
```

Open `dist/index.html` directly in a browser, or serve `dist/` with any static server. All asset URLs are relative, including fonts, so the output also works under a GitHub Pages project subpath and without JavaScript.

| Change | Edit |
| --- | --- |
| Homepage introduction | `content/intro.md` |
| Selected papers | `content/publications.md` |
| Research directions | `content/research.md` |
| Research support | `content/support.md` |
| PI, graduate students, undergraduates | `content/team.md` |
| Email, Scholar, optional X, copyright owner | `site.json` |
| Layout and structure | `template.html` |
| Type, spacing, colors, responsive rules | `assets/style.css` |
| Original line art | `assets/lattice.svg` |

Publications use a `### YEAR` heading for each entry followed by a title link and citation paragraph. Multiple entries in the same year each receive their own heading. Other files use ordinary Markdown; raw HTML is supported for trusted repository maintainers. Never feed visitor-submitted Markdown to this build. The support block is omitted when `support.md` contains only comments or whitespace. Add confirmed funders there; prior publication acknowledgments do not establish current lab funding.

The footer year is determined at build time. Rebuild annually or with any content change. `site.json` currently uses a Google Scholar **author search**, since a direct profile ID has not been independently verified. Replace `scholar` with the verified profile URL when available. Set `x` to a verified account URL to add its footer link; leaving it empty omits the link.

## Deployment

### GitHub Pages

The included `.github/workflows/pages.yml` builds, checks, and deploys `dist/` on pushes to `main`. In the repository, select **Settings → Pages → Build and deployment → Source → GitHub Actions**. Pages availability for private repositories depends on the account plan. The workflow never uses npm install. Builds use only the checked-in sources and the selected Node version.

### Attached static preview

`.openai/hosting.json` describes the attached static host and points to `dist/`. This is independent of GitHub Pages. Publishing an update rebuilds and uploads that same output; no server-side application is involved.

## Implementation choices

- **One vendored build dependency:** Marked 15.0.12, from the npm distribution at `https://cdn.jsdelivr.net/npm/marked@15.0.12/lib/marked.esm.js`. MIT license in `vendor/MARKED-LICENSE.txt`. It runs at build time only. Updating it is an explicit maintenance decision; no package-manager dependency graph is needed.
- **Typography:** DM Sans, Latin subset, normal 400 and 500, hosted locally (about 28 KB combined WOFF2). SIL Open Font License in `assets/fonts/OFL.txt`. Source: `@fontsource/dm-sans@5.2.6`. Fallbacks: Helvetica, Arial, sans-serif. Browser-synthesized italics are used only for journal names.
- **Minification:** conservative HTML whitespace cleanup and CSS whitespace/comment removal in the build script. No optimizer dependency; prose, inline spacing, and preformatted content remain intact. SVG is already compact source.
- **Color:** UCLA Blue `#2774AE`, a light neutral ground, and dark neutral text. Blue is reserved for navigation boundaries, links, focus, and the artwork. No gold is needed.
- **Interaction:** native anchor navigation, hover/focus treatments in CSS, no scrolling effects or stateful controls. All sections are visible in the initial HTML.
- **Accessibility target:** WCAG 2.1 AA, as required for UCLA lab websites. Semantic landmarks; ordered headings; skip link; keyboard focus; responsive reflow; no color-only information; reduced-motion handling; and measured normal-text contrast. `check.mjs` verifies build integrity and the four text/background pairs. Automated checks are not full accessibility certification; perform screen-reader and browser reflow checks before an official launch. Update alt text and heading structure with content changes.

## Content and assets to confirm before an official launch

The three research directions, public contact address, education, and selected publication list are based on the [UCLA faculty profile](https://samueli.ucla.edu/people/piush-behera/) and [Samueli new-faculty description](https://www.samueli.ucla.edu/new-faculty-2023-2026/), accessed November 6, 2026. Research copy is a draft paraphrase, not a statement approved by the PI. The selected papers predate the UCLA group and are labeled as selected work. Student names and current funders are intentionally not invented.

The official department image is the asset served on the [UCLA MSE site](https://www.mse.ucla.edu/): `https://www.mse.ucla.edu/wp-content/uploads/mse/UCLA_Samueli_MSE_rev-1.png`. It is included unchanged and appears on UCLA Blue. UCLA marks remain the property of UCLA; use follows the [UCLA identity guidelines](https://brand.ucla.edu/identity/logos-and-marks/campus-logo). Department approval of the final logo application should precede an official launch.

The original SVG is **editorial line art**, inspired by fluorite coordination and layered growth. It is not a refined polar HfO2/ZrO2 crystal structure, not an ALD reaction mechanism, and must not be reused as a scientific structure figure. The image is decorative (`alt=""`) and intentionally has no visible caption.

UCLA's [lab-site accessibility requirement](https://dts.ucla.edu/index.php/digital-accessibility/websites) is WCAG 2.1 AA. [Color/type guidance](https://brand.ucla.edu/fundamentals/accessibility/color-type) and [brand colors](https://brand.ucla.edu/identity/colors) informed the implementation. DM Sans is a deliberate draft typography choice requested for the group identity, rather than UCLA's default system font stack.

Site content and original design: © Piush Behera. Third-party font, parser, and UCLA mark rights are retained by their respective owners.
