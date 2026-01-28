
## 3.2 Assessing the Importance of Environmental and Anthropogenic Factors on Light-Pollution Intensity via Machine-Learning Models

### 3.2.1 Model Interpretation via SHAP Analysis

**Figure 5. SHAP summary plot showing the relative contribution and polarity of major variables affecting the Light Pollution Index across policy implementation phases (2016-2025). Features are ranked by mean absolute SHAP value, with color indicating feature value magnitude (red=high, blue=low). Each point represents a district observation, with horizontal dispersion showing the range of SHAP values for each feature.**

The Shapley Additive exPlanations (SHAP) analysis reveals significant temporal evolution in factor importance across three distinct policy phases. During the Pre-Smart LED era (2016-2018), energy consumption emerged as the dominant predictor with mean |SHAP| values of 0.31, reflecting traditional inefficient lighting infrastructure. Population density consistently maintained high importance (mean |SHAP| = 0.32) across all phases, confirming urbanization as the primary structural driver of light pollution intensity.


**Table 3: Top 10 Feature Importance Rankings (SHAP Analysis)**

| Rank | Feature | Mean |SHAP| Value | Feature Range | Contribution Type |
|------|---------|------------|---------------|-------------------|
| 1 | Population Density | 0.309 | 483.3 | High Positive |
| 2 | Energy Consumption | 0.273 | 1192.4 | High Positive |
| 3 | Urban Area Index | 0.243 | 0.8 | High Positive |
| 4 | Cloud Cover | 0.214 | 46.3 | High Positive |
| 5 | Industrial Activity | 0.208 | 0.9 | High Positive |
| 6 | Road Lighting Density | 0.206 | 241.8 | High Positive |
| 7 | Traffic Density | 0.189 | 1091.6 | Moderate Positive |
| 8 | Temperature | 0.181 | 25.8 | Moderate Positive |
| 9 | Humidity | 0.153 | 66.0 | Moderate Positive |
| 10 | Seasonal Patterns | 0.099 | 55.7 | Low Positive |


The transition to LED infrastructure (2019-2022) marked a fundamental shift in predictor hierarchies. Energy consumption's influence decreased substantially (mean |SHAP| = 0.24), while policy implementation factors gained prominence (mean |SHAP| = 0.18). This temporal shift demonstrates the effectiveness of large-scale LED retrofitting programs in decoupling light pollution from raw energy consumption patterns.

**Figure 6. Feature importance ranking comparison across policy phases showing the evolution of environmental versus anthropogenic factor dominance. Panel (a) displays Random Forest feature importance scores aggregated by temporal phase. Panel (b) presents cross-validation stability metrics for top-ranking predictors. Panel (c) shows lag effect analysis for environmental variables across seasons.**

### 3.2.2 Temporal Shift in Dominant Drivers

The AI-regulated management phase (2023-2025) introduced novel predictive patterns, with smart infrastructure becoming the leading factor (importance = 0.29). Environmental variables exhibited increased predictive stability, with humidity and cloud cover showing reduced seasonal variance in their SHAP contributions. Temperature lag effects stabilized at 12.3 ± 2.1 days across all districts, enabling more accurate seasonal adjustment algorithms.

Cross-correlation analysis between phases reveals that anthropogenic factors have gained relative importance from 58% (2016-2018) to 68% (2023-2025), while environmental factors decreased from 42% to 32%. This trend reflects the growing dominance of human infrastructure decisions over natural climatic variations in determining light pollution patterns.

### 3.2.3 Feature Importance Ranking and Cross-Validation


**Table 2: Enhanced Machine Learning Model Performance Comparison**

| Model | R² | RMSE | MSE | MAE | MAPE (%) | Max Error | MD | GD | Migration R² | Training Time (s) |
|-------|----|----|-----|-----|----------|----------|----|----|-------------|-------------------|
| Support Vector Machine (SVM) | 0.847 | 0.179 | 0.032 | 0.127 | 8.4 | 0.85 | 0.092 | 1.14 | 0.792 | 45.2 |
| Artificial Neural Network (ANN) | 0.912 | 0.134 | 0.018 | 0.089 | 5.7 | 0.62 | 0.067 | 1.09 | 0.856 | 127.8 |
| XGBoost | 0.945 | 0.105 | 0.011 | 0.072 | 4.2 | 0.48 | 0.053 | 1.06 | 0.918 | 89.3 |
| LightGBM (Optimal) | 0.952 | 0.095 | 0.009 | 0.068 | 3.8 | 0.41 | 0.048 | 1.04 | 0.934 | 56.7 |


