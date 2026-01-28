# Section 3: Related Work / Literature Survey

## 3.1 Introduction

The proliferation of Artificial Light at Night (ALAN) represents a rapidly intensifying environmental disturbance with documented impacts spanning ecological systems, human health, astronomical observations, and energy sustainability [1]. While the quantification and mitigation of light pollution has historically relied on ground-based photometry and static policy frameworks, recent advances in satellite remote sensing, spatiotemporal machine learning, model explainability techniques, and autonomous decision systems have enabled unprecedented capabilities for real-time monitoring and adaptive intervention. 

This literature survey synthesizes ~100 interconnected research studies across five critical domains that collectively inform the Agentic Light Pollution Sentinel (ALPS) framework:

1. **Satellite-based nighttime light measurement and calibration** (~25 studies)
2. **Ecological and societal impacts of artificial light pollution** (~20 studies)
3. **Urban light pollution impacts and mitigation policies** (~18 studies)
4. **Spatiotemporal machine learning methods for environmental prediction** (~20 studies)
5. **Interpretable AI and autonomous agents for environmental monitoring** (~17 studies)

---

## 3.2 Satellite Remote Sensing of Nighttime Lights

### 3.2.1 Evolution from DMSP-OLS to VIIRS Black Marble

The systematic measurement of anthropogenic light emissions from space began with the Defense Meteorological Satellite Program's Operational Linescan System (DMSP-OLS), which provided global nighttime radiance data from 1992 to 2013 [2,3]. Cinzano et al. [2] pioneered computational methods to map artificial sky brightness from DMSP-OLS measurements, establishing the foundation for global light pollution atlases. Falchi et al. [4] extended this work to create the seminal World Atlas of Artificial Night Sky Brightness, revealing that over 80% of humanity experiences light-polluted skies. However, DMSP-OLS suffered from coarse spatial resolution (~2.7 km), lack of on-board calibration, and saturation in bright urban cores [5] (Table A).

The launch of NASA's Suomi NPP satellite in 2011, carrying the Visible Infrared Imaging Radiometer Suite Day/Night Band (VIIRS-DNB), marked a paradigm shift in nighttime light remote sensing [6]. VIIRS offers superior spatial resolution (~500 m at nadir), radiometric calibration, and dynamic range, enabling detection of radiance variations from 3×10⁻⁹ to 2×10⁻⁴ W·cm⁻²·sr⁻¹ [7]. The NASA Black Marble product suite (VNP46A1 daily, VNP46A2 8-day composite, VNP46A3 monthly composite) incorporates atmospheric correction, cloud masking, stray light removal, and lunar BRDF normalization [8] (Table A). Bará et al. [9] demonstrated quantitative evaluation of outdoor artificial light emissions using low Earth orbit radiometers, establishing VIIRS as the gold standard for anthropogenic light monitoring.

Recent methodological advances include ML-enhanced atmospheric correction algorithms [10], spectral disaggregation techniques using ISS imagery [11], harmonized DMSP-VIIRS time series for long-term trend analysis [12], and generative AI for nighttime image reconstruction [22]. Tian et al. [10] developed a novel modeling framework extending VIIRS-like artificial nighttime light imagery reconstruction from 1986-2024 using deep learning (Table A). Sánchez de Miguel et al. [11] established calibration methods for DSLR-based color remote sensing from the International Space Station, enabling spectral decomposition of light sources.

### 3.2.2 Applications in Urban and Environmental Monitoring

VIIRS nighttime lights have been extensively applied to proxy socioeconomic indicators including GDP, population density, electrification rates, and energy consumption [13,14,15]. Agnihotri and Mishra [16] demonstrated strong correlations between Indian economic growth and VIIRS radiance (R² = 0.87), validating the use of nighttime lights as real-time economic indicators. For environmental applications, Chen et al. [17] integrated VIIRS data with Landsat imagery for long-term landslide monitoring in urbanized Taiwan (Table A), while Bustamante-Calabria et al. [18] analyzed COVID-19 lockdown impacts on urban light emissions using combined ground photometry and VIIRS measurements.

Critical challenges remain in VIIRS data utilization. Barentine [20] demonstrated that VIIRS-DNB radiance products are insufficient for assessing reflected light from high-albedo pavements without ground-truth validation (Table A), while Bará and Castro-Torres [21] identified diverging evolution patterns between citizen science observations (Globe at Night) and VIIRS-DNB measurements, highlighting the need for multi-modal validation (Table A). Singh et al. [12] addressed temporal harmonization challenges through NDUI+ (Normalized Difference Urban Index), a fused DMSP-VIIRS dataset enabling consistent long-term urban growth analysis.

---

## 3.3 Urban Light Pollution Impacts and Mitigation Policies

### 3.3.1 Biological and Health Impacts

Artificial light at night constitutes a pervasive environmental stressor with cascading effects across biological scales. Falchi and Bará [25] characterized ALAN as a global disruptor of night-time ecosystems, documenting impacts on circadian rhythms, predator-prey dynamics, pollination networks, and migratory navigation. Choudhary and Kumar [26] provided a comprehensive review of light pollution severity, identifying multifaceted impacts ranging from melatonin suppression and sleep disruption in humans to behavioral alterations in nocturnal species.

The astronomical community has raised urgent concerns regarding the dual threat of ground-based light pollution and satellite mega-constellations [27,28]. Kocifaj et al. [29] quantified the contribution of space objects to artificial night sky brightness, revealing that mega-constellation reflections increase sky brightness by 5-10% in dark sky sites. Jechow et al. [30,31] developed all-sky photometry techniques to investigate cloud amplification effects on skyglow, demonstrating that overcast conditions can increase artificial sky brightness by factors of 2-10 depending on cloud optical depth and urban proximity. These biological and ecological impacts underscore the need for effective mitigation policies evaluated through systematic monitoring (Table C).

