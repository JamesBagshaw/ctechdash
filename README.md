# Equipment Database

A lightweight, static searchable database of departmental equipment. No server or
database software required — it runs entirely as HTML/CSS/JS files, so it can be
hosted on almost any subdomain or static host.

## How it works

- `data/equipment.csv` is the source of truth — your equipment list, editable in
  Excel, Numbers, or Google Sheets.
- `scripts/build_data.py` converts that CSV into `data/equipment.json`, which the
  website actually reads.
- `index.html` / `style.css` / `app.js` are the website: a search box that filters
  live as you type (matching name, category, and tags) plus category filter chips.

## Updating the equipment list

1. Open `data/equipment.csv` in Excel/Numbers/Google Sheets (or edit it directly
   as a text file). Columns:

   | Column      | Required | Notes                                              |
   |-------------|----------|-----------------------------------------------------|
   | Name        | yes      | e.g. `Rode NT1-A`                                    |
   | Category    | yes      | e.g. `Microphones` — used for filter chips           |
   | Description | no       | short description shown on the card                  |
   | Quantity    | no       | number in stock                                       |
   | Location    | no       | e.g. `Store Room A - Shelf 2`                         |
   | Tags        | no       | extra search keywords, separated by `;`, e.g. `studio;vocal` |

   Add, edit, or remove rows as needed. If editing in a spreadsheet app, use
   **File > Save As / Export > CSV** to save back over `data/equipment.csv`.

2. Rebuild the JSON the site uses:

   ```bash
   python3 scripts/build_data.py
   ```

   This prints how many items/categories it found. Fix any warnings (usually a
   missing Name or Category) and re-run if needed.

3. Re-upload/redeploy the folder (see Hosting below). That's the whole workflow —
   no code changes needed for day-to-day updates.

## Running it locally

Because the page fetches `data/equipment.json` with `fetch()`, opening
`index.html` directly from disk (`file://`) will be blocked by the browser in
some cases. Serve it locally instead:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Hosting on a subdomain

This is a fully static site (just `index.html`, `style.css`, `app.js`, and the
`data/` folder) — any static host works:

- **Netlify / Vercel / Cloudflare Pages**: drag-and-drop the folder, or connect
  a git repo for automatic redeploys. Point your subdomain's CNAME at the host.
- **GitHub Pages**: push this folder to a repo and enable Pages — good if you
  want colleagues to edit the CSV and open a pull request.
- **Your institution's web server**: upload the folder via SFTP into the
  subdomain's web root.

No build step is required beyond running `build_data.py` after editing the CSV.

## Adding more fields later

If you want more structured filtering (e.g. by manufacturer, room, or condition),
add a column to `equipment.csv`, add a matching key in `scripts/build_data.py`'s
`items.append({...})` block, and reference it in `app.js`'s card template.
