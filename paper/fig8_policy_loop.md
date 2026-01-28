
# Figure 8: ALPS Policy Loop Framework

## Professional Diagram for Word Document

```mermaid
flowchart TD
    subgraph "SENSE Phase (Hourly)"
        A[NASA VIIRS VNP46A1<br/>Satellite Data Ingestion] --> B[Atmospheric Correction<br/>& Cloud Masking]
        B --> C[Spatial Processing<br/>742 Districts]
    end
    
    subgraph "REASON Phase (Daily)"
        C --> D[LightGBM ML Model<br/>R² = 95.2%]
        D --> E[SHAP Feature Analysis<br/>Population Density: 0.32<br/>Energy Consumption: 0.28]
        E --> F{Alert Threshold<br/>Assessment}
        F --> G[F-Component Check<br/>Infrastructure > 68%?]
    end
    
    subgraph "ACT Phase (Real-time)"
        G -->|High Risk| H[Priority Alert<br/>18-36hr Prediction]
        G -->|Normal| I[Standard Monitoring<br/>Continue Cycle]
        H --> J[Municipal Notification<br/>Automated Dashboard]
        J --> K[Policy Intervention<br/>LED Retrofitting/Dimming]
    end
    
    subgraph "LEARN Phase (Monthly)"
        K --> L[Effectiveness Measurement<br/>Population Exposure Metrics]
        L --> M[Threshold Recalibration<br/>Model Retraining]
        M --> N[Policy Loop Update<br/>Demographic Vulnerability]
        I --> O[Baseline Monitoring<br/>Trend Analysis]
    end
    
    N --> A
    O --> A
    
    %% Styling
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style D fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style H fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    style M fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    
    %% Alert flow styling
    style G fill:#fff8e1,stroke:#ff8f00,stroke-width:3px
    style J fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

## Simplified Version for Easy Copy-Paste

**ALPS Policy Loop Framework**

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     SENSE       │ → │     REASON      │ → │      ACT        │ → │     LEARN       │
│                 │    │                 │    │                 │    │                 │
│ • NASA VIIRS    │    │ • LightGBM ML   │    │ • Alert Gen.    │    │ • Threshold     │
│   Satellite     │    │   (R²=95.2%)    │    │   (94.2% acc)   │    │   Recalib.      │
│ • 742 Districts │    │ • SHAP Analysis │    │ • Municipal     │    │ • Model         │
│ • Hourly Data   │    │ • F-Component   │    │   Notification  │    │   Retraining    │
│ • Cloud Mask    │    │   (>68% = Risk) │    │ • LED Control   │    │ • Policy Update │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         ↑                                                                       │
         └───────────────────────── Feedback Loop ──────────────────────────────┘

**Temporal Scales:**
• Real-time: Hourly satellite data ingestion and processing
• Short-term: Daily ML reasoning and alert generation  
• Medium-term: Weekly policy intervention deployment
• Long-term: Monthly learning and threshold optimization

**Key Thresholds:**
• F-Component > 68%: Enhanced monitoring sensitivity
• Population Density > 0.32 SHAP: Priority alert status
• LPI Increase > 23%: Automatic intervention trigger
• Cross-region R² < 93%: Model retraining required

## Academic Caption

**Figure 8. ALPS Policy Loop Framework: Autonomous Sense→Reason→Act→Learn cycle with integrated alert thresholds and policy feedback mechanisms. The system processes NASA VIIRS satellite data through machine learning models (LightGBM) to generate predictive alerts, trigger automated interventions, and continuously update decision thresholds based on policy effectiveness metrics and demographic vulnerability patterns.**

The policy loop operates on three temporal scales: (1) Real-time sensing and alerting (hourly), (2) Medium-term reasoning and intervention (daily), and (3) Long-term learning and adaptation (monthly). Alert thresholds are dynamically adjusted based on F-component dominance levels, with infrastructure-heavy districts (F > 68%) receiving enhanced monitoring sensitivity and accelerated intervention protocols.