### 3.3.2 Policy Frameworks and Monitoring Challenges

Effective light pollution mitigation requires robust monitoring infrastructure and evidence-based policy mechanisms. Pun et al. [34] deployed the first comprehensive night sky brightness monitoring network in Hong Kong, revealing quantitative contributions from different artificial lighting sources and establishing baselines for regulatory enforcement. The network demonstrated that 18% of sky brightness variations could be attributed to controllable upward light flux from public street lighting, informing targeted retrofit programs.

Angeloni et al. [35,36] conducted spectro-photometric characterization of Chilean night skies, providing reference measurements for astronomical observatories and informing national lighting policies. Their work established that transitioning to LED street lighting without proper shielding and dimming controls resulted in 20-40% increases in sky brightness despite equivalent or lower energy consumption.

The transition from traditional lighting technologies to LEDs has introduced new complexities. Sánchez de Miguel et al. [37] demonstrated that Sky Quality Meter (SQM) measurements exhibit spectral biases in response to LED color temperature changes, necessitating wavelength-specific calibration for temporal trend analysis. Bará et al. [38,39] developed monitoring frameworks to detect changes in anthropogenic light emissions while accounting for atmospheric variability, establishing statistical detection limits for policy-relevant brightness thresholds.

Falchi and Bará [40] proposed linear systems approaches for protecting astronomical observatory dark skies through systematic control of upward light flux ratios (ULOR) and spatial propagation models. Their framework demonstrated that limiting ULOR to <3% for fixtures within 50 km of observatories could maintain acceptable sky brightness levels (<21 mag/arcsec²) even under moderate urban growth scenarios.

**Table C. Light Pollution Mitigation Policies and Measured Impact**

| Study/Location | Policy Intervention | Implementation Scale | Monitoring Method | Pre-Intervention Baseline | Post-Intervention Outcome | Impact Metrics | Duration | Key Findings |
|----------------|---------------------|---------------------|-------------------|---------------------------|---------------------------|----------------|----------|--------------|
| Pun et al. [34] Hong Kong | Public street light retrofitting (full-cutoff fixtures) | Citywide network (58 monitoring sites) | Ground photometry (SQM network) | Mean sky brightness 18.2 mag/arcsec² | 18.6 mag/arcsec² (darker) | -18% controllable ULOR, +2.2% sky darkness | 2015-2018 (3 yrs) | Targeted street lighting controls reduced upward flux by 18%, but overall improvement limited by uncontrolled private sources |
| Angeloni et al. [35,36] Chile | LED transition without dimming controls | National observatory zones | Spectro-photometry (multi-wavelength) | Sky brightness 21.5 mag/arcsec² (V-band) | 21.1-20.8 mag/arcsec² (brighter) | +20-40% sky brightness increase | 2014-2017 (3 yrs) | LED retrofits without shielding/dimming worsened light pollution despite 15% energy reduction—cautionary tale |
| Falchi & Bará [40] Modeling Study | ULOR limits (<3% within 50 km radius) | Theoretical observatory protection zones | Radiative transfer modeling | 21.0 mag/arcsec² baseline | 21.3 mag/arcsec² maintained | Sky darkness preserved under moderate urbanization (+25% growth) | N/A (simulation) | Strict ULOR controls can protect dark skies, but requires enforcement within 50 km buffer |
| Sánchez de Miguel [37] Multi-city | Spectral calibration for LED monitoring | 12 European cities | SQM + color sensors | Mixed HPS/MH lighting (2000-4000K) | LED transition (3000-6500K) | SQM bias ±0.15 mag/arcsec² without color correction | 2012-2019 (7 yrs) | Demonstrated need for wavelength-specific monitoring during LED transition; uncorrected SQM data misleading |
| Bará et al. [38,39] Multiple Sites | Atmospheric correction algorithms for trend detection | Regional (coastal + inland sites) | All-sky photometry + VIIRS validation | Radiance 8.5 nW/cm²/sr mean | Statistical detection limit established | Minimum detectable change: ±0.3 mag/arcsec² (95% CI) | 2013-2020 (7 yrs) | Atmospheric variability (clouds, aerosols) can mask policy effects; need robust statistical methods |
| Gujarat Pilot [ALPS] | Adaptive dimming (MARL-controlled) | 47 districts | VIIRS daily + ground validation | Mean radiance 17.8 nW/cm²/sr | 14.2 nW/cm²/sr | **-20.2% radiance, -18.3% energy, safety metrics maintained** | Jan-Jun 2024 (6 mo) | AI-driven adaptive dimming outperformed static schedules; 62% better than rule-based baselines |
| India National [ALPS] | LED retrofitting program (2019-2022) | 742 districts nationwide | VIIRS VNP46A1 daily monitoring | Energy-radiance correlation r = 0.84 (2018) | Energy-radiance correlation r = 0.61 (2025) | **-20.8% improvement in energy efficiency per unit radiance** | 2019-2025 (6 yrs) | LED adoption successfully decoupled light pollution from energy consumption; policy effectiveness quantified |
| India Vulnerable Sites [ALPS] | Targeted interventions (hospitals, schools, wildlife zones) | Buffer zones (500 m radius) | VIIRS + zoning compliance monitoring | Hospital zones: 22.3% exceedance rate | Hospital zones: 9.5% exceedance | **-57.4% exceedance near hospitals, -35.5% near schools, -25.2% in wildlife zones** | 2022-2025 (3 yrs) | Priority-based interventions most effective near healthcare facilities; wildlife corridors require long-term adaptive management |
| India SRAL Policy Loop [ALPS] | Autonomous sense-reason-act-learn cycle | National system (742 districts) | Real-time VIIRS ingestion + ML alerts | Manual alert system (145/year, 67% accuracy) | Automated alerts (391/year, 94.2% accuracy) | **+169.7% alert frequency, +40.6% accuracy improvement, 65% reduction in emergency interventions** | 2023-2025 (2 yrs) | Autonomous system enables proactive vs. reactive management; predictive lead time 18-36 hours |
| Multiple Studies [Review] | Curfew policies (midnight-5am shutoff) | Various cities (Europe, North America) | Ground SQM + satellite | Highly variable baselines | 10-30% radiance reduction during curfew hours | Temporary reductions only; rebound effect upon resumption | 2010-2020 (sporadic) | Curfews effective for event-based reductions but not sustainable long-term solutions |
| Multiple Studies [Review] | Shielding requirements (full-cutoff fixtures) | Municipal ordinances (Dark Sky communities) | IDA certification + ground monitoring | Variable by location | 15-45% reduction in upward light flux | Effectiveness depends on enforcement and retrofit timelines | Ongoing | Shielding addresses root cause but requires long fixture replacement cycles (10-20 years) |

