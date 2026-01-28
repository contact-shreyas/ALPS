# Section 4: Data Sources and Preprocessing

## 4.1 Overview

The ALPS framework integrates multi-source satellite remote sensing data with auxiliary geospatial datasets to enable comprehensive light pollution monitoring across India's 742 districts. This section details the data acquisition workflows, quality control procedures, and preprocessing pipelines that transform raw satellite observations into analysis-ready features for machine learning models.

---

## 4.2 Primary Data Sources

### 4.2.1 VIIRS Black Marble Nighttime Lights

**NASA VIIRS VNP46A1 (Daily Product)**
- **Spatial Resolution**: 500m at nadir (~1km at swath edges)
- **Temporal Coverage**: 2012-present (daily acquisitions)
- **Radiometric Range**: 3×10⁻⁹ to 2×10⁻⁴ W·cm⁻²·sr⁻¹
- **Source**: NASA LAADS DAAC (Level-1 and Atmosphere Archive & Distribution System)
- **Format**: HDF5 with embedded geolocation and quality assurance layers

**Key Quality Metrics:**
- Cloud-free confidence masks (QF_Cloud: 0=high confidence, 1=low confidence, 2=contaminated)
- Stray light flags (solar/lunar glint contamination)
- Lunar BRDF normalization coefficients (adjusting for moon phase/angle variations)
- Atmospheric correction quality indicators (AOD retrieval status, water vapor flags)

**VNP46A3 (Monthly Composite)**
- Aggregates VNP46A1 observations using gap-filled temporal interpolation
- Provides stable baseline estimates for detecting anomalies in daily data
- Reduces noise from transient cloud edges and residual atmospheric effects

### 4.2.2 Sentinel-2 Multispectral Imagery (Land Cover Context)

**ESA Sentinel-2A/B MSI (Multispectral Instrument)**
- **Spatial Resolution**: 10m (RGB, NIR), 20m (RedEdge, SWIR), 60m (coastal/cirrus)
- **Temporal Revisit**: 5 days (combined constellation)
- **Spectral Bands**: 13 bands covering 443-2190 nm
- **Source**: Copernicus Open Access Hub (Level-2A surface reflectance)
- **Coverage**: Pan-India tiles overlapping VIIRS footprint

**Applications in ALPS:**
- Land cover classification (urban, vegetation, water, bare soil masks)
- Impervious surface fraction estimation via spectral unmixing
- Urban growth tracking (built-up area expansion)
- Validation of VIIRS radiance patterns against daytime land use

### 4.2.3 Landsat 8/9 OLI Thermal and Multispectral

**USGS Landsat 8/9 (Operational Land Imager + Thermal Infrared Sensor)**
- **Spatial Resolution**: 30m (multispectral), 100m (thermal)
- **Temporal Revisit**: 16 days per satellite (8-day combined)
- **Spectral Bands**: 11 bands (coastal aerosol to thermal IR)
- **Source**: USGS EarthExplorer / Google Earth Engine
- **Long-term Archive**: Landsat 5 TM (1984-2013) for historical context

**Key Uses:**
- Urban heat island correlation with light pollution
- Surface temperature-radiance relationship modeling
- Land cover change detection (1984-2025 multi-decadal trends)
- Gap-filling for Sentinel-2 cloudy periods

---

## 4.3 Auxiliary Geospatial Datasets

### 4.3.1 Administrative Boundaries and Population

- **India District Boundaries (2021 Census)**: 742 districts, SHP format with attribute tables
- **Urban Agglomeration Polygons**: 4378 cities/towns >10,000 population
- **Population Density Grids**: WorldPop 100m resolution (2000-2025 annual)
- **Electricity Access Maps**: Ministry of Power district-level electrification statistics

### 4.3.2 Digital Elevation and Terrain

- **SRTM 30m DEM (Shuttle Radar Topography Mission)**: Elevation, slope, aspect
- **ASTER GDEM v3**: Gap-filled global 30m elevation model
- **Applications**: Atmospheric correction for high-altitude regions, shadow masking, terrain-corrected reflectance

### 4.3.3 Meteorological Data

- **NCEP/NCAR Reanalysis**: Cloud cover fraction, aerosol optical depth, precipitable water
- **MODIS Aerosol Products (MOD04)**: Daily 10km AOD at 550nm
- **ERA5 Hourly**: Temperature, wind speed, relative humidity at district centroids

