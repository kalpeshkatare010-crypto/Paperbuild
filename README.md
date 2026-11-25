# Paper Build

Write a research paper once and format it for any of 8 standards, with a live preview that is the real PDF.

**Standards:** IEEE Conference, ACM Conference (sigconf), Springer LNCS, Elsevier (preprint), APA 7th, MLA 9th, Chicago 18th (author-date), Harvard.

## What's here
| File | What it is |
|---|---|
| `index.html` | Landing website (standards list, how it works, pricing, app install) |
| `app.html` | The editor: standard gallery, form bands, live PDF preview, PDF download |
| `manifest.webmanifest`, `sw.js` | Makes it an installable app (PWA) that also works offline |
| `assets/` | Logo (Libertinus Serif small caps), app icons |
| `fonts/` | Libertinus Serif (SIL Open Font License, see `fonts/OFL.txt`) |

## How it works
- Each standard has its own layout function that draws the PDF with jsPDF (page size, columns, fonts, heading numbering, abstract style, page numbers).
- References are entered as structured fields and formatted per standard; in-text `[1]` citations become `(Author, Year)` etc. for author-date styles.
- The preview renders the generated PDF with pdf.js, so the preview and the download are identical.
- Page & text settings (page size, font, size, line spacing, margins, indent, alignment, columns, page numbers) start from each standard's defaults and can be changed.
- Figures: upload images into any section; they are numbered and captioned per standard. Images are kept in the browser (IndexedDB).
- Two-column layouts balance the columns on the last page.
- Drafts are saved in the browser's local storage. No server.

## Run locally
Open `index.html` in a browser. Install-as-app and offline mode need the site served over HTTPS (e.g. GitHub Pages).