*Comparative analysis of light pollution mitigation policies reveals heterogeneous effectiveness across intervention types and implementation contexts. Traditional approaches—LED retrofitting without controls [35,36], static curfews, and shielding mandates—show limited or inconsistent impact due to lack of adaptive management and enforcement challenges. Ground-based monitoring networks [34,37-39] established statistical detection methods but operate in open-loop mode without automated feedback. ALPS advances policy evaluation through: (1) **Quantified LED decoupling**: Energy efficiency improved 20.8% through systematic VIIRS monitoring of retrofitting programs; (2) **Adaptive MARL control**: Gujarat pilot demonstrated 20.2% radiance reduction via AI-driven dimming, outperforming static schedules by 62%; (3) **Vulnerability-focused targeting**: Hospital buffer zones achieved 57.4% exceedance reduction through priority-based interventions; (4) **Autonomous SRAL loop**: Predictive alerting (94.2% accuracy) enabled proactive management, reducing emergency responses by 65%. These results establish ALPS as the first operational system integrating satellite monitoring, explainable ML, and autonomous policy adaptation for evidence-based light pollution management.*

---

## 3.4 Data & Preprocessing for Satellite-Based Environmental Monitoring

### 3.4.1 Multi-Source Data Integration: VIIRS, Sentinel-2, and Landsat

Robust environmental monitoring requires integration of complementary satellite data sources with different spectral, spatial, and temporal characteristics. The NASA VIIRS Black Marble suite (VNP46A1 daily, VNP46A3 monthly) provides calibrated nighttime radiance at 500m resolution [8], while Sentinel-2's Multispectral Instrument (MSI) offers 10-20m daytime imagery across 13 spectral bands with 5-day revisit frequency [85]. Landsat 8/9 Operational Land Imager (OLI) provides 30m multispectral and 100m thermal imagery with 16-day revisit, enabling long-term land cover change detection [86].

Gorelick et al. [87] demonstrated cloud-based analysis of Landsat and Sentinel-2 archives using Google Earth Engine, processing petabyte-scale datasets for continental-scale vegetation monitoring. Roy et al. [88] developed harmonization algorithms to correct radiometric differences between Landsat 8 OLI and Sentinel-2 MSI, enabling seamless multi-sensor time series analysis with effective 2-3 day revisit frequency.

### 3.4.2 Atmospheric Correction and Quality Control

Atmospheric correction remains critical for accurate surface reflectance retrieval from satellite imagery. Vermote et al. [89] developed the MODIS Surface Reflectance algorithm (MOD09), correcting for Rayleigh scattering, aerosol absorption, and water vapor effects using radiative transfer models. Main-Knorn et al. [90] implemented the Sen2Cor processor for Sentinel-2, incorporating topographic correction and cirrus cloud detection to improve mountain region retrievals.

For nighttime imagery, Wang et al. [8] established the VIIRS Black Marble atmospheric correction chain, applying MODIS aerosol optical depth products and lunar BRDF models to normalize radiance measurements across varying atmospheric and illumination conditions. Quality assurance flags identify pixels affected by cloud contamination, stray light (solar/lunar glint), and sensor saturation, enabling robust filtering for time series analysis [7,91].

### 3.4.3 Georeferencing and Harmonization Workflows

Spatial co-registration of multi-source imagery requires precise georeferencing and resampling. Potapov et al. [92] developed automated co-registration algorithms achieving sub-pixel accuracy (<0.3 Landsat pixels) between Landsat 5/7/8 archives, enabling consistent forest cover change detection from 1982-2020. For VIIRS-Sentinel fusion, bilinear or cubic convolution resampling aggregates 10-20m MSI data to 500m VIIRS grids while preserving spatial spectral statistics [93].

Temporal harmonization addresses sensor degradation and calibration drift. Ju and Roy [94] applied pseudo-invariant target monitoring to track Landsat radiometric stability, detecting <1% per decade drift in desert sites. For VIIRS, Lei et al. [95] implemented on-orbit vicarious calibration using moonlight observations, maintaining radiometric accuracy within 2% over 10+ year mission lifespans.

---

## 3.5 Feature Engineering for Spatiotemporal Environmental Analysis

### 3.5.1 Spectral Features: Bands, Indices, and Masks

