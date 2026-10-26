import type { ExpressionSpecification, StyleSpecification } from "maplibre-gl";

// Agency art direction over OpenFreeMap's vector data; deliberately independent
// of the Pro site's style so both sites can evolve without sharing presentation.
export function agencyMapStyle(dark: boolean): StyleSpecification {
  const c = dark ? {
    ground: "#070e0b", block: "#0b1711", building: "#101f17", outline: "#1c3b29",
    park: "#102d1b", water: "#0c2524", road: "#102b1d", major: "#173d25",
    edge: "#347c45", text: "#9dbda5", halo: "#07110b",
  } : {
    ground: "#e8ede4", block: "#dfe7db", building: "#d1decc", outline: "#c1d2bc",
    park: "#b8d2ad", water: "#b8d6cd", road: "#f8f8ee", major: "#fffdf1",
    edge: "#adc2a4", text: "#53694d", halo: "#f1f4e9",
  };
  const source = "openmaptiles";
  const name: ExpressionSpecification = ["coalesce", ["get", "name:fa"], ["get", "name:nonlatin"], ["get", "name"]];
  const roads: ExpressionSpecification = ["match", ["get", "class"], ["motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"], true, false];
  return {
    version: 8,
    sources: { [source]: { type: "vector", url: "https://tiles.openfreemap.org/planet" } },
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    layers: [
      { id: "ground", type: "background", paint: { "background-color": c.ground } },
      { id: "blocks", type: "fill", source, "source-layer": "landuse", paint: { "fill-color": c.block } },
      { id: "greenery", type: "fill", source, "source-layer": "landcover", filter: ["match", ["get", "class"], ["wood", "grass"], true, false], paint: { "fill-color": c.park, "fill-opacity": 0.7 } },
      { id: "parks", type: "fill", source, "source-layer": "park", paint: { "fill-color": c.park } },
      { id: "water", type: "fill", source, "source-layer": "water", paint: { "fill-color": c.water } },
      { id: "buildings", type: "fill", source, "source-layer": "building", minzoom: 14, paint: { "fill-color": c.building, "fill-outline-color": c.outline, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0.2, 16, 0.85] } },
      { id: "road-outlines", type: "line", source, "source-layer": "transportation", filter: roads, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": c.edge, "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 1, 15, 7, 18, 25], "line-opacity": dark ? 0.8 : 1 } },
      { id: "roads", type: "line", source, "source-layer": "transportation", filter: roads, layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["match", ["get", "class"], ["motorway", "trunk", "primary"], c.major, c.road], "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 11, 0.3, 15, 5.5, 18, 23] } },
      { id: "paths", type: "line", source, "source-layer": "transportation", filter: ["match", ["get", "class"], ["path", "pedestrian", "track"], true, false], minzoom: 14, paint: { "line-color": c.edge, "line-width": 1, "line-dasharray": [2, 3] } },
      { id: "street-names", type: "symbol", source, "source-layer": "transportation_name", minzoom: 13, layout: { "symbol-placement": "line", "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": ["interpolate", ["linear"], ["zoom"], 13, 11, 17, 13], "text-max-angle": 35, "symbol-spacing": 250 }, paint: { "text-color": c.text, "text-halo-color": c.halo, "text-halo-width": 2 } },
      { id: "place-names", type: "symbol", source, "source-layer": "place", maxzoom: 16, layout: { "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": 13, "text-max-width": 8 }, paint: { "text-color": c.text, "text-halo-color": c.halo, "text-halo-width": 2 } },
    ],
  };
}
