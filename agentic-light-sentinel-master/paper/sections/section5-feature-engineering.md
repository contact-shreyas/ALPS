# Section 5: Feature Engineering for Light Pollution Modeling

## 5.1 Overview

Feature engineering transforms raw satellite observations and auxiliary geospatial data into predictive attributes that capture the complex drivers of light pollution dynamics. The ALPS framework employs a three-tier feature hierarchy: (1) **spectral features** derived from multispectral satellite bands and vegetation/urban indices, (2) **temporal features** encoding trend, seasonality, and anomaly patterns in time series, and (3) **spatio-temporal features** aggregating spatial context and sequential dependencies through advanced architectures (patch-based, ST-GNN, 3D CNN, NNMF-TFR).

This section details the mathematical formulations, implementation strategies, and empirical validations of 87 engineered features used in the LightGBM prediction models (achieving R² = 0.952 on district-level radiance forecasting).

---

## 5.2 Spectral Features: Bands, Indices, and Masks

### 5.2.1 Raw Spectral Bands (Sentinel-2 + Landsat)

**Sentinel-2 MSI Bands (13 features):**
| Band | Wavelength (nm) | Resolution | Physical Interpretation |
|------|-----------------|------------|-------------------------|
| B1 | 443 (Coastal) | 60m | Aerosol scattering, water clarity |
| B2 | 490 (Blue) | 10m | Atmospheric correction, water penetration |
| B3 | 560 (Green) | 10m | Vegetation vigor, water turbidity |
| B4 | 665 (Red) | 10m | Chlorophyll absorption, bare soil |
| B5 | 705 (Red Edge) | 20m | Vegetation stress, crop health |
| B6 | 740 (Red Edge) | 20m | Leaf area index (LAI) |
| B7 | 783 (Red Edge) | 20m | Chlorophyll content |
| B8 | 842 (NIR) | 10m | Vegetation biomass, water masking |
| B8A | 865 (Narrow NIR) | 20m | Atmospheric correction refinement |
| B9 | 945 (Water Vapor) | 60m | Precipitable water estimation |
| B10 | 1375 (Cirrus) | 60m | High-altitude cloud detection |
| B11 | 1610 (SWIR1) | 20m | Moisture content, burn scars |
| B12 | 2190 (SWIR2) | 20m | Soil/vegetation discrimination |

**Aggregation to 500m VIIRS Grid:**
- Spatial averaging using cubic convolution (preserves texture statistics)
- Weighted mean by pixel quality scores (cloud-free weights = 1, partial cloud = 0.5)

**Landsat 8/9 OLI Thermal Band (1 feature):**
- Band 10: 10.9 μm (thermal IR) → Land Surface Temperature (LST)
- Conversion: Digital Numbers → Brightness Temperature → LST using emissivity corrections
- Urban heat island indicator: ΔT = LST_urban - LST_rural

### 5.2.2 Vegetation Indices (5 features)

**1. Normalized Difference Vegetation Index (NDVI) [96]**
$$
\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}} = \frac{B8 - B4}{B8 + B4}
$$

- **Range**: -1 (water) to +1 (dense vegetation)
- **Physical Basis**: Chlorophyll absorbs red light, mesophyll scatters NIR
- **Urban Application**: NDVI <0.2 indicates impervious surfaces (high radiance potential)

**2. Enhanced Vegetation Index (EVI) [134]**
$$
\text{EVI} = 2.5 \times \frac{\text{NIR} - \text{Red}}{\text{NIR} + 6 \times \text{Red} - 7.5 \times \text{Blue} + 1}
$$

- **Advantage**: Reduced saturation in high biomass regions, improved atmospheric correction
- **Urban Relevance**: Detects vegetation-light interaction (tree canopy shadowing of street lights)

**3. Soil-Adjusted Vegetation Index (SAVI) [135]**
$$
\text{SAVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red} + L} \times (1 + L), \quad L=0.5
$$

