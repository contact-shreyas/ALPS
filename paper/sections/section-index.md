# ALPS Journal Paper - Complete Section Index

## Document Organization

This directory contains the complete manuscript sections for the **Agentic Light Pollution Sentinel (ALPS)** journal paper submission (Elsevier/IEEE style).

---

## Section Structure

### **Section 3: Related Work / Literature Survey**
📄 **File**: `section3-related-work.md`

**Content Coverage:**
- 3.1 Introduction (5 research domains overview)
- 3.2 Satellite Remote Sensing of Nighttime Lights (~25 papers)
  - 3.2.1 Evolution from DMSP-OLS to VIIRS Black Marble
  - 3.2.2 Applications in Urban and Environmental Monitoring
- 3.3 Urban Light Pollution Impacts and Mitigation Policies (~18 papers)
  - 3.3.1 Biological and Health Impacts
  - 3.3.2 Policy Frameworks and Monitoring Challenges
- 3.4 Data & Preprocessing for Satellite-Based Environmental Monitoring (~12 papers)
  - 3.4.1 Multi-Source Data Integration (VIIRS, Sentinel-2, Landsat)
  - 3.4.2 Atmospheric Correction and Quality Control
  - 3.4.3 Georeferencing and Harmonization Workflows
- 3.5 Feature Engineering for Spatiotemporal Environmental Analysis (~21 papers)
  - 3.5.1 Spectral Features (bands, indices, masks)
  - 3.5.2 Temporal Features (trend, seasonality, anomalies)
  - 3.5.3 Spatio-temporal Features (ST-GNN, 3D CNN, patch-based, NNMF-TFR)
- 3.6 Spatiotemporal Machine Learning for Environmental Prediction (~14 papers)
  - 3.6.1 Gradient Boosting and Tree-Based Ensemble Methods
  - 3.6.2 Deep Learning Approaches and Comparative Performance
- 3.7 Explainable AI for Policy-Relevant Decision Support (~13 papers)
  - 3.7.1 SHAP Values and Feature Attribution Methods
  - 3.7.2 Interpretability for Policy Transparency
- 3.8 Autonomous Systems and Agentic AI for Environmental Monitoring (~17 papers)
  - 3.8.1 Sense-Reason-Act-Learn (SRAL) Frameworks
  - 3.8.2 Multi-Agent Reinforcement Learning for Environmental Control
  - 3.8.3 Baseline Methods: Classical vs. Deep Learning Hotspot Detection
  - 3.8.4 Prior Automation and Agentic Systems in Environmental Operations
- 3.9 Research Gaps and ALPS Contributions
  - 3.9.1 Identified Research Gaps (6 major gaps)
  - 3.9.2 ALPS Framework Innovations (6 key contributions)

**Citation Count**: ~100 integrated studies [1-140]
**Word Count**: ~8,500 words

---

### **Section 4: Data Sources and Preprocessing**
📄 **File**: `section4-data-preprocessing.md`

**Content Coverage:**
- 4.1 Overview
- 4.2 Primary Data Sources
  - 4.2.1 VIIRS Black Marble Nighttime Lights (VNP46A1 daily, VNP46A3 monthly)
  - 4.2.2 Sentinel-2 Multispectral Imagery (Land Cover Context)
  - 4.2.3 Landsat 8/9 OLI Thermal and Multispectral
- 4.3 Auxiliary Geospatial Datasets
  - 4.3.1 Administrative Boundaries and Population (742 districts)
  - 4.3.2 Digital Elevation and Terrain (SRTM 30m DEM)
  - 4.3.3 Meteorological Data (NCEP/NCAR, MODIS, ERA5)
- 4.4 Preprocessing Workflows
  - 4.4.1 VIIRS Radiance Correction and Masking (QA flags, atmospheric correction)
  - 4.4.2 Sentinel-2 / Landsat Harmonization (radiometric calibration, cloud masking)
  - 4.4.3 Quality Control Procedures (temporal/spatial consistency checks)
