# Figure 8: ALPS Policy Loop Framework - Word Document Ready

## Copy This Entire Section Below for Word:

---

**Figure 8. ALPS Policy Loop Framework**

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    ALPS AUTONOMOUS CYCLE                     │
                    └─────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
    │     SENSE       │   ──►   │     REASON      │   ──►   │      ACT        │   ──►   │     LEARN       │
    │    (Hourly)     │         │     (Daily)     │         │   (Real-time)   │         │   (Monthly)     │
    │                 │         │                 │         │                 │         │                 │
    │ ▪ NASA VIIRS    │         │ ▪ LightGBM ML   │         │ ▪ Alert Gen.    │         │ ▪ Threshold     │
    │   VNP46A1       │         │   Model         │         │   (94.2% acc)   │         │   Recalibration │
    │ ▪ 742 Districts │         │   (R² = 95.2%)  │         │ ▪ Municipal     │         │ ▪ Model         │
    │ ▪ Cloud Masking │         │ ▪ SHAP Analysis │         │   Dashboard     │         │   Retraining    │
    │ ▪ Atmospheric   │         │ ▪ F-Component   │         │ ▪ LED Control   │         │ ▪ Policy Loop   │
    │   Correction    │         │   Assessment    │         │ ▪ Dimming Ctrl  │         │   Optimization  │
    └─────────────────┘         └─────────────────┘         └─────────────────┘         └─────────────────┘
            ▲                                                                                      │
            │                                                                                      │
            └──────────────────────────── Continuous Feedback Loop ──────────────────────────────┘

                                    ┌─────────────────────────────────────┐
                                    │         DECISION THRESHOLDS         │
                                    │                                     │
                                    │ ▪ F-Component > 68%                 │
                                    │   → Enhanced Monitoring             │
                                    │                                     │
                                    │ ▪ Population Density SHAP > 0.32    │
                                    │   → Priority Alert Status           │
                                    │                                     │
                                    │ ▪ LPI Increase > 23%                │
                                    │   → Automatic Intervention          │
                                    │                                     │
                                    │ ▪ Cross-region R² < 93%             │
                                    │   → Model Retraining Required       │
                                    └─────────────────────────────────────┘
```

**Caption:** ALPS Policy Loop Framework showing the autonomous Sense→Reason→Act→Learn cycle with integrated alert thresholds and policy feedback mechanisms. The system processes NASA VIIRS satellite data through machine learning models (LightGBM) to generate predictive alerts, trigger automated interventions, and continuously update decision thresholds based on policy effectiveness metrics and demographic vulnerability patterns.

The policy loop operates on three temporal scales: (1) Real-time sensing and alerting (hourly), (2) Medium-term reasoning and intervention (daily), and (3) Long-term learning and adaptation (monthly). Alert thresholds are dynamically adjusted based on F-component dominance levels, with infrastructure-heavy districts (F > 68%) receiving enhanced monitoring sensitivity and accelerated intervention protocols.

---

## Alternative Simplified Table Format:

**Table: ALPS Policy Loop Components**

| Phase | Frequency | Key Components | Performance Metrics | Output |
|-------|-----------|----------------|-------------------|--------|
| **SENSE** | Hourly | • NASA VIIRS VNP46A1<br>• 742 Districts<br>• Cloud Masking | • 847,250 observations<br>• 500m spatial resolution | Processed satellite data |
| **REASON** | Daily | • LightGBM ML Model<br>• SHAP Analysis<br>• F-Component Check | • R² = 95.2%<br>• 93.4% transferability<br>• 56.7s training time | Risk assessment & predictions |
| **ACT** | Real-time | • Alert Generation<br>• Municipal Dashboard<br>• LED Control Systems | • 94.2% alert accuracy<br>• 18-36hr prediction<br>• 65% reactive reduction | Policy interventions |
| **LEARN** | Monthly | • Threshold Recalibration<br>• Model Retraining<br>• Policy Optimization | • F > 68% sensitivity<br>• Pop. density SHAP 0.32<br>• Cross-validation R² | Updated parameters |

---

**Key Innovation:** The ALPS framework represents the first autonomous satellite-based environmental monitoring system capable of real-time policy intervention and adaptive threshold management for large-scale light pollution control across 742 administrative districts.

---

## Copy Instructions for Word:
1. Select all text from "Figure 8. ALPS Policy Loop Framework" down to the end
2. Copy (Ctrl+C) 
3. Paste into Word document (Ctrl+V)
4. The ASCII diagram should maintain formatting in Word using Courier New or Consolas font
5. Adjust font size to 10pt for optimal appearance in academic papers