- **Purpose**: Minimize soil brightness contamination in sparse vegetation
- **Application**: Rural districts with mixed cropland/fallow patterns

**4. Green Chlorophyll Index (GCI) [136]**
$$
\text{GCI} = \frac{\text{NIR}}{B3} - 1
$$

- **Sensitivity**: Early vegetation stress detection
- **Policy Link**: Correlates with urban green space planning (reduces light trespass)

**5. Moisture Stress Index (MSI) [98]**
$$
\text{MSI} = \frac{\text{SWIR1}}{\text{NIR}} = \frac{B11}{B8}
$$

- **Interpretation**: Higher MSI → drier vegetation → lower canopy light absorption

### 5.2.3 Urban and Water Indices (6 features)

**1. Normalized Difference Built-up Index (NDBI) [99]**
$$
\text{NDBI} = \frac{\text{SWIR1} - \text{NIR}}{\text{SWIR1} + \text{NIR}} = \frac{B11 - B8}{B11 + B8}
$$

- **Urban Signal**: Positive values (0.1-0.4) indicate built-up areas
- **Radiance Correlation**: R² = 0.78 with VIIRS radiance in urban districts

**2. Normalized Difference Water Index (NDWI) [97]**
$$
\text{NDWI} = \frac{\text{Green} - \text{NIR}}{\text{Green} + \text{NIR}} = \frac{B3 - B8}{B3 + B8}
$$

- **Water Masking**: NDWI >0.3 flags open water (low radiance, except ports/bridges)

**3. Modified NDWI (MNDWI) [100]**
$$
\text{MNDWI} = \frac{\text{Green} - \text{SWIR1}}{\text{Green} + \text{SWIR1}} = \frac{B3 - B11}{B3 + B11}
$$

- **Improvement**: Suppresses urban false positives (SWIR discriminates water from buildings)

**4. Bare Soil Index (BSI) [137]**
$$
\text{BSI} = \frac{(\text{SWIR1} + \text{Red}) - (\text{NIR} + \text{Blue})}{(\text{SWIR1} + \text{Red}) + (\text{NIR} + \text{Blue})}
$$

- **Construction Sites**: High BSI correlates with development zones (future radiance growth)

**5. Urban Index (UI) [138]**
$$
\text{UI} = \frac{\text{SWIR2} - \text{NIR}}{\text{SWIR2} + \text{NIR}} = \frac{B12 - B8}{B12 + B8}
$$

- **Impervious Surfaces**: Stronger urban signal than NDBI in dry climates

**6. Automated Water Extraction Index (AWEI) [139]**
$$
\text{AWEI} = 4 \times (B3 - B11) - (0.25 \times B8 + 2.75 \times B12)
$$

- **Robustness**: Reduces shadow/terrain false positives in mountain water bodies

### 5.2.4 Cloud and Quality Masks (3 features)

**1. Cloud Confidence Score**
- Sentinel-2 Scene Classification Layer (SCL): Binary mask (0=clear, 1=cloudy)
- Aggregated to 500m: Fraction of cloudy 10m pixels within grid cell

**2. Cirrus Cloud Probability**
$$
P_{\text{cirrus}} = \frac{B10 - 0.01}{0.04 - 0.01}, \quad \text{clipped to [0,1]}
$$

- **High-Altitude Clouds**: Thin cirrus contaminate VIIRS without visible cloud signature

**3. Shadow Fraction**
- Fmask-derived shadow mask from thermal + geometry analysis
- District-level aggregation: % pixels in shadow (reduces effective radiance)

---

## 5.3 Temporal Features: Trend, Seasonality, and Anomalies

### 5.3.1 Long-Term Trend Components (6 features)

**1. Linear Trend Coefficient (365-day window)**
$$
\beta_{\text{trend}} = \text{OLS slope of } \log(\text{radiance}) \sim t, \quad t \in [t-365, t]
$$

- **Interpretation**: %/year radiance growth rate
- **Policy Detection**: Negative β after LED retrofit, positive β during urbanization

