import boundaries from "../data/borough-boundaries.json";
export { boundaries };
const mercator = ([lng, lat]: number[]) => [
  (lng * Math.PI) / 180,
  Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)),
];
const coordinates = boundaries.features.flatMap((f) =>
  f.geometry.coordinates.flatMap((p) => p.flatMap((r) => r.map(mercator))),
);
const minX = Math.min(...coordinates.map((p) => p[0])),
  maxX = Math.max(...coordinates.map((p) => p[0])),
  minY = Math.min(...coordinates.map((p) => p[1])),
  maxY = Math.max(...coordinates.map((p) => p[1]));
const scale = Math.min(532 / (maxX - minX), 582 / (maxY - minY));
export function atlasPoint(lng: number, lat: number) {
  const [x, y] = mercator([lng, lat]);
  return [
    (x - minX) * scale + (580 - (maxX - minX) * scale) / 2,
    (maxY - y) * scale + (630 - (maxY - minY) * scale) / 2,
  ];
}
export const boroughPaths = boundaries.features.map((feature) => ({
  name: feature.properties.name,
  path: feature.geometry.coordinates
    .map((polygon) =>
      polygon
        .map(
          (ring) =>
            ring
              .map((p, i) => {
                const [x, y] = atlasPoint(p[0], p[1]);
                return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
              })
              .join(" ") + " Z",
        )
        .join(" "),
    )
    .join(" "),
}));
export const boroughLabels = [
  { name: "Bronx", point: atlasPoint(-73.865, 40.875) },
  { name: "Manhattan", point: atlasPoint(-73.986, 40.802) },
  { name: "Queens", point: atlasPoint(-73.805, 40.742) },
  { name: "Brooklyn", point: atlasPoint(-73.953, 40.635) },
  { name: "Staten Island", point: atlasPoint(-74.16, 40.572) },
];
