# Public directory and geographic sources

Snapshot imported October 26, 2026, New York time (`2026-10-27T02:01:11.611Z`). This is an attributed snapshot, not a claim of provider verification, live inventory, or organizational partnership.

## Food programs

The public production configuration used by [NYC Food Help](https://finder.nyc.gov/foodhelp/) identifies two query-only ArcGIS layers:

- [Food Help Programs production view](https://services6.arcgis.com/yG5s3afENB5iO9fj/arcgis/rest/services/Food_Help_Programs_PROD_view/FeatureServer/0).
- [EFAP/PFRED production view](https://services5.arcgis.com/tMsas0Edz7Aih7fO/arcgis/rest/services/EFAP_PFRED_Programs_PROD_view/FeatureServer/0).

`scripts/import-food-directory.mjs` queries these public layers without credentials. Only `Open` records with valid NYC-area coordinates, names, and addresses are retained. Duplicate name/address pairs collapse into one program. The result has 524 programs: Brooklyn 184, Queens 125, Bronx 106, Manhattan 86, Staten Island 23.

`src/data/nyc-food-directory.json` retains each row's source layer, source record link, and edit date. Structured hours preserve weekday, service, separate sessions, and minute precision. Free-text conditions remain visible and require confirmation. General weekly hours aid discovery; second/fourth-week restrictions are visibly flagged and the planner requires confirmation of the actual date.

Absent fields stay unknown. No public record receives invented inventory, household capacity, diets, accessible entrances, documentation rules, appointments, transport, delivery, or volunteer needs. Source status `Open` means listed active, not currently open or food guaranteed.

Run `node scripts/import-food-directory.mjs` to refresh. Review the diff/counts, run tests, and inspect conditional schedules before committing. Incomplete/error responses fail before the snapshot is overwritten. `--from-local` expects source query responses at `/tmp/nourish-nyc-food.json` and `/tmp/nourish-nyc-food-secondary.json`.

## Borough outlines

[NYC Department of City Planning Borough Boundaries](https://data.cityofnewyork.us/City-Government/Borough-Boundaries/gthc-hcne), version **26b**, shoreline clipped, water excluded. The five MultiPolygons are generalized for display, not legal or survey use. GeoJSON source: `https://data.cityofnewyork.us/resource/gthc-hcne.geojson`.

Download the source separately, then run:

```sh
python3 scripts/prepare-boroughs.py /path/to/source.geojson
```

Douglas–Peucker simplification (0.00008 degrees) and six-decimal rounding preserve closed rings and all five features. The resulting 10,567 vertices live in `src/data/borough-boundaries.json`. `src/lib/geography.ts` projects boundaries and hubs into the same aspect-preserving atlas. Leaflet uses the same geographic geometry.

## Approximate starting areas

`src/data/zip-centroids.json` contains 2,712 ZIP Code Tabulation Area centers from the [2024 Census Gazetteer national ZCTA file](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip), restricted to NY/NJ/CT prefixes. These are approximate geographic centers, not household locations, ZIP service guarantees, or food-program coverage boundaries. Named neighborhoods use curated approximate centers.

## Routes and external services

[FOSSGIS/OpenStreetMap routing](https://routing.openstreetmap.de/about.html) provides OSRM walking and driving. One request computes origin → program → origin, retaining separate leg durations. Requests are serialized at least 1.1 seconds apart and cached in memory for 30 minutes. Provider terms and availability still apply.

OpenStreetMap attribution is visible on maps. Food source/edit dates appear on detail pages; the atlas credits NYC Food Help and NYC DCP. Review source terms, freshness arrangements, and provider capacity before operating a public service at scale.