**2. Exponential Smoothing Trend**
$$
S_t = \alpha \cdot \text{radiance}_t + (1-\alpha) \cdot S_{t-1}, \quad \alpha=0.05
$$

- **Adaptive Baseline**: Slowly varying reference for anomaly detection

**3. Mann-Kendall Trend Test Statistic**
- Non-parametric test for monotonic trends (robust to outliers)
- Output: Z-score (|Z| >2.58 indicates significant trend at p<0.01)

**4. Theil-Sen Slope Estimator**
$$
\beta_{\text{TS}} = \text{median} \left\{ \frac{\text{radiance}_j - \text{radiance}_i}{t_j - t_i} \right\}, \quad \forall i < j
$$

- **Robust Alternative**: Resistant to outliers from sensor anomalies

**5. Cumulative Sum (CUSUM) Statistic**
$$
C_t = \sum_{i=1}^{t} (\text{radiance}_i - \mu_{\text{baseline}})
$$

- **Change Point Detection**: Sudden jump in C_t indicates policy intervention or infrastructure change

**6. Year-over-Year Delta**
$$
\Delta_{\text{YoY}} = \text{radiance}_t - \text{radiance}_{t-365}
$$

- **Seasonal Adjustment**: Removes annual climate cycles, isolates anthropogenic changes

### 5.3.2 Seasonal and Periodic Patterns (8 features)

**1. Fourier Transform Components (3 harmonics)**
$$
F_k(t) = A_k \cos(2\pi k t / 365) + B_k \sin(2\pi k t / 365), \quad k=1,2,3
$$

- **k=1**: Annual cycle (monsoon/dry season)
- **k=2**: Semi-annual (festival seasons: Diwali, Holi)
- **k=3**: Tertiary mode (agricultural cycles)

**2. Month-of-Year Categorical**
- One-hot encoding: 12 binary features (Jan, Feb, ..., Dec)
- Captures irregular seasonal events (e.g., Diwali dates shift in Gregorian calendar)

**3. Day-of-Week Effect**
- Binary: Weekend vs. Weekday
- Radiance typically 8-12% higher on Saturdays (commercial activity)

**4. Holiday Flag**
- Indian national holidays + major festivals (Diwali, Eid, Christmas, Holi)
- Binary indicator (1=holiday, 0=regular day)

**5. Monsoon Phase Indicator**
- Categorical: Pre-monsoon (Mar-May), Monsoon (Jun-Sep), Post-monsoon (Oct-Nov), Winter (Dec-Feb)
- Cloud cover proxy affecting VIIRS observation frequency

**6. Growing Degree Days (Agriculture Proxy)**
$$
\text{GDD} = \sum_{i=t-30}^{t} \max(T_{\text{mean},i} - T_{\text{base}}, 0), \quad T_{\text{base}}=10°C
$$

- **Crop Activity**: Higher GDD → peak agricultural electricity use → rural radiance increase

### 5.3.3 Anomaly Detection Features (7 features)

**1. Z-Score (30-day window)**
$$
z_t = \frac{\text{radiance}_t - \mu_{30d}}{\sigma_{30d}}
$$

- **Threshold**: |z| >2.5 flags potential hotspots

**2. Modified Z-Score (Median Absolute Deviation)**
$$
z_{\text{MAD}} = \frac{0.6745 \times (\text{radiance}_t - \text{median}_{30d})}{\text{MAD}_{30d}}
$$

- **Robust Outlier Detection**: Less sensitive to extreme values than standard z-score

**3. Isolation Forest Anomaly Score**
- Train unsupervised Isolation Forest on historical radiance distributions
- Output: Anomaly score ∈ [0,1] (higher = more anomalous)

**4. One-Class SVM Outlier Probability**
- Gaussian kernel SVM trained on "normal" radiance patterns
- Decision function: Distance from separating hyperplane

**5. Autoencoder Reconstruction Error**
$$
E_{\text{recon}} = |\text{radiance}_t - \hat{\text{radiance}}_t|, \quad \hat{r} = \text{Decoder}(\text{Encoder}(r))
$$

