# House of Draco &mdash; Draco's Den

A static, interactive site for the House of Draco, wired to Google Forms and a Google Sheet so:

- **Students sign up** through embedded Google Forms &mdash; one shared form for Draco Duties (Den Guides + Wisdom Keepers), one for Loyalty Flame Keepers, one for the Gratitude Log.
- **Teachers assign hallway/locker duty and pick each month's recognized department** by typing directly into a spreadsheet tab &mdash; no form involved. Teachers can also directly add rows to any of the roster tabs (e.g. to assign a homeroom as Loyalty Flame Keepers) the same way.
- The site re-reads the sheet roughly every minute, so both kinds of change show up live for every visitor, with no server to run.

## The programs

- **Weekly Den Keepers** &mdash; the homeroom on duty each week to tidy the hallway and make sure every locker is fully closed.
- **Vault Rotation** &mdash; a separate weekly rotation where one homeroom handles a full locker cleanout and a check of their school email inbox (replying to anything that needs a response, and deleting or filing anything they're finished with), supported by the **Den Guides**: students who volunteer to help clean out and organize lockers year-round.
- **Wisdom Keepers** &mdash; students who volunteer to help classmates study for classes, organize classwork, or review notes, by subject.
- **Loyalty Flame Keepers** &mdash; the gratitude spotlight. Each month the House focuses on a different department, and Loyalty Flame Keepers &mdash; assigned by their HR or volunteering &mdash; are the students who carry gratitude to that department, logging what they did.
- **Dragon's Lair** &mdash; the House leadership page: all House faculty (photo, classes taught, room number) and this year's student House Captain.

## Files

- `index.html` &mdash; the site
- `app.js` &mdash; rendering + rotation logic
- `data.js` &mdash; things that rarely change: homeroom list, the hallway checklist, gratitude department descriptions, House faculty, House Captain
- `sheets.js` &mdash; **the file you edit** once your Form(s) and Sheet exist: paste in your links and sample data disappears in favor of the real thing
- `assets/` &mdash; your House of Draco brand images (wordmark, hex crest, hero dragon, silhouettes)
- `README.md` &mdash; this file

Until you connect anything, the site runs on realistic sample rows so you can see exactly how it will look and behave.

## Brand assets in use

- **Header** uses `draco-hex.png` (the hexagon crest) and `draco-title-white.png` (white wordmark, for the dark header).
- **Footer** uses `draco-title-color.png` (the magenta wordmark, for the light background).
- **Home page hero** uses `draco-hero.png`, the full-color constellation dragon.
- **Dragon's Lair hero** uses `draco-title-white.png` (large, centered) and `draco-hex.png` (large, positioned on the left) on a dark plum-to-violet banner.
- **Background watermarks** in the header and the Loyalty Flame Keepers spotlight use `draco-silhouette-white.png` at low opacity.
- **Favicon** is `draco-hex.png`.
- Colors (deep plum `#170b22`, violet `#7d12a0`, magenta `#b405da`, silver `#c9cacb`) were sampled straight from the artwork's own gradient.

## Adding your House faculty and Captain

Open `data.js` and edit the `HOUSE_FACULTY` array (name, role, classes taught, room number) and the `HOUSE_CAPTAIN` object (name, year, photo). Both currently hold placeholder/sample entries.

For real photos: create a folder named `assets/faculty/`, add your images there (e.g. `assets/faculty/alden.jpg`), and set each person's `photo` field to that path. Leaving `photo: ""` shows an automatically generated initials avatar instead, so the page still looks complete before you have photos ready.

---

## Part 1 &mdash; Build the spreadsheet

1. Create a new Google Sheet, name it something like **House of Draco Data**.
2. Rename `Sheet1` to **Schedule** and give it this header row (row 1):

   | Program | Week Of | Homeroom |
   |---|---|---|

   This is the one tab with **no form** &mdash; teachers type into it directly. It covers three things, based on the `Program` value:

   - `weekly_watch` &mdash; assigns a homeroom to Weekly Den Keepers for a given week. `Week Of` is that week's Monday (`YYYY-MM-DD`), `Homeroom` is a label from `data.js` (e.g. `HR 101`).
   - `vault` &mdash; same idea, for Vault Rotation.
   - `flame_department` &mdash; picks which department Loyalty Flame Keepers recognizes for a given month. `Week Of` is the 1st of that month (e.g. `2026-10-01`), `Homeroom` holds the department's id or name from `GRATITUDE_DEPARTMENTS` in `data.js` (e.g. `dining` or `Dining Services`).

   Any week or month without a matching row falls back to the automatic default (rotating homerooms, or the rotating department order in `data.js`), so there's always something to show before you've assigned anything.

You'll add three more tabs automatically in Part 2, one per form.

## Part 2 &mdash; Build the three Google Forms

Create three separate Google Forms with these exact questions (the wording becomes the spreadsheet column headers the site reads, so match it closely):

**Form 1 &mdash; Draco Duties Volunteer Form** (covers both Den Guides and Wisdom Keepers)
- *Name* (Short answer)
- *Homeroom* (Dropdown &mdash; one option per row in `HOMEROOMS`, e.g. `HR 101`, `HR 102`, &hellip;)
- *Which duties are you volunteering for?* (Checkboxes: `Den Guide`, `Wisdom Keeper` &mdash; a student can check one or both)
- *Subject(s)* (Short answer &mdash; only needed if you checked Wisdom Keeper; leave blank otherwise)
- *How can you help?* (Checkboxes: `Study for classes`, `Organize classwork`, `Review notes` &mdash; only needed if you checked Wisdom Keeper)

**Form 2 &mdash; Loyalty Flame Keeper Sign-Up**
- *Name* (Short answer &mdash; if a teacher is assigning a whole homeroom rather than an individual volunteer, "HR 104 (whole homeroom)" works fine here too)
- *Homeroom* (Dropdown, same options as above)
- *How assigned?* (Dropdown: `Volunteer`, `Assigned by HR`)

**Form 3 &mdash; Gratitude Log**
- *Name* (Short answer)
- *Method* (Dropdown: `In-person encounter`, `Handwritten card`, `Act of service`, `Public appreciation`)
- *What did you do?* (Short answer or paragraph)

For each form: click the **Responses** tab &rarr; the green Sheets icon &rarr; **Select existing spreadsheet** &rarr; choose your **House of Draco Data** sheet. This creates a new tab in that spreadsheet automatically (e.g. "Form Responses 1"). Rename each response tab to something clear: **Draco Duties**, **Loyalty Flame Keepers**, **Gratitude Log**.

## Part 3 &mdash; Publish each tab so the site can read it

For **each** of the four tabs (Schedule, Draco Duties, Loyalty Flame Keepers, Gratitude Log):

1. In the spreadsheet, go to **File &rarr; Share &rarr; Publish to web**.
2. Under the first dropdown, choose that specific tab (not "Entire Document").
3. Under the second dropdown, choose **Comma-separated values (.csv)**.
4. Click **Publish**, confirm, and copy the link it gives you.

You'll end up with four CSV links, one per tab.

Also grab the plain spreadsheet URL from your browser's address bar (looks like `https://docs.google.com/spreadsheets/d/1AbC.../edit`) &mdash; that's the one teachers will use to open and edit the Schedule tab directly.

## Part 4 &mdash; Wire it into the site

Open `sheets.js` and fill in the blanks:

```js
const SHEETS_CONFIG = {
  dracoDutiesUrl: "...",   // Draco Duties published CSV link
  flameKeepersUrl: "...",  // Loyalty Flame Keepers published CSV link
  gratitudeUrl: "...",     // Gratitude Log published CSV link
  scheduleUrl: "...",      // Schedule published CSV link

  dracoDutiesFormEmbed: "...",
  flameKeepersFormEmbed: "...",
  gratitudeFormEmbed: "...",

  spreadsheetEditUrl: "...", // plain spreadsheet URL, for the teacher "open sheet" link
  refreshIntervalMs: 60000,
};
```

To get each form's embed link: open the form &rarr; **Send** &rarr; the `<>` (embed) tab &rarr; copy the `src="..."` URL out of the snippet. The same `dracoDutiesFormEmbed` link is shown on both the Vault Rotation page and the Wisdom Keepers page &mdash; it's the same form either way.

Commit and push. The sample data disappears and the site now reflects your real Sheet.

## How teachers assign duty weeks or pick the month's department

**Weekly Den Keepers / Vault Rotation:** open the spreadsheet (the "Open the spreadsheet" link on those pages goes straight there) and add a row to the **Schedule** tab:

```
Program: weekly_watch | Week Of: 2026-09-21 | Homeroom: HR 104
```

**This month's Loyalty Flame department:** add a row to the same **Schedule** tab:

```
Program: flame_department | Week Of: 2026-10-01 | Homeroom: dining
```

**Assigning Loyalty Flame Keepers directly (instead of waiting for volunteers):** add a row straight to the **Loyalty Flame Keepers** tab &mdash; the same tab the sign-up form feeds:

```
Name: HR 106 (whole homeroom) | Homeroom: HR 106 | How assigned?: Assigned by HR
```

None of these need a re-deploy &mdash; the site picks up any change on its next refresh (about a minute).

## Notes on timing and limits

- Google's "Publish to web" feed typically updates within a minute of a change, sometimes a little longer during heavy use &mdash; not instant, but effectively live for a school setting.
- The site polls every 60 seconds (`refreshIntervalMs` in `sheets.js`); lower it if you want snappier updates, though Google may rate-limit very frequent requests.
- Anyone with the published link can *read* the data (that's what makes it visible to the static site), but the spreadsheet's normal Google sharing permissions still control who can *edit* it &mdash; keep editor access limited to teachers/admins.
- If you'd rather not publish tabs to the open web at all, the same `fetchSheetTab()` function in `sheets.js` can be pointed at a small backend (a Google Apps Script Web App, Firebase, or similar) that checks a login before returning data &mdash; the rest of `app.js` doesn't need to change.

## Deploying to GitHub Pages

1. Add all files (including the `assets/` folder) to a GitHub repository, all in the same folder as `index.html`.
2. **Settings &rarr; Pages &rarr; Source:** "Deploy from a branch," pick your branch and the `/ (root)` folder.
3. Save. GitHub gives you a URL like `https://your-username.github.io/your-repo/` within a minute or two.

No build step or server required.