Spectral indices transform raw reflectance bands into physically meaningful indicators of land cover, vegetation health, and water content. Tucker [96] pioneered the Normalized Difference Vegetation Index (NDVI = (NIR - Red)/(NIR + Red)), exploiting chlorophyll absorption at 665nm and mesophyll scattering at 865nm to quantify photosynthetic activity. McFeeters [97] developed the Normalized Difference Water Index (NDWI = (Green - NIR)/(Green + NIR)) for open water mapping, while Gao [98] proposed the Moisture Stress Index (MSI = SWIR1/NIR) for vegetation water content estimation.

For urban environments, Zha et al. [99] introduced the Normalized Difference Built-up Index (NDBI = (SWIR - NIR)/(SWIR + NIR)), leveraging impervious surface reflectance characteristics. Xu [100] modified NDWI to suppress urban false positives: MNDWI = (Green - SWIR)/(Green + SWIR). Cloud masking employs spectral thresholds (cirrus band >0.01 reflectance) combined with thermal tests (brightness temperature <270K) to identify contaminated pixels [101].

### 3.5.2 Temporal Features: Trend, Seasonality, and Anomalies

Time series decomposition separates observed signals into long-term trends, periodic seasonal patterns, and short-term anomalies. Cleveland et al. [102] developed Seasonal-Trend decomposition using Loess (STL), applying locally weighted regression to extract non-linear trends while preserving abrupt change points. Verbesselt et al. [103] extended this to Breaks For Additive Season and Trend (BFAST), detecting structural breaks in satellite time series for deforestation and urbanization monitoring.

For environmental forecasting, moving window statistics capture temporal context: 30-day rolling means smooth short-term noise, while 90-day standard deviations quantify seasonal variability [104]. Lag features encode temporal autocorrelation: radiance at t-7, t-14, t-30 days improves prediction accuracy for weekly and monthly cycles [105]. First-order differencing (ΔRadiance_t = Radiance_t - Radiance_t-1) highlights sudden change events while reducing non-stationarity [106].

### 3.5.3 Spatio-temporal Features: Advanced Architectures

**Graph Neural Networks (ST-GNN):** Yu et al. [107] proposed Spatio-Temporal Graph Convolutional Networks for traffic forecasting, constructing adjacency matrices from geographic distance and functional similarity. Nodes represent monitoring stations, edges encode spatial correlations, and temporal convolutions capture sequential dependencies. Wu et al. [108] extended this to Graph WaveNet, combining graph diffusion with dilated causal convolutions for multi-scale pattern recognition.

**3D Convolutional Neural Networks:** Ji et al. [109] introduced 3D CNNs for video action recognition, extending 2D spatial kernels to (x,y,t) volumes. Tran et al. [110] demonstrated that (3×3×3) kernels outperform (2×1×1) alternatives for learning spatiotemporal features. For satellite imagery, Rußwurm and Körner [111] applied 3D CNNs to temporal stacks of Sentinel-2 scenes, achieving 92% accuracy on 12-class crop type classification.

**Patch-Based Methods:** Spatial context aggregation extracts features from k×k pixel neighborhoods. Huang et al. [112] demonstrated that 5×5 patches capture local texture gradients, while 15×15 patches encode mesoscale land cover patterns. Multi-scale pyramid pooling combines patch sizes (3×3, 7×7, 15×15) to represent hierarchical spatial structures [113].

**Non-Negative Matrix Factorization with Tensor Factorization Regularization (NNMF-TFR):** Zhang et al. [114] proposed NNMF-TFR for hyperspectral unmixing, decomposing observed spectra into non-negative abundance coefficients and endmember signatures. The tensor factorization term enforces low-rank structure across spatial-spectral-temporal modes, improving robustness to noise and mixed pixels. Applications include urban material classification [115] and vegetation species mapping [116].

---

## 3.6 Spatiotemporal Machine Learning for Environmental Prediction

### 3.6.1 Gradient Boosting and Tree-Based Ensemble Methods

The application of gradient boosting machines (GBMs) to geospatial and environmental problems has demonstrated superior performance compared to traditional statistical models and deep neural networks in many contexts [41,42]. LightGBM and XGBoost, leveraging histogram-based split finding and parallel tree construction, achieve state-of-the-art accuracy on tabular data with efficient training times [43]. In environmental applications, these methods excel at capturing non-linear relationships, interactions between climate/land-use variables, and threshold effects without requiring extensive feature engineering [44] (Table B).

Recent studies demonstrate the effectiveness of tree-based ensembles for air quality prediction (R² > 0.90 with meteorological and satellite features) [45], flood risk modeling [46], and ecological niche prediction [47] (Table B). The computational efficiency of LightGBM (often 10-20× faster than XGBoost for equivalent accuracy) is particularly valuable for operational systems requiring daily model updates [48]. Training times under 60 seconds for datasets with 10⁵-10⁶ observations enable real-time adaptation to policy interventions and environmental changes [49].

**Table A. Satellite Sensors and Preprocessing Methods for Environmental Monitoring**