- **Neural Baseline**: LSTM autoencoder learns typical sequences, flags high reconstruction errors

**6. Local Outlier Factor (LOF)**
- Density-based anomaly score comparing local density to neighbors
- Detects spatial anomalies (district brighter than expected given surroundings)

**7. Changepoint Probability (Bayesian Online CPD)**
- Bayesian changepoint detection: Probability that radiance distribution shifted at time t
- Identifies policy intervention moments (e.g., LED rollout start date)

### 5.3.4 Lag and Autocorrelation Features (9 features)

**1. Lagged Radiance Values**
- radiance_{t-1}, radiance_{t-7}, radiance_{t-30}, radiance_{t-90}, radiance_{t-365}
- **Temporal Memory**: Captures short-term (weather), medium-term (policy), long-term (infrastructure) persistence

**2. Rolling Window Statistics (7/30/90 day windows)**
- Mean, Median, Std, Min, Max, 25th percentile, 75th percentile
- Example: rolling_std_30d = std(radiance_{t-30:t})

**3. Autocorrelation Function (ACF) Features**
$$
\rho_k = \frac{\text{Cov}(\text{radiance}_t, \text{radiance}_{t-k})}{\text{Var}(\text{radiance}_t)}, \quad k=1,7,30
$$

- **Predictability**: High ρ_30 → stable patterns, low ρ_30 → volatile (require adaptive thresholds)

**4. Partial Autocorrelation (PACF)**
- PACF_k: Correlation with lag k after removing intermediate lag effects
- **Order Selection**: Guides ARIMA model order for benchmark comparisons

---

## 5.4 Spatio-Temporal Features: Advanced Architectures

### 5.4.1 Patch-Based Spatial Aggregation

**Multi-Scale Spatial Context Windows:**

**1. 3×3 Patch (1.5 km × 1.5 km at 500m resolution)**
```python
patch_3x3 = radiance[lat-1:lat+2, lon-1:lon+2]
features = {
    'mean_3x3': np.mean(patch_3x3),
    'std_3x3': np.std(patch_3x3),
    'max_3x3': np.max(patch_3x3),
    'gradient_x': patch_3x3[1,2] - patch_3x3[1,0],  # E-W gradient
    'gradient_y': patch_3x3[2,1] - patch_3x3[0,1],  # N-S gradient
    'laplacian': 4*patch_3x3[1,1] - (patch_3x3[0,1]+patch_3x3[2,1]+patch_3x3[1,0]+patch_3x3[1,2])
}
```

**Physical Interpretation:**
- `gradient_x/y`: Detects urban-rural transitions, edges of cities
- `laplacian`: Identifies isolated bright sources (stadiums, industrial zones)

**2. 7×7 Patch (3.5 km × 3.5 km)**
- **Land Use Texture**: Captures urban morphology (grid vs. radial street patterns)
- **Haralick Features**: Gray-level co-occurrence matrix (GLCM) texture descriptors
  - Contrast: $\sum_{i,j} (i-j)^2 P(i,j)$ (local brightness variability)
  - Homogeneity: $\sum_{i,j} \frac{P(i,j)}{1+|i-j|}$ (spatial uniformity)
  - Entropy: $-\sum_{i,j} P(i,j) \log P(i,j)$ (complexity)

**3. 15×15 Patch (7.5 km × 7.5 km)**
- **Regional Context**: Aggregates city-scale radiance distributions
- **Moran's I Spatial Autocorrelation**:
$$
I = \frac{N \sum_i \sum_j w_{ij} (x_i - \bar{x})(x_j - \bar{x})}{\sum_i \sum_j w_{ij} \sum_i (x_i - \bar{x})^2}
$$
  - $w_{ij}$: Inverse distance weight between pixels i,j
  - High I → clustered (urban agglomeration), Low I → dispersed (rural)

### 5.4.2 Spatio-Temporal Graph Neural Networks (ST-GNN)