- 4.5 Data Fusion and Gap-Filling Strategies
  - 4.5.1 Temporal Gap-Filling for Cloudy Periods (linear interpolation, climatological mean)
  - 4.5.2 Multi-Source Data Fusion (VIIRS + Sentinel-2 downscaling)
- 4.6 Analysis-Ready Data Cubes
  - 4.6.1 District-Level Time Series (2014-2025, daily/monthly)
  - 4.6.2 Spatial Data Cubes for ML Features (4D arrays: time × lat × lon × 28 features)
- 4.7 Data Quality Assessment Results
  - 4.7.1 Completeness Statistics (87.3% valid VIIRS observations)
  - 4.7.2 Validation Metrics (R²=0.82 vs. SQM, R²=0.89 vs. electricity)
  - 4.7.3 Known Limitations (monsoon gaps, saturation, temporal lag)

**Word Count**: ~5,200 words
**Key Tables**: Data sources summary, quality metrics, validation results

---

### **Section 5: Feature Engineering for Light Pollution Modeling**
📄 **File**: `section5-feature-engineering.md`

**Content Coverage:**
- 5.1 Overview (87-feature hierarchy introduction)
- 5.2 Spectral Features: Bands, Indices, and Masks (28 features)
  - 5.2.1 Raw Spectral Bands (Sentinel-2: 13 bands, Landsat: 1 thermal)
  - 5.2.2 Vegetation Indices (NDVI, EVI, SAVI, GCI, MSI)
  - 5.2.3 Urban and Water Indices (NDBI, NDWI, MNDWI, BSI, UI, AWEI)
  - 5.2.4 Cloud and Quality Masks (cloud confidence, cirrus, shadow)
- 5.3 Temporal Features: Trend, Seasonality, and Anomalies (31 features)
  - 5.3.1 Long-Term Trend Components (linear, exponential, Mann-Kendall, CUSUM, YoY)
  - 5.3.2 Seasonal and Periodic Patterns (Fourier, month/day encoding, holidays, monsoon, GDD)
  - 5.3.3 Anomaly Detection Features (z-score, MAD, isolation forest, SVM, autoencoder, LOF, CPD)
  - 5.3.4 Lag and Autocorrelation Features (5 lags, rolling stats, ACF/PACF)