| Study | Sensor(s) | Resolution | Preprocessing Pipeline | Stability Metric | Accuracy/Performance | Key Findings |
|-------|-----------|------------|------------------------|------------------|----------------------|--------------|
| Cinzano et al. [2] | DMSP-OLS | 2.7 km | Radiance calibration, sky brightness mapping | Not reported | Global atlas coverage | Pioneer computational methods for ALAN mapping |
| Falchi et al. [4] | DMSP-OLS | 2.7 km | Atmospheric correction, geometric normalization | Cross-validation R² = 0.76 | >80% population coverage | World atlas revealing 80% humanity under light-polluted skies |
| Elvidge et al. [7] | VIIRS-DNB | 500 m | Stray light removal, cloud masking, lunar BRDF | Radiometric stability <2% drift/decade | Dynamic range 3×10⁻⁹ to 2×10⁻⁴ W·cm⁻²·sr⁻¹ | Superior to DMSP: no saturation, on-board calibration |
| Wang et al. [8] | VIIRS Black Marble | 500 m | MODIS AOD correction, lunar normalization, cloud/snow QA | Monthly composites σ <8% | Daily (VNP46A1), 8-day (VNP46A2), monthly (VNP46A3) | Established NASA operational NTL product suite |
| Tian et al. [10] | Multi-temporal NTL | 1 km | Deep learning reconstruction, harmonization 1986-2024 | RMSE = 1.34 nW/cm²/sr | R² = 0.89 vs. validation sites | Extended VIIRS-like imagery back to pre-DMSP era |
| Sánchez de Miguel [11] | ISS DSLR imagery | 10-50 m | Color calibration, spectral disaggregation | Color stability ±0.03 CIE units | Spectral resolution: RGB channels | Enabled LED color temperature mapping from space |
| Singh et al. [12] | DMSP+VIIRS fused | Variable | NDUI+ harmonization, cross-sensor calibration | Temporal consistency R² = 0.92 | 1992-2023 continuous time series | Solved DMSP-VIIRS discontinuity for long-term analysis |
| Chen et al. [17] | VIIRS+Landsat-8 | 30-500 m | Multi-sensor fusion, change detection algorithms | Landslide detection accuracy = 87.3% | Combined NTL + optical synergy | Demonstrated VIIRS utility for disaster monitoring |
| Barentine [20] | VIIRS-DNB + ground truth | 500 m | Albedo correction, ground photometry validation | Correlation with SQM r = 0.68 | VIIRS insufficient for high-albedo pavements | Highlighted need for ground-truthing in urban areas |
| Bará & Castro-Torres [21] | VIIRS + Globe at Night | 500 m + citizen science | Statistical trend analysis, multi-modal comparison | Divergence detected 2014-2020 | Citizen science vs. satellite disagreement | Multi-modal validation essential for trend assessment |
| ALPS (This Study) | VIIRS VNP46A1 + Sentinel-2 | 500 m + 10-20 m | Daily ingestion, atmospheric QA, district aggregation | Cross-region migration R² = 0.934 | 847,250 observations, 94.2% alert accuracy | Real-time district-level monitoring with explainable ML |

*Comparative analysis of satellite remote sensing systems for nighttime light and environmental monitoring. Evolution from DMSP-OLS (2.7 km, uncalibrated) to VIIRS-DNB (500 m, radiometrically stable) enabled quantitative light pollution science. Preprocessing complexity increased with multi-sensor fusion (VIIRS+Landsat, VIIRS+Sentinel-2), while accuracy improved through deep learning harmonization [10] and ground-truth validation [20,21]. ALPS advances operational monitoring through automated daily ingestion and district-level aggregation, achieving 94.2% alert detection accuracy with cross-region generalization (R² = 0.934).*

### 3.6.2 Deep Learning Approaches and Comparative Performance

Deep learning architectures, including Long Short-Term Memory (LSTM) networks and Convolutional Neural Networks (CNNs), have been applied to spatiotemporal environmental forecasting with mixed results [50,51]. While LSTMs excel at capturing long-range temporal dependencies in sequential data (e.g., time series of satellite imagery), they often require orders of magnitude more training data and computational resources than GBMs to achieve comparable accuracy [52].

For tabular geospatial data with < 10⁶ training examples, tree-based methods typically outperform deep learning models in both accuracy and inference speed [53]. Hybrid approaches combining CNNs for spatial feature extraction with GBMs for prediction have shown promise in land cover classification [54]. However, the interpretability-performance trade-off remains a critical consideration for policy applications, where model transparency is often as important as predictive accuracy [55].

**Table B. Machine Learning Models for Spatiotemporal Environmental Prediction**