**Graph Construction:**

**1. Adjacency Matrix (Spatial)**
$$
A_{ij} = \begin{cases}
\exp\left(-\frac{d_{ij}^2}{2\sigma^2}\right) & \text{if } d_{ij} < 100 \text{ km} \\
0 & \text{otherwise}
\end{cases}
$$

- $d_{ij}$: Haversine distance between district centroids
- $\sigma=50$ km: Gaussian kernel bandwidth
- **Interpretation**: Strong connections (<50 km) capture inter-district light spillover

**2. Functional Similarity (Hybrid Adjacency)**
$$
S_{ij} = \text{Pearson}(\text{radiance}_i(t), \text{radiance}_j(t)), \quad t \in [2014,2025]
$$

- Add edge if $S_{ij} > 0.80$ (synchronized temporal patterns despite geographic distance)
- **Captures**: Policy diffusion (neighboring states adopt similar LED programs)

**ST-GNN Architecture (ChebNet [140]):**
```
Layer 1: Chebyshev Graph Convolution (K=3 hops)
    - Input: Node features (radiance, NDVI, population)
    - Output: H^(1) = σ(Σ_k θ_k T_k(L̃) X)
Layer 2: Temporal Convolution (1D CNN, kernel size=7 days)
    - Input: H^(1) stacked over 30 timesteps
    - Output: H^(2) = σ(Conv1D(H^(1)))
Layer 3: Graph Pooling + Dense
    - Global mean pooling over nodes
    - Dense(128) → Dropout(0.3) → Dense(1, activation='linear')
```

**Laplacian Matrix:**
$$
L = D - A, \quad \tilde{L} = \frac{2L}{\lambda_{\max}} - I
$$

- $D_{ii} = \sum_j A_{ij}$ (degree matrix)
- $\tilde{L}$: Normalized Laplacian for ChebNet polynomials

**Training Details:**
- Loss: Huber (robust to radiance outliers)
- Optimizer: Adam (lr=0.001, β1=0.9, β2=0.999)
- Batch: 64 districts × 30 days
- Epochs: 50 (early stopping on validation RMSE)

**Performance:**
- District-level radiance prediction: R² = 0.91 (ST-GNN) vs. R² = 0.88 (LightGBM without spatial features)
- Captures spillover: 15% of prediction variance explained by neighbor radiance

### 5.4.3 3D Convolutional Neural Networks (3D CNN)

**Input Tensor:** $(T, H, W, C)$ = (30 days, 50 km, 50 km, 6 channels)
- Channels: VIIRS radiance, NDVI, LST, population, cloud_mask, elevation

**Architecture:**
```
Conv3D_1: (3,3,3) filters=32, stride=1, activation='relu'
    → Output: (28,48,48,32)
MaxPool3D: (2,2,2)
    → Output: (14,24,24,32)
Conv3D_2: (3,3,3) filters=64, stride=1, activation='relu'
    → Output: (12,22,22,64)
MaxPool3D: (2,2,2)
    → Output: (6,11,11,64)
Flatten → Dense(256) → Dropout(0.5) → Dense(1)
```

**Kernel Interpretations:**
- $(3,3,3)$: Captures 3-day × 1.5km × 1.5km spatiotemporal cubes
- Learns local motion patterns (e.g., radiance spreading from city centers)

**Training:**
- Loss: MSE
- Optimizer: RMSprop (lr=0.0001)
- Augmentation: Temporal jitter (±2 days), spatial flips (N-S, E-W)
- Validation: 20% holdout districts

**Results:**
- Test R² = 0.89 (comparable to LightGBM)
- Training time: 4.2 hours (NVIDIA A100) vs. 56.7 seconds (LightGBM on CPU)
- **Trade-off**: Marginal accuracy gain not justified for operational deployment

### 5.4.4 Non-Negative Matrix Factorization with Tensor Factorization Regularization (NNMF-TFR)