---

## 4.4 Preprocessing Workflows

### 4.4.1 VIIRS Radiance Correction and Masking

**Step 1: Quality Flag Filtering**
```python
# Pseudo-code for VIIRS preprocessing
mask = (QF_Cloud == 0) & (QF_LunarIRR > 0.05) & (Mandatory_QA == 0)
radiance_filtered = radiance * mask  # Apply confidence mask
```

**Filters Applied:**
- Reject pixels with high cloud confidence (QF_Cloud ≥ 2)
- Exclude lunar illumination <5% (phase angle >150°, insufficient BRDF correction)
- Remove solar/lunar glint contamination (stray light flags active)
- Discard saturated pixels (radiance > 0.00015 W·cm⁻²·sr⁻¹ in urban cores)

**Step 2: Atmospheric Correction Validation**
- Cross-check with MODIS AOD: if AOD >1.0 (heavy pollution), apply +15% radiance adjustment
- Compare adjacent clear-sky observations: flag outliers >2.5σ from 7-day rolling median
- Lunar BRDF normalization: ensure phase angle correction coefficients applied correctly

**Step 3: Georeferencing and Reprojection**
- Convert HDF5 sinusoidal projection to WGS84 geographic coordinates
- Reproject to UTM Zone 43N/44N (India-optimized for metric calculations)
- Resample 500m pixels to district-level polygons via zonal statistics (mean, median, std)

### 4.4.2 Sentinel-2 / Landsat Harmonization

**Radiometric Calibration:**
- Apply Sen2Cor atmospheric correction for Sentinel-2 (TOA → surface reflectance)
- Use LEDAPS for Landsat 8/9 (accounting for coastal aerosol band calibration drift)
- Cross-calibrate Sentinel-2 / Landsat using pseudo-invariant targets (Thar Desert sites)

**Spatial Resampling:**
- Aggregate Sentinel-2 10m bands to 500m using cubic convolution (preserves texture statistics)
- Co-register Landsat 30m to VIIRS 500m grid via bilinear resampling
- Ensure pixel alignment using VIIRS lat/lon arrays as reference grid

**Cloud and Shadow Masking:**
- Fmask algorithm for Landsat [133]: combines brightness temperature, NDSI, NDVI thresholds
- Sen2Cor scene classification layer (SCL) for Sentinel-2: reject clouds (SCL=8,9), cloud shadows (SCL=3)
- Temporal gap-filling: linear interpolation between clear observations ≤30 days apart

### 4.4.3 Quality Control Procedures

**Temporal Consistency Checks:**
- Flag districts with <50% valid VIIRS observations per month (exclude monsoon-heavy regions)
- Detect sensor anomalies: sudden jumps >40% in radiance without corresponding land use change
- Validate against VNP46A3 monthly composite: daily deviations >2σ require manual inspection

**Spatial Consistency Validation:**
- Compare district-level radiance with neighboring districts: flag outliers using Moran's I test
- Check radiance-population correlation: R² >0.70 expected for urban districts
- Validate urban core brightness: cross-check with OSM (OpenStreetMap) building footprints

**Cross-Sensor Validation:**
- ISS astronaut photography (nighttime RGB images): qualitative validation of VIIRS hotspots
- Ground-based SQM measurements (Sky Quality Meter): 12 stations across India provide reference sky brightness
- Correlation with electricity consumption: state-level validation against CEA (Central Electricity Authority) statistics

---

## 4.5 Data Fusion and Gap-Filling Strategies

### 4.5.1 Temporal Gap-Filling for Cloudy Periods

**Linear Interpolation (Short Gaps ≤7 days):**
```python
# Example: Fill 3-day gap using adjacent clear observations
radiance_filled = radiance_t-4 + (radiance_t+4 - radiance_t-4) / 8 * 4
```

**Climatological Mean (Medium Gaps 7-30 days):**
- Use 5-year historical average for same calendar month
- Adjust for known trends: apply linear trend coefficient from past 12 months

**Multiple Imputation (Long Gaps >30 days):**
- Train LightGBM model predicting radiance from Sentinel-2 NDVI, population, temperature
- Generate 5 plausible imputations, use median value
- Propagate uncertainty: flag imputed values in downstream analysis