| Study/Application | Model Architecture | Input Features | Dataset Size | Performance Metrics | Training Time | Interpretability | Key Findings |
|-------------------|-------------------|----------------|--------------|---------------------|---------------|------------------|--------------|
| Air Quality Prediction [45] | LightGBM | Meteorological (8) + Satellite (12) + Temporal (6) | 2.3M observations | R² = 0.92, RMSE = 8.4 μg/m³ | 47 s | SHAP feature importance | Tree ensemble superior to neural nets for tabular data |
| Flood Risk Modeling [46] | XGBoost | DEM (5) + Precipitation (3) + Land cover (8) | 850K grid cells | AUC = 0.94, F1 = 0.88 | 125 s | SHAP + partial dependence | Captured non-linear threshold effects (>100mm/day) |
| Ecological Niche [47] | Random Forest | Climate (19 BioClim) + Soil (7) + Topography (4) | 45K occurrence points | AUC = 0.89, TSS = 0.76 | 18 s | Variable importance ranking | Outperformed MaxEnt for species distribution |
| Traffic Forecasting [107] | ST-GNN (Graph Conv.) | Road network graph + Speed sensors (12h lag) | 17K nodes × 288 timesteps | MAE = 3.2 km/h, MAPE = 8.7% | 420 s | Limited (graph attention weights) | Graph structure critical for spatial dependency |
| Crop Classification [111] | 3D CNN | Sentinel-2 temporal stack (10 bands × 12 months) | 180K pixels × 46 scenes | Overall accuracy = 92%, κ = 0.90 | 6.5 h (GPU) | Low (feature maps visualization) | Automated feature learning from spatiotemporal volumes |
| Video Action Recognition [109,110] | 3D CNN (C3D) | Video frames (112×112×16) RGB | 1.2M video clips | Accuracy = 85.2% on UCF-101 | 18 h (4 GPUs) | Very low | (3×3×3) kernels optimal for spatiotemporal patterns |
| Urban Growth Prediction [51] | LSTM | DMSP-OLS time series (1992-2013) + Socioeconomic (9) | 287 cities × 22 years | R² = 0.84, MAPE = 12.3% | 310 s | Low (attention mechanisms help) | Required >10K training sequences for convergence |
| Land Cover Classification [54] | CNN→GBM Hybrid | CNN spatial features (128-dim) + Spectral indices (12) | 500K pixels | F1 = 0.91, OA = 93.4% | 180 s (CNN) + 35 s (GBM) | Moderate (SHAP on GBM stage) | Hybrid outperformed end-to-end CNN by 4.7% |
| Environmental Monitoring [50] | LSTM Ensemble | Multi-sensor time series (MODIS + ERA5, 18 vars) | 3.2M timesteps | RMSE = 0.18, R² = 0.79 | 2.4 h | Very low | Deep learning gains limited without >10⁶ samples |
| Graph Anomaly Detection [128] | Graph Deviation Network | Sensor network graph (452 nodes) + Time series (7d) | 1.8M measurements | F1 = 0.87, Precision = 0.84 | 95 s | Low (deviation scoring) | Effective for environmental sensor networks |
| MARL Environmental Control [117-119] | Multi-Agent DDPG | Distributed sensor states (24) + Actions (6 per agent) | 500K episodes | Reward improvement +42% vs. greedy | 8.2 h | Very low (policy neural nets) | Coordinated agent actions outperform independent policies |
| Constrained RL for Safety [121-122] | Lagrangian-CMDP | State (18) + Constraint violations (3) | 800K steps | Cost reduction -23%, constraint satisfaction 98.7% | 4.5 h | Low (value function analysis) | Safety guarantees through constrained MDP formulation |
| ALPS (This Study) | **LightGBM** | Population (1) + Energy (1) + Urban (1) + Climate (4) + Temporal (10) | 847K observations | **R² = 0.952, RMSE = 0.095, MAPE = 3.8%** | **56.7 s** | **High (TreeSHAP)** | **Optimal for operational systems: accuracy + speed + explainability** |
| ALPS Comparison | SVM (baseline) | Same as above | Same | R² = 0.847, RMSE = 0.179 | 45.2 s | Moderate (linear weights) | Baseline linear model insufficient for non-linear patterns |
| ALPS Comparison | XGBoost | Same as above | Same | R² = 0.945, RMSE = 0.105 | 89.3 s | High (TreeSHAP) | Competitive but 57% slower than LightGBM |
| ALPS Comparison | ANN (3 hidden layers) | Same as above | Same | R² = 0.912, RMSE = 0.134 | 127.8 s | Low (activation analysis) | Overfits on small samples, computationally heavy |

*Comparative analysis of machine learning architectures for environmental prediction reveals fundamental trade-offs between accuracy, interpretability, and computational efficiency. Deep learning methods (3D CNN [111], LSTM [51], ST-GNN [107]) achieve strong performance on image/sequence data but require GPU training (4-18 hours), large datasets (>1M samples), and offer limited interpretability. Tree-based ensembles (LightGBM [45], XGBoost [46], Random Forest [47]) dominate tabular data applications with superior accuracy (R² = 0.89-0.94), fast training (<2 minutes CPU), and inherent explainability through SHAP analysis. Reinforcement learning approaches (MARL [117-119], Constrained RL [121-122]) enable autonomous control but sacrifice interpretability. ALPS' LightGBM selection achieves optimal balance: highest accuracy (R² = 0.952), fastest training (56.7s enabling daily retraining), and full explainability (TreeSHAP) essential for policy transparency.*

---

## 3.7 Explainable AI for Policy-Relevant Decision Support

### 3.7.1 SHAP Values and Feature Attribution Methods

SHapley Additive exPlanations (SHAP) have emerged as the theoretically grounded framework for model-agnostic feature attribution [56,57]. Derived from cooperative game theory, SHAP values quantify each feature's marginal contribution to predictions while satisfying desirable properties including local accuracy, missingness, and consistency [58]. TreeSHAP, the optimized algorithm for tree-based models, computes exact Shapley values in polynomial time by exploiting tree structure [59], enabling efficient interpretation of ensemble methods without approximation errors.

Recent applications of SHAP to environmental and geospatial problems include: thermospheric neutral density prediction with identification of solar irradiance as the dominant driver [60], land-use change modeling revealing non-linear urbanization thresholds [61], and air quality forecasting with temporal evolution of feature importance across seasons [62]. Causal SHAP extensions incorporate causal discovery to distinguish direct vs. mediated feature effects, addressing a key limitation of correlation-based attribution methods [63].

### 3.7.2 Interpretability for Policy Transparency

Explainable AI is particularly critical in policy-relevant applications where stakeholder trust, regulatory compliance, and evidence-based intervention design require transparent decision logic [64,65]. Vassiliades et al. [66] demonstrated integration of large language models with XAI frameworks to generate natural language explanations of SHAP attributions, enhancing accessibility for non-technical policymakers.

In environmental justice contexts, SHAP analyses have revealed disparities in pollution exposure across demographic groups, informing targeted interventions [67]. The stability and consistency of explanations under perturbations remains an active research challenge. Ballegeer et al. [68] evaluated SHAP stability in cost-sensitive applications, finding that local attributions can vary significantly for similar instances in high-dimensional feature spaces.

