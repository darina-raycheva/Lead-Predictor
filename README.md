# LeadPredictor

LeadPredictor is a lightweight campaign forecast dashboard built with plain HTML, CSS and JavaScript. It estimates the number of customers, leads and prospects required to reach a revenue target.

## Features

- Campaign settings for language, currency, dates, revenue and average order value
- USD, EUR, GBP and BGN currency options
- Response-rate sliders for leads and prospects
- Dynamic monthly forecast chart with interactive tooltips
- Live Prospects, Leads and Customers summary cards
- Validation for dates, numeric values and zero response rates
- Responsive layout for desktop, tablet and mobile screens

## Forecast formulas

The dashboard follows the provided calculation rules:

```text
Customers = Total Revenue / Average Order Value
Leads = Customers * 100 / Lead Response Rate
Prospects = Leads * 100 / Prospect Response Rate
```

Results that represent a required minimum quantity are rounded up. This ensures that the forecast does not fall below the requested revenue target.

## Run locally

No build tools or dependencies are required.

1. Open `index.html` directly in a browser.
2. Change the campaign values or response-rate sliders.
3. Select a chart bar to inspect its monthly forecast.

For local development, the project can also be served by any static file server.

## Project structure

```text
index.html   Dashboard markup and form controls
styles.css   Theme, layout, chart and responsive styles
app.js       Forecast calculations and interactions
README.md    Project documentation
```

## Branch workflow

The project is developed in separate feature branches so each dashboard area can be reviewed independently:

- `Project-foundation` - initial dashboard shell and visual foundation
- `Left-side-functionalities` - campaign form controls
- `Building-responce-rate-section` - response-rate sliders
- `Mountly-lead-forcast-section` - monthly forecast chart and metrics
- `Fixing-bugs-after-given-hints` - formula corrections and final bug fixes

Commits and pushes are intentionally manual. Review the working tree first, then create a commit when the changes are ready.