### 4.5.2 Multi-Source Data Fusion

**VIIRS + Sentinel-2 Fusion for Urban Detail:**
- Disaggregate 500m VIIRS radiance to 100m grid using Sentinel-2 built-up index as weights
- Apply area-to-point Kriging with NDBI (Normalized Difference Built-up Index) as covariate
- Validate downscaled product against ISS imagery (30m effective resolution)

**Landsat Thermal Integration:**
- Correlate nighttime radiance with daytime land surface temperature (LST)
- Identify heat islands contributing to radiative forcing (warm surfaces increase skyglow)
- Model radiance as f(LST, NDVI, population) for data-sparse rural districts

---

## 4.6 Analysis-Ready Data Cubes

### 4.6.1 District-Level Time Series (2014-2025)

**Output Format:**
- CSV tables: `district_code, date, radiance_mean, radiance_std, cloud_fraction, qc_flag`
- Temporal resolution: Daily (VNP46A1), monthly (VNP46A3)
- Spatial aggregation: Zonal mean/median within district boundaries

**Derived Metrics:**
- 30-day rolling mean (smoothed trend)
- 365-day rolling std (seasonal variability)
- Year-over-year delta (policy impact detection)

### 4.6.2 Spatial Data Cubes for ML Features

**4D Array Structure:** `(time, lat, lon, features)`
- Time: 4017 daily timestamps (2014-01-01 to 2025-01-01)
- Lat/Lon: 500m VIIRS grid (India bounding box: 6.5°N-37.5°N, 68°E-98°E)
- Features: 28 layers per timestep
  - VIIRS radiance (nW/cm²/sr)
  - Sentinel-2 indices (NDVI, NDBI, NDWI, MNDWI)
  - Landsat LST, elevation, slope
  - Population density, urbanization fraction
  - Cloud fraction, AOD, precipitable water
  - Temporal lags (t-7d, t-30d, t-365d)

**Storage Optimization:**
- Zarr chunked arrays (1 month × 100km × 100km × all features)
- LZ4 compression (3:1 ratio for radiance data)
- Cloud-optimized GeoTIFF for spatial subsets

---

## 4.7 Data Quality Assessment Results

### 4.7.1 Completeness Statistics

- **VIIRS VNP46A1**: 87.3% valid observations (2014-2025 India-wide)
  - Best: Gujarat (94.2%), Rajasthan (93.8%) — low cloud cover
  - Worst: Meghalaya (61.4%), Arunachal Pradesh (65.7%) — monsoon-dominated

- **Sentinel-2**: 76.1% cloud-free observations (2017-2025, <20% cloud cover threshold)
  - Improved to 91.4% after gap-filling with Landsat 8/9

- **District Coverage**: 742/742 districts have ≥50% valid VIIRS months (threshold for ML inclusion)

### 4.7.2 Validation Metrics

- **VIIRS vs. SQM Ground Measurements**: R² = 0.82 (n=12 stations, 2018-2025)
- **VIIRS vs. Electricity Consumption**: State-level R² = 0.89 (2014-2023)
- **Downscaled VIIRS vs. ISS Imagery**: SSIM (Structural Similarity Index) = 0.73 for urban cores

### 4.7.3 Known Limitations

1. **Monsoon Gaps**: Jun-Sep cloud cover reduces daily coverage to 40-60% in Eastern India
2. **Arctic/Subarctic Bias**: VIIRS lunar BRDF correction degrades at >50° latitude (not applicable to India)
3. **Saturation in Mega-Cities**: Delhi/Mumbai cores exceed sensor saturation (~0.00015 W·cm⁻²·sr⁻¹)
4. **Temporal Lag**: VNP46A1 typically available 24-48 hours post-acquisition (limits real-time alerting)

---

**References:**
[133] Zhu Z, Woodcock CE. Object-based cloud and cloud shadow detection in Landsat imagery. Remote Sens Environ 2012;118:83-94.

**Data Availability Statement:**
All preprocessed datasets, quality control scripts, and data cubes are publicly available at [GitHub repository] under CC-BY-4.0 license. Raw VIIRS/Sentinel-2/Landsat archives remain subject to NASA/ESA/USGS terms of use.