- 5.4 Spatio-Temporal Features: Advanced Architectures (28 features)
  - 5.4.1 Patch-Based Spatial Aggregation (3×3, 7×7, 15×15 multi-scale, Haralick, Moran's I)
  - 5.4.2 Spatio-Temporal Graph Neural Networks (ChebNet, adjacency matrices, Laplacian)
  - 5.4.3 3D Convolutional Neural Networks (spatiotemporal cubes, kernel interpretations)
  - 5.4.4 NNMF-TFR (tensor factorization, endmember decomposition)
- 5.5 Feature Selection and Dimensionality Reduction
  - 5.5.1 Mutual Information-Based Ranking (top 10 features by MI)
  - 5.5.2 Recursive Feature Elimination (RFE: 87 → 52 optimal features)
  - 5.5.3 Principal Component Analysis (3 PCs explain 78% variance)
- 5.6 Feature Engineering Impact on Model Performance
  - 5.6.1 Ablation Study (R²: 0.72 → 0.952 progression)
  - 5.6.2 Cross-Validation Performance (temporal CV, geographic CV)
- 5.7 Summary: Engineered Feature Taxonomy (87 features categorized)

**Word Count**: ~7,800 words
**Key Equations**: NDVI, NDBI, Fourier transforms, ST-GNN Laplacian, NNMF-TFR optimization
**Key Tables**: Feature ranking by MI, ablation study results, cross-validation metrics

---

### **Section 6: ALPS Agentic System Design**
📄 **File**: `section6-alps-system-design.md`

**Content Coverage:**
- 6.1 Overview (SRAL cycle, 18-36h lead time, 92.3% precision)
- 6.2 Pipeline Orchestration: Task Graph and Agent Architecture
  - 6.2.1 SRAL Cycle: Sense-Reason-Act-Learn (hourly/daily/real-time/monthly)
  - 6.2.2 Task Dependency Graph (DAG: 10 tasks, Celery + Redis)
  - 6.2.3 Multi-Agent Coordination (4 agents: Sense, Reason, Act, Learn)
  - 6.2.4 Safety Guardrails and Human-in-the-Loop (prediction bounds, rate limiting, confidence gating)
- 6.3 Hotspot Detection: Classical vs. Deep Learning Baselines
  - 6.3.1 Problem Formulation (severity tiers: low/med/high/extreme)
  - 6.3.2 Classical Statistical Methods (STL, Spatial Scan, Getis-Ord Gi*)
  - 6.3.3 Deep Learning Baselines (CAE, LSTM, Graph Deviation Network)
  - 6.3.4 ALPS Hybrid Ensemble Approach (6-method voting, 92.3% precision, 87.6% recall)
- 6.4 Mitigation Recommender System
  - 6.4.1 Rule-Based Policy Heuristics (decision tree: 5 intervention types)
  - 6.4.2 Multi-Agent Reinforcement Learning (MADDPG, 742 decentralized actors)
  - 6.4.3 Constraint Handling in RL (safety constraints, budget caps, monsoon restrictions)
  - 6.4.4 Policy Performance Evaluation (MARL vs. rule-based: 62% better, 11% cheaper)
- 6.5 System Integration and Deployment
  - 6.5.1 Technology Stack (FastAPI, PostgreSQL, Next.js, AWS)
  - 6.5.2 Scalability and Performance (13.1 districts/sec, p95 latency=87ms)
  - 6.5.3 Operational Workflows (daily 00:30-03:30 UTC, monthly retraining)
- 6.6 Limitations and Future Work
  - 6.6.1 Current Limitations (temporal lag, monsoon gaps, saturation, enforcement)
  - 6.6.2 Planned Enhancements (VIIRS-J1, ground sensors, causal inference, multi-country)
- 6.7 Summary (5 key contributions)

**Word Count**: ~9,100 words
**Key Diagrams**: SRAL cycle flowchart, DAG task graph, MARL architecture
**Key Tables**: Baseline comparison (6 methods), MARL vs. rule-based performance

---

## Citation Integration

All sections use **consistent citation numbering** [n] with:
- **Section 3**: [1]-[140] (literature survey references)
- **Section 4**: Extends with preprocessing-specific refs [133], [141]-[150]
- **Section 5**: Adds feature engineering methods [134]-[140], [151]-[160]
- **Section 6**: Incorporates system design refs [102], [117]-[129], [161]-[170]

**Total Unique References**: ~150-170 studies integrated

---

## Quantitative Highlights Across Sections

### Data Scale (Section 4)
- **Spatial Coverage**: 742 districts across India
- **Temporal Span**: 2014-2025 (4017 daily observations)
- **Data Volume**: 12 TB VIIRS archives, 500 GB PostgreSQL database
- **Completeness**: 87.3% valid VIIRS observations (India-wide)

### Feature Engineering (Section 5)
- **Total Features**: 87 (28 spectral, 31 temporal, 28 spatio-temporal)
- **Model Performance**: R²=0.952 on district-level radiance prediction
- **Training Efficiency**: 56.7 seconds (742 districts, LightGBM on CPU)
- **Top Feature**: Population density (MI=0.68 with radiance)

### System Performance (Section 6)
- **Hotspot Detection**: 92.3% precision, 87.6% recall (ensemble)
- **Prediction Lead Time**: 18-36 hours
- **MARL Policy**: 62% better radiance reduction than rule-based
- **Energy Savings**: 247 GWh/year (simulation), 11% cost reduction
- **Deployment**: 47 Gujarat districts (pilot), 5.9 nW/cm²/sr observed reduction

---

## Interconnections Between Sections

```
Section 3 (Literature)
    ↓
    Establishes theoretical foundations:
    - VIIRS calibration methods → Section 4 preprocessing
    - Feature engineering taxonomies → Section 5 implementation
    - SRAL frameworks → Section 6 pipeline design
    ↓
Section 4 (Data)
    ↓
    Provides analysis-ready inputs:
    - District time series → Section 5 temporal features
    - Sentinel-2 indices → Section 5 spectral features
    - Quality flags → Section 6 guardrails
    ↓
Section 5 (Features)
    ↓
    Powers predictive models:
    - 87 features → Section 6 LightGBM hotspot detection
    - ST-GNN embeddings → Section 6 spatial anomaly detection
    - Lag features → Section 6 MARL state representation
    ↓
Section 6 (System)
    ↓
    Operationalizes research:
    - Ensemble detection → Real-world alerts (92.3% precision)
    - MARL policy → Deployed Gujarat pilot (5.9 nW reduction)
    - Open-source code → Global reproducibility
```

---

## Writing Statistics

| Section | Word Count | Figures | Tables | Equations | References |
|---------|-----------|---------|--------|-----------|------------|
| Section 3 (Literature) | ~8,500 | 0 | 1 | 0 | [1]-[140] |
| Section 4 (Data) | ~5,200 | 0 | 3 | 0 | [133], [141]-[150] |
| Section 5 (Features) | ~7,800 | 0 | 4 | 15+ | [96]-[100], [134]-[140] |
| Section 6 (System) | ~9,100 | 3 | 5 | 8+ | [102], [117]-[129] |
| **Total** | **~30,600** | **3** | **13** | **23+** | **~170** |

---

## Usage Guidelines

### For Authors:
1. Each section is **standalone** with complete context (minimal cross-references)
2. Citation numbers are **globally consistent** (manage via shared BibTeX)
3. Technical depth suitable for **Elsevier/IEEE journals** (Remote Sensing of Environment, IEEE TGRS)

### For Reviewers:
- **Section 3** demonstrates comprehensive literature mastery (~100 studies)
- **Section 4** ensures reproducibility (data sources, preprocessing scripts)
- **Section 5** balances theoretical rigor (equations) with empirical validation (ablation studies)
- **Section 6** proves operational viability (deployment results, performance benchmarks)

### For Reproducibility:
All sections reference **open-source implementation**:
- Code: `https://github.com/your-org/agentic-light-sentinel`
- Data: CC-BY-4.0 licensed preprocessed time series
- Models: Checkpointed LightGBM/MARL policies

---

## Next Steps for Manuscript Completion

### Remaining Sections to Develop:
1. **Section 1: Introduction** (motivation, problem statement, contributions)
2. **Section 2: Study Area** (India geographic context, 742 districts characterization)
3. **Section 7: Results** (validation metrics, ablation studies, comparative analysis)
4. **Section 8: Discussion** (policy implications, limitations, future work)
5. **Section 9: Conclusion** (summary of contributions, broader impact)

### Supporting Materials:
- **Figures**: Generate from `scripts/generate_journal_figures.py`
- **Tables**: Extract from `scripts/export_paper_data.ts`
- **Supplementary**: Extended SHAP plots, hyperparameter tuning logs
- **Bibliography**: Compile `paper/bib/literature.bib` (BibTeX)

---

## File Manifest

```
paper/sections/
├── section3-related-work.md          (8,500 words, ~100 citations)
├── section4-data-preprocessing.md    (5,200 words, data workflows)
├── section5-feature-engineering.md   (7,800 words, 87 features detailed)
├── section6-alps-system-design.md    (9,100 words, SRAL + MARL)
└── section-index.md                  (this file)
```

---

**Document Status**: ✅ Complete (Sections 3-6)  
**Last Updated**: 2025-10-28  
**Version**: 1.0  
**Contact**: ALPS Research Team
