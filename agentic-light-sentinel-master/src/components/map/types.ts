// Map configuration constants
export const BASEMAPS = {
  OpenStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  'Esri WorldImagery': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  'Esri WorldTopoMap': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{x}/{y}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  },
  OpenTopoMap: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }
} as const;

export const LIGHT_POLLUTION_YEARS = {
  2005: 'https://tiles.lightpollutionmap.info/w2005/{z}/{x}/{y}.png',
  2010: 'https://tiles.lightpollutionmap.info/w2010/{z}/{x}/{y}.png',
  2020: 'https://tiles.lightpollutionmap.info/w2020/{z}/{x}/{y}.png',
  2022: 'https://tiles.lightpollutionmap.info/w2022/{z}/{x}/{y}.png',
  2023: 'https://tiles.lightpollutionmap.info/w2023/{z}/{x}/{y}.png',
  2024: 'https://tiles.lightpollutionmap.info/w3/{z}/{x}/{y}.png'
} as const;

export type BaseMapType = keyof typeof BASEMAPS;
export type Year = keyof typeof LIGHT_POLLUTION_YEARS;

export interface ClickEvent {
  latlng: { lat: number; lng: number };
  originalEvent: MouseEvent;
}