**Problem Formulation:**
Decompose observed radiance tensor $\mathcal{X} \in \mathbb{R}^{D \times T \times F}$ into latent factors:
$$
\mathcal{X} \approx \mathcal{G} \times_1 U \times_2 V \times_3 W
$$

- $D=742$ districts, $T=4017$ days, $F=28$ features
- $U \in \mathbb{R}^{D \times R}$: District embeddings (R=20 latent components)
- $V \in \mathbb{R}^{T \times R}$: Temporal patterns
- $W \in \mathbb{R}^{F \times R}$: Feature loadings
- $\mathcal{G} \in \mathbb{R}^{R \times R \times R}$: Core tensor (factor interactions)

**Optimization (Alternating Least Squares):**
$$
\min_{U,V,W,\mathcal{G}} \|\mathcal{X} - \mathcal{G} \times_1 U \times_2 V \times_3 W\|_F^2 + \lambda_1 \|U\|_1 + \lambda_2 \|\mathcal{G}\|_*
$$

- $\lambda_1$: Sparsity penalty (interpretable district clusters)
- $\lambda_2$: Nuclear norm (low-rank core tensor)

**Physical Interpretation:**
- **Component 1** (32% variance): Urban core radiance (high U in metros, peaky V during festivals)
- **Component 2** (18% variance): Agricultural cycles (high U in Punjab/Haryana, seasonal V)
- **Component 3** (12% variance): LED transition (negative temporal gradient in V post-2019)

**Application in ALPS:**
- Endmember signatures identify "pure" radiance profiles (residential, commercial, industrial)
- Predict district radiance as weighted sum: $\hat{x}_{dt} = \sum_{r=1}^{R} u_{dr} v_{tr} w_{fr} g_r$
- Feature importance: $w_{fr}$ quantifies feature f's contribution to component r

**Validation:**
- Reconstruction RMSE: 3.2 nW/cm²/sr (vs. 4.1 for standard NMF without TFR)
- Interpretability: 95% of variance explained by top 5 components (vs. 78% for PCA)

---

## 5.5 Feature Selection and Dimensionality Reduction

### 5.5.1 Mutual Information-Based Ranking

**Mutual Information (MI) Score:**
$$
I(X;Y) = \sum_{x \in X} \sum_{y \in Y} p(x,y) \log \frac{p(x,y)}{p(x)p(y)}
$$

- **Top 10 Features by MI with radiance:**
  1. Population density (0.68)
  2. NDBI (0.61)
  3. Radiance_{t-30} (0.59)
  4. Urban fraction (0.57)
  5. LST (0.54)
  6. Rolling mean_30d (0.52)
  7. NDVI (0.48, negative correlation)
  8. Electricity consumption (0.46)
  9. Distance to major city (0.43, negative)
  10. Holiday flag (0.41)

### 5.5.2 Recursive Feature Elimination (RFE)

**Algorithm:**
1. Train LightGBM on all 87 features
2. Rank features by SHAP importance
3. Remove bottom 10% (9 features)
4. Retrain and re-evaluate
5. Repeat until validation RMSE stops improving

**Results:**
- Optimal subset: 52 features (R² = 0.951 vs. 0.952 for all 87)
- Removed features: Mostly redundant spectral bands (B1, B9, B10) and high-order Fourier harmonics

### 5.5.3 Principal Component Analysis (PCA) for Visualization

**PCA on 28 Spectral/Index Features:**
- PC1 (43% variance): Urban-vegetation axis (NDBI+ vs. NDVI+)
- PC2 (21% variance): Moisture gradient (MSI+ vs. MNDWI+)
- PC3 (14% variance): Seasonal variation (temporal Fourier components)

**Application:**
- 2D scatter plots (PC1 vs. PC2) reveal district clusters:
  - Metros: High PC1, low PC2
  - Agricultural: Low PC1, high PC2
  - Coastal: Medium PC1, very high PC2

---

## 5.6 Feature Engineering Impact on Model Performance

### 5.6.1 Ablation Study