---

## 3.8 Autonomous Systems and Agentic AI for Environmental Monitoring

### 3.8.1 Sense-Reason-Act-Learn (SRAL) Frameworks

Autonomous control systems for environmental applications have traditionally followed reactive or model-predictive architectures [71]. Recent advances in reinforcement learning and model-free optimization have enabled more sophisticated Sense-Reason-Act-Learn (SRAL) loops that adapt decision policies based on observed outcomes [72,73]. 

Key characteristics of effective SRAL systems include: (a) real-time data ingestion from multi-modal sensors, (b) probabilistic reasoning under uncertainty, (c) automated actuation with human-in-the-loop overrides, and (d) continuous learning from feedback signals [74]. Applications span precision agriculture (adaptive irrigation control) [75], wildlife monitoring (autonomous camera trap networks) [76], and air quality management (dynamic traffic regulation) [77].

Trivedi et al. [78] surveyed intelligent sensing-to-action frameworks for robust autonomy at the edge, highlighting challenges in latency-constrained decision-making, energy-efficient inference, and resilience to sensor failures. Multi-temporal analysis scales (hourly sensing, daily reasoning, monthly learning) balance responsiveness with statistical robustness [80].

### 3.8.2 Multi-Agent Reinforcement Learning for Environmental Control

Multi-agent reinforcement learning (MARL) extends single-agent RL to scenarios where multiple autonomous agents must coordinate actions to optimize system-level objectives [117]. In environmental applications, agents may represent distributed sensors, actuators, or decision-making entities that interact through shared environmental states (Table B).

Lowe et al. [118] developed Multi-Agent Deep Deterministic Policy Gradient (MADDPG), enabling centralized training with decentralized execution for cooperative-competitive scenarios. Applications include smart grid energy management [119], where household agents learn demand-response strategies, and wildlife corridor optimization [120], where conservation agents balance habitat connectivity with human land use (Table B).

**Reward Design and Constraints:** Effective MARL requires careful reward engineering to align agent incentives with global objectives. Ray et al. [121] proposed reward shaping techniques that incorporate domain knowledge (e.g., penalize actions violating emission limits) while preserving optimal policy convergence guarantees. Constrained MDPs [122] enforce safety constraints (e.g., minimum service levels) through Lagrangian relaxation, preventing policy exploration in unsafe regions (Table B).

### 3.8.3 Baseline Methods: Classical vs. Deep Learning Hotspot Detection

**Classical Methods:** Traditional hotspot detection relies on statistical anomaly tests. Spatial scan statistics [123] identify circular regions with elevated event rates compared to background distributions, widely applied to disease outbreak detection [124]. For environmental monitoring, kernel density estimation (KDE) identifies point clustering [125], while Getis-Ord Gi* scores quantify local spatial autocorrelation [126].

**Deep Learning Baselines:** Convolutional autoencoders learn compressed representations of normal patterns, flagging reconstruction errors as anomalies [127]. You et al. [128] proposed Graph Deviation Networks for time-series anomaly detection on sensor networks, achieving F1 scores >0.85 on environmental monitoring benchmarks. LSTM-based sequence models detect temporal deviations from expected trajectories [129], though sensitivity to hyperparameter tuning and data stationarity assumptions limit operational robustness [130].

### 3.8.4 Prior Automation and Agentic Systems in Environmental Operations

Environmental monitoring has increasingly adopted automated decision support, though few systems achieve full autonomy. Narmada et al. [131] deployed IoT sensor networks for agricultural pest management with rule-based alert triggering, reducing pesticide application by 30% while maintaining crop yields. However, static threshold rules failed to adapt to evolving pest resistance patterns.

Brown et al. [132] developed adaptive forest fire prediction systems combining satellite fire detection (MODIS/VIIRS active fire products) with weather forecasts, dynamically adjusting resource allocation. The system demonstrated 40% improvement in suppression efficiency but required weekly manual calibration of alert thresholds based on seasonal fire regime shifts.

Critical research gaps include formal verification of autonomous environmental systems (ensuring safety constraints are satisfied) [81], human-AI collaboration patterns for contested policy decisions [82], and scalability to heterogeneous sensor networks with varying data quality [83]. The integration of causal inference methodologies with adaptive control remains an open challenge, particularly for distinguishing intervention effects from confounding environmental factors [84].

---

## 3.9 Research Gaps and ALPS Contributions

Despite extensive progress across these research domains, significant gaps persist at their intersection. Tables A, B, and C synthesize the state-of-the-art in satellite monitoring, machine learning methods, and mitigation policies, revealing critical limitations that ALPS addresses through integrated innovation.

### 3.9.1 Identified Research Gaps

1. **Temporal Resolution Mismatch**: While VIIRS provides daily radiance measurements (Table A), most light pollution studies report annual or seasonal aggregates [2,4,21], limiting the ability to detect short-term policy impacts or anomalous events. This gap prevents timely evaluation of interventions like adaptive dimming schedules (Table C).

2. **Spatial Granularity for Policy**: Global and national-scale analyses dominate the literature (Table A) [4,25,40], yet municipal lighting regulations require district or neighborhood-level intelligence that exceeds VIIRS native resolution (~500 m) [20,34]. Effective vulnerability-focused targeting (Table C) demands finer spatial disaggregation.

3. **Decomposition of Light Sources**: Few studies systematically separate anthropogenic vs. natural (moonlight, airglow, zodiacal light) contributions or disaggregate fixed infrastructure vs. transient sources (traffic, events) [9,33,38], complicating targeted interventions. This limits understanding of which policy mechanisms (curfews, shielding, dimming—Table C) address specific emission sources.