The enhanced model evaluation demonstrates LightGBM's superior performance across all metrics, achieving R² = 0.952 with exceptional cross-region generalization (Migration R² = 0.934). The model's low geometric deviation (GD = 1.04) indicates robust performance across diverse district characteristics, from dense metropolitan areas to rural regions with emerging lighting infrastructure.

Mean Absolute Percentage Error (MAPE) analysis reveals model reliability varies by light pollution intensity quartiles. High-intensity districts (>25 nW/cm²/sr) achieve 3.8% MAPE, while moderate-intensity regions (10-25 nW/cm²/sr) show 5.2% MAPE. This performance gradient reflects the model's strength in capturing complex urban lighting patterns compared to sparse rural illumination.

**Figure 7. Factor decomposition analysis showing proportional contributions of environmental versus anthropogenic factors from 2019-2025. Panel (a) displays temporal trends in urbanization indices across major metropolitan regions. Panel (b) presents district-level excess Light Pollution Index percentages. Panel (c) shows stacked percentage contributions with confidence intervals derived from Monte Carlo cross-validation.**


**Table 4: Temporal Factor Decomposition Analysis (2019-2025)**

| Year | Environmental (%) | Anthropogenic (%) | Urbanization Index | Excess LPI (%) |
|------|------------------|-------------------|-------------------|----------------|
| 2019 | 37.3 | 66.4 | 0.891 | 16.9 |
| 2020 | 35.7 | 69.6 | 0.904 | 18.7 |
| 2021 | 28.2 | 71.9 | 0.898 | 21.6 |
| 2022 | 29.9 | 73.4 | 0.944 | 23.2 |
| 2023 | 28.7 | 73.8 | 0.937 | 24.6 |
| 2024 | 26.5 | 73.3 | 0.953 | 24.8 |
| 2025 | 25.0 | 74.4 | 0.991 | 26.4 |


### 3.2.4 Discussion with Dashboard Insights

The ALPS dashboard has processed 847,250 satellite observations, generating 419 automated alerts with 94.2% accuracy in anomaly detection. Real-time hotspot monitoring reveals strong correlation between industrial activity schedules and nocturnal radiance spikes (r = 0.78, p < 0.001), enabling predictive alerting 18-36 hours before peak pollution events.

Energy load correlation analysis demonstrates the decoupling effect of LED adoption: pre-2019 correlation between district energy consumption and radiance was r = 0.84, declining to r = 0.61 by 2025. This 20.8% improvement in energy efficiency per unit radiance represents substantial progress toward sustainable lighting infrastructure.

Humidity and cloud cover effects show complex seasonal interactions. During monsoon periods (June-September), cloud cover reduces observed radiance by 23-31%, but increases atmospheric scattering radius by 15-20%. The ALPS algorithms compensate for these observational biases using meteorological data fusion, achieving weather-corrected radiance estimates with 89.3% accuracy compared to ground-truth measurements.

Temperature lag effects exhibit spatial heterogeneity: coastal districts show 8-10 day temperature-radiance lag correlation, while inland regions demonstrate 14-16 day delays. This variation reflects different thermal mass characteristics and cooling system dependencies, information incorporated into the LightGBM model's spatial feature engineering.

### 3.2.5 Policy Relevance and Model Resilience

The superior performance of ensemble methods (XGBoost R² = 0.945, LightGBM R² = 0.952) compared to traditional approaches (SVM R² = 0.847) reflects their ability to capture non-linear threshold effects in policy interventions. LED retrofitting programs show step-function improvements rather than gradual transitions, patterns better captured by tree-based algorithms than linear models.

Cross-regional validation demonstrates model transferability across diverse geographic and administrative contexts. The Migration R² metric evaluates model performance when trained on one state and tested on another, achieving 93.4% retention for LightGBM versus 79.2% for SVM. This robustness enables national-scale policy optimization using locally-trained models.

The autonomous detection system's 56.7-second training time for LightGBM enables daily model updates incorporating new satellite observations, policy changes, and seasonal adjustments. This adaptive capability positions ALPS as a responsive tool for dynamic environmental management rather than static monitoring.

Seasonal adjustment algorithms reduce false positive rates from 41% to 15% through integration of meteorological data, festival calendars, and industrial scheduling patterns. The system successfully distinguishes between permanent infrastructure changes (urban development, new industrial zones) and temporary events (cultural celebrations, construction activities) with 89.3% accuracy, enabling appropriate policy responses to sustained versus transient light pollution increases.

The resilience of the LightGBM framework to missing data (maintaining R² > 0.90 with up to 25% missing features) ensures operational continuity during satellite outages or sensor malfunctions. This robustness, combined with real-time processing capabilities, establishes ALPS as a reliable foundation for evidence-based light pollution management at national scale.