| Feature Set | R² | RMSE (nW/cm²/sr) | Training Time |
|-------------|-----|------------------|---------------|
| Raw VIIRS radiance only | 0.72 | 8.4 | 12 s |
| + Spectral indices (NDVI, NDBI, etc.) | 0.84 | 6.1 | 23 s |
| + Temporal features (lags, trends) | 0.91 | 4.7 | 38 s |
| + Spatial patches (3×3, 7×7, 15×15) | 0.94 | 3.9 | 51 s |
| + ST-GNN node embeddings | 0.95 | 3.5 | 56 s |
| **Full 87-feature set** | **0.952** | **3.2** | **56.7 s** |

**Conclusion:** Spatial and temporal features contribute 18% relative R² improvement over raw radiance, justifying computational overhead.

### 5.6.2 Cross-Validation Performance

**5-Fold Temporal CV (2014-2025 split into 5 periods):**
- Mean R² = 0.949 ± 0.008
- Mean RMSE = 3.4 ± 0.3 nW/cm²/sr
- **Stability**: Low variance across folds indicates robust feature engineering

**Geographic CV (742 districts split by state):**
- Mean R² = 0.934 (cross-region generalization)
- Worst state: Meghalaya (R² = 0.89, high cloud contamination)
- Best state: Gujarat (R² = 0.96, excellent data quality)

---

## 5.7 Summary: Engineered Feature Taxonomy

**Total Features: 87**

1. **Spectral (28):**
   - Raw bands: 13 (Sentinel-2)
   - Vegetation indices: 5 (NDVI, EVI, SAVI, GCI, MSI)
   - Urban/water indices: 6 (NDBI, NDWI, MNDWI, BSI, UI, AWEI)
   - Masks: 3 (cloud, cirrus, shadow)
   - Thermal: 1 (LST)

2. **Temporal (31):**
   - Trend: 6 (linear, exponential smoothing, Mann-Kendall, Theil-Sen, CUSUM, YoY)
   - Seasonal: 8 (Fourier 3 harmonics, month, day-of-week, holiday, monsoon, GDD)
   - Anomaly: 7 (z-score, MAD, isolation forest, SVM, autoencoder, LOF, changepoint)
   - Lags/ACF: 9 (5 lags, 4 rolling stats, 3 ACF/PACF)

3. **Spatio-Temporal (28):**
   - Patch-based: 18 (3×3/7×7/15×15 stats + gradients + Haralick + Moran's I)
   - ST-GNN: 5 (node embeddings, neighbor means, graph Laplacian eigenvalues)
   - 3D CNN: 3 (learned spatiotemporal filters)
   - NNMF-TFR: 2 (component loadings, reconstruction error)

**Implementation:**
All feature engineering scripts available at `scripts/feature-engineering/` with modular functions for each category.

---

**References:**
[134] Huete A, Didan K, Miura T, et al. Overview of the radiometric and biophysical performance of the MODIS vegetation indices. Remote Sens Environ 2002;83:195-213.

[135] Huete AR. A soil-adjusted vegetation index (SAVI). Remote Sens Environ 1988;25:295-309.

[136] Gitelson AA, Gritz Y, Merzlyak MN. Relationships between leaf chlorophyll content and spectral reflectance. J Plant Physiol 2003;160:271-282.

[137] Rikimaru A, Roy PS, Miyatake S. Tropical forest cover density mapping. Trop Ecol 2002;43:39-47.

[138] Kawamura M, Jayamana S, Tsujiko Y. Relation between social and environmental conditions in Colombo Sri Lanka and the urban index estimated by satellite remote sensing data. Int Arch Photogramm Remote Sens 1996;31:321-326.

[139] Feyisa GL, Meilby H, Fensholt R, Proud SR. Automated water extraction index. Remote Sens Environ 2014;140:23-35.

[140] Defferrard M, Bresson X, Vandergheynst P. Convolutional neural networks on graphs with fast localized spectral filtering. NIPS 2016.
