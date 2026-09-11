# House of Draco &mdash; Draco's Den

A static, interactive site for the House of Draco, wired to Google Forms and a Google Sheet so:

- **Students sign up** through embedded Google Forms (Den Guides, Wisdom Keepers, Loyalty Flame Keepers, Gratitude Log).
- **Teachers assign hallway/locker duty** by typing directly into a spreadsheet tab &mdash; no form involved. Teachers can also directly add rows to any of the roster tabs (e.g. to assign a homeroom as Loyalty Flame Keepers) the same way.
- The site re-reads the sheet roughly every minute, so both kinds of change show up live for every visitor, with no server to run.

## The programs

- **Weekly Den Keepers** &mdash; the homeroom on duty each week to tidy the hallway and make sure every locker is fully closed.
- **Vault Rotation** &mdash; a separate weekly rotation where one homeroom handles a full locker cleanout, supported by the **Den Guides**: students who volunteer to help clean out and organize lockers year-round.
- **Wisdom Keepers** &mdash; students who volunteer to help classmates study for classes, organize classwork, or review notes, by subject.
- **Loyalty Flame Keepers** &mdash; the gratitude spotlight. Each month the House focuses on a different department, and Loyalty Flame Keepers &mdash; assigned by their HR or volunteering &mdash; are the students who carry gratitude to that department, logging what they did.

## Files

- `index.html` &mdash; the site
- `app.js` &mdash; rendering + rotation logic
- `data.js` &mdash; things that rarely change: homeroom list, the hallway checklist, gratitude department descriptions
- `sheets.js` &mdash; **the file you edit** once your Form(s) and Sheet exist: paste in your links and sample data disappears in favor of the real thing
- `assets/` &mdash; your House of Draco brand images (wordmark, hex crest, hero dragon, silhouettes)
- `README.md` &mdash; this file

Until you connect anything, the site runs on realistic sample rows so you can see exactly how it will look and behave.

## Brand assets in use

The palette and imagery are pulled directly from your uploaded Draco artwork rather than a generic theme:

- **Header** uses `draco-hex.png` (the hexagon crest) and `draco-title-white.png` (white wordmark, for the dark header).
- **Footer** uses `draco-title-color.png` (the magenta wordmark, for the light background).
- **Home page hero** uses `draco-hero.png`, the full-color constellation dragon.
- **Background watermarks** in the header and the Loyalty Flame Keepers spotlight use `draco-silhouette-white.png` at low opacity.
- **Favicon** is `draco-hex.png`.
- Colors (deep plum `#170b22`, violet `#7d12a0`, magenta `#b405da`, silver `#c9cacb`) were sampled straight from the artwork's own gradient.

If you swap in new artwork later, updating the `<img>` `src` attributes in `index.html`'s header/footer/hero and the `:root` color variables at the top of the `<style>` block is all that's needed.

---

## Part 1 &mdash; Build the spreadsheet

1. Create a new Google Sheet, name it something like **House of Draco Data**.
2. Rename `Sheet1` to **Schedule** and give it this header row (row 1):

   | Program | Week Of | Homeroom |
   |---|---|---|

   This is the one tab with **no form** &mdash; teachers type into it directly. `Program` is either `weekly_watch` (for Weekly Den Keepers) or `vault` (for Vault Rotation); `Week Of` is that week's Monday as `YYYY-MM-DD`; `Homeroom` must match a homeroom label from `data.js` exactly (e.g. `HR 101`).

You'll add four more tabs automatically in Part 2, one per form.

## Part 2 &mdash; Build the four Google Forms

Create four separate Google Forms with these exact questions (the wording becomes the spreadsheet column headers the site reads, so match it closely):

**Form 1 &mdash; Den Guide Sign-Up**
- *Name* (Short answer)
- *Homeroom* (Dropdown &mdash; one option per row in `HOMEROOMS`, e.g. `HR 101`, `HR 102`, &hellip;)

**Form 2 &mdash; Wisdom Keeper Sign-Up**
- *Name* (Short answer)
- *Homeroom* (Dropdown, same options as above)
- *Subject(s)* (Short answer)
- *How can you help?* (Checkboxes: `Study for classes`, `Organize classwork`, `Review notes`)

**Form 3 &mdash; Loyalty Flame Keeper Sign-Up**
- *Name* (Short answer &mdash; if a teacher is assigning a whole homeroom rather than an individual volunteer, "HR 104 (whole homeroom)" works fine here too)
- *Homeroom* (Dropdown, same options as above)
- *How assigned?* (Dropdown: `Volunteer`, `Assigned by HR`)