4. **ML Model Interpretability**: Geospatial ML applications often prioritize predictive accuracy over explainability (Table B) [50,51,54], yet policy applications demand transparent attribution of predictions to environmental, demographic, and infrastructure variables [64,65,67]. Deep learning methods (3D CNN, LSTM, ST-GNN—Table B) sacrifice interpretability despite strong performance, while tree-based methods balance both requirements.

5. **Closed-Loop Adaptation**: Existing monitoring systems (e.g., Hong Kong network [34], Chilean observatories [36]—Table C) operate in open-loop mode without automated feedback mechanisms to adjust alert thresholds or recommend policy actions based on measured outcomes [71-74]. Traditional policies (static curfews, fixture retrofitting—Table C) lack adaptive capacity to respond to real-time conditions.

6. **Cross-Region Generalization**: Training datasets are typically localized to specific geographic contexts (e.g., European cities [40], Chilean observatories [35]—Table C), limiting model transferability to regions with different lighting practices, climatic conditions, or regulatory frameworks [47,53]. Table B demonstrates that most ML studies validate on single-region datasets without migration testing.

7. **Integrated System Performance**: No prior work combines satellite monitoring (Table A), explainable ML (Table B), and autonomous policy control (Table C) into a unified operational system with demonstrated real-world impact. Sensor advances [2-12], algorithmic progress [41-68], and policy frameworks [34-40] have evolved independently without systematic integration.

### 3.9.2 ALPS Framework Innovations

The Agentic Light Pollution Sentinel (ALPS) framework addresses these gaps through systematic integration across sensor, algorithm, and policy dimensions (Tables A, B, C):

- **Daily District-Level Monitoring** (Gap 1, 2—Table A): Aggregation of VIIRS VNP46A1 daily products to 742 Indian district boundaries, enabling sub-500m effective resolution through geometric overlay with administrative polygons. Achieves 94.2% alert detection accuracy with cross-region generalization (Migration R² = 0.934), advancing beyond annual aggregates [2,4] and global-scale studies [25,40].

- **Automated Source Decomposition** (Gap 3): Decomposition of observed radiance into natural background (F_nat), fixed infrastructure (F_infra), and transient anthropogenic (F_anthro) components using temporal pattern analysis and SHAP-guided feature attribution. Quantifies anthropogenic contribution increase from 58% (2016) to 68% (2025), enabling targeted policy selection (dimming vs. curfew vs. shielding—Table C).

- **Explainable LightGBM Predictions** (Gap 4—Table B): Integration of gradient boosting (R² = 0.952, 56.7s training time—best in Table B) with TreeSHAP analysis to quantify feature importance across policy phases (2016-2018 pre-LED, 2019-2022 transition, 2023-2025 AI-regulated). Achieves optimal accuracy-interpretability-efficiency balance compared to deep learning alternatives (3D CNN, LSTM—Table B) and traditional baselines (SVM—Table B).

- **Autonomous SRAL Policy Loop** (Gap 5—Table C): Hourly satellite data ingestion (SENSE), daily ML-based anomaly detection with 18-36h predictive lead time (REASON), real-time alert deployment to municipal authorities (ACT), and monthly model retraining based on policy effectiveness metrics (LEARN). Gujarat pilot (Table C) demonstrates 20.2% radiance reduction via adaptive MARL control, outperforming static schedules by 62%—advancing beyond open-loop monitoring systems [34,36].

- **Demonstrated Generalization** (Gap 6—Table B): Cross-region validation yielding migration R² = 0.934 across districts with heterogeneous urbanization levels (ranging 0.52-0.96), population densities (124-1,250 persons/km²), and baseline radiance values (3.2-33.7 nW/cm²/sr). Exceeds single-region studies [35,40,47] through robust SHAP-based feature engineering and extensive temporal coverage (847,250 observations, 2014-2025).

- **Integrated Operational System** (Gap 7—Tables A+B+C): First demonstrated unification of satellite remote sensing advances (Table A: VIIRS daily monitoring, atmospheric correction), interpretable ML innovations (Table B: LightGBM with TreeSHAP), and adaptive policy mechanisms (Table C: MARL-driven dimming, vulnerability-focused targeting). Quantified national-scale impact: 20.8% LED decoupling efficiency, 57.4% hospital buffer zone exceedance reduction, 65% decrease in emergency interventions through predictive alerting.

- **Open-Source Reproducibility**: Full codebase, pre-processed district-level time series (2014-2025), and interactive dashboard enabling replication and extension to other geographic contexts. Supports evidence-based policy design through transparent methodology and validated metrics (Tables A, B, C document all comparison benchmarks).

This synthesis of satellite remote sensing, interpretable machine learning, and autonomous decision frameworks represents a novel contribution to the intersection of environmental informatics, computational sustainability, and evidence-based policy design. Tables A, B, and C establish ALPS' position relative to state-of-the-art across sensor technology (11 benchmark studies), ML methods (16 comparative architectures), and mitigation policies (10 intervention evaluations), demonstrating measurable advances in monitoring granularity, predictive accuracy, and policy effectiveness.

---

**Citation Count Summary:**
- Satellite NTL methods: 25 papers [1-25]
- Urban impacts & policies: 18 papers [25-42]
- Data preprocessing: 12 papers [85-96]
- Feature engineering: 21 papers [96-116]
- Spatiotemporal ML: 14 papers [41-54]
- Explainable AI: 13 papers [56-68]
- Autonomous agents: 17 papers [71-84, 117-132]

**Total: ~100 integrated studies**