**Form 4 &mdash; Gratitude Log**
- *Name* (Short answer)
- *Method* (Dropdown: `In-person encounter`, `Handwritten card`, `Act of service`, `Public appreciation`)
- *What did you do?* (Short answer or paragraph)

For each form: click the **Responses** tab &rarr; the green Sheets icon &rarr; **Select existing spreadsheet** &rarr; choose your **House of Draco Data** sheet. This creates a new tab in that spreadsheet automatically (e.g. "Form Responses 1"). Rename each response tab to something clear: **Den Guides**, **Wisdom Keepers**, **Loyalty Flame Keepers**, **Gratitude Log**.

## Part 3 &mdash; Publish each tab so the site can read it

For **each** of the five tabs (Schedule, Den Guides, Wisdom Keepers, Loyalty Flame Keepers, Gratitude Log):

1. In the spreadsheet, go to **File &rarr; Share &rarr; Publish to web**.
2. Under the first dropdown, choose that specific tab (not "Entire Document").
3. Under the second dropdown, choose **Comma-separated values (.csv)**.
4. Click **Publish**, confirm, and copy the link it gives you.

You'll end up with five CSV links, one per tab.

Also grab the plain spreadsheet URL from your browser's address bar (looks like `https://docs.google.com/spreadsheets/d/1AbC.../edit`) &mdash; that's the one teachers will use to open and edit the Schedule tab (or add a Loyalty Flame Keeper row) directly.

## Part 4 &mdash; Wire it into the site

Open `sheets.js` and fill in the blanks:

```js
const SHEETS_CONFIG = {
  wisdomKeepersUrl: "...",   // Wisdom Keepers published CSV link
  denGuidesUrl: "...",       // Den Guides published CSV link
  flameKeepersUrl: "...",    // Loyalty Flame Keepers published CSV link
  gratitudeUrl: "...",       // Gratitude Log published CSV link
  scheduleUrl: "...",        // Schedule published CSV link

  wisdomKeepersFormEmbed: "...",
  denGuidesFormEmbed: "...",
  flameKeepersFormEmbed: "...",
  gratitudeFormEmbed: "...",

  spreadsheetEditUrl: "...", // plain spreadsheet URL, for the teacher "open sheet" link
  refreshIntervalMs: 60000,
};
```

To get each form's embed link: open the form &rarr; **Send** &rarr; the `<>` (embed) tab &rarr; copy the `src="..."` URL out of the snippet.

Commit and push. The sample data disappears and the site now reflects your real Sheet.

## How teachers assign duty weeks or Flame Keepers

**Weekly Den Keepers / Vault Rotation:** open the spreadsheet (the "Open the spreadsheet" link on those pages goes straight there) and add a row to the **Schedule** tab:

```
Program: weekly_watch | Week Of: 2026-09-21 | Homeroom: HR 104
```

**Loyalty Flame Keepers:** just add a row directly to the **Loyalty Flame Keepers** tab &mdash; no form needed for a teacher assignment, the same tab that the sign-up form feeds:

```
Name: HR 106 (whole homeroom) | Homeroom: HR 106 | How assigned?: Assigned by HR
```

Either way, no re-deploy is needed &mdash; the site picks it up on its next refresh (about a minute). Weeks with no Schedule row auto-rotate through the homerooms in `data.js` in order, so there's always someone assigned by default.

## Notes on timing and limits

- Google's "Publish to web" feed typically updates within a minute of a change, sometimes a little longer during heavy use &mdash; not instant, but effectively live for a school setting.
- The site polls every 60 seconds (`refreshIntervalMs` in `sheets.js`); lower it if you want snappier updates, though Google may rate-limit very frequent requests.
- Anyone with the published link can *read* the data (that's what makes it visible to the static site), but the spreadsheet's normal Google sharing permissions still control who can *edit* it &mdash; keep editor access limited to teachers/admins.
- If you'd rather not publish tabs to the open web at all, the same `fetchSheetTab()` function in `sheets.js` can be pointed at a small backend (a Google Apps Script Web App, Firebase, or similar) that checks a login before returning data &mdash; the rest of `app.js` doesn't need to change.

## Deploying to GitHub Pages

1. Add all files (including the `assets/` folder) to a GitHub repository.
2. **Settings &rarr; Pages &rarr; Source:** "Deploy from a branch," pick your branch and the `/ (root)` folder.
3. Save. GitHub gives you a URL like `https://your-username.github.io/your-repo/` within a minute or two.

No build step or server required.
