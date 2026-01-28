"""
Generate Figure 3: ALPS Autonomous Sense-Reason-Act-Learn Framework
Four-phase policy loop with temporal scales and performance indicators
"""

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Rectangle, Wedge
import numpy as np

# Configure
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']
plt.rcParams['font.size'] = 10
plt.rcParams['figure.dpi'] = 300

# Create figure
fig, ax = plt.subplots(figsize=(14, 10))
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

# Color scheme
colors = {
    'sense': '#3498db',      # Blue
    'reason': '#e74c3c',     # Red
    'act': '#2ecc71',        # Green
    'learn': '#f39c12',      # Orange
    'feedback': '#95a5a6',   # Gray
    'highlight': '#9b59b6'   # Purple
}

# ============================================================================
# PHASE 1: SENSE (Top - Satellite Data Ingestion)
# ============================================================================
sense_box = FancyBboxPatch((0.5, 7.5), 2.5, 1.8, 
                          boxstyle="round,pad=0.15", 
                          edgecolor=colors['sense'], 
                          facecolor=colors['sense'], 
                          alpha=0.2, 
                          linewidth=3)
ax.add_patch(sense_box)

ax.text(1.75, 8.9, 'SENSE', fontsize=16, fontweight='bold', 
       ha='center', color=colors['sense'])
ax.text(1.75, 8.5, 'Satellite Data Ingestion', fontsize=11, 
       ha='center', style='italic')
ax.text(1.75, 8.1, '⏱ Temporal: Hourly', fontsize=9, ha='center', fontweight='bold')

# SENSE details
sense_items = [
    '• VIIRS VNP46A1 ingestion',
    '• Atmospheric correction',
    '• Quality flags validation',
    '• 847,250 observations'
]
for i, item in enumerate(sense_items):
    ax.text(1.75, 7.85 - i*0.15, item, fontsize=8, ha='center')

# SENSE icon (satellite)
satellite_icon = ax.scatter(0.8, 9.0, s=400, marker='*', 
                           c=colors['sense'], edgecolors='black', linewidth=1.5, zorder=10)

# ============================================================================
# PHASE 2: REASON (Right - ML Analysis)
# ============================================================================
reason_box = FancyBboxPatch((6.5, 7.5), 2.5, 1.8, 
                           boxstyle="round,pad=0.15", 
                           edgecolor=colors['reason'], 
                           facecolor=colors['reason'], 
                           alpha=0.2, 
                           linewidth=3)
ax.add_patch(reason_box)

ax.text(7.75, 8.9, 'REASON', fontsize=16, fontweight='bold', 
       ha='center', color=colors['reason'])
ax.text(7.75, 8.5, 'ML Reasoning & Alerts', fontsize=11, 
       ha='center', style='italic')
ax.text(7.75, 8.1, '⏱ Temporal: Daily', fontsize=9, ha='center', fontweight='bold')

# REASON details
reason_items = [
    '• XGBoost prediction (R² = 0.952)',
    '• Anomaly detection',
    '• Alert generation (94.2%)',
    '• 18-36h lead time'
]
for i, item in enumerate(reason_items):
    ax.text(7.75, 7.85 - i*0.15, item, fontsize=8, ha='center')

# REASON icon (brain/AI)
brain_icon = Circle((8.7, 9.0), 0.15, color=colors['reason'], 
                   edgecolor='black', linewidth=1.5, zorder=10)
ax.add_patch(brain_icon)
ax.text(8.7, 9.0, '🧠', fontsize=18, ha='center', va='center')

# ============================================================================
# PHASE 3: ACT (Bottom Right - Intervention Deployment)
# ============================================================================
act_box = FancyBboxPatch((6.5, 4.0), 2.5, 1.8, 
                        boxstyle="round,pad=0.15", 
                        edgecolor=colors['act'], 
                        facecolor=colors['act'], 
                        alpha=0.2, 
                        linewidth=3)
ax.add_patch(act_box)

ax.text(7.75, 5.4, 'ACT', fontsize=16, fontweight='bold', 
       ha='center', color=colors['act'])
ax.text(7.75, 5.0, 'Intervention Deployment', fontsize=11, 
       ha='center', style='italic')
ax.text(7.75, 4.6, '⏱ Temporal: Real-time', fontsize=9, ha='center', fontweight='bold')

# ACT details
act_items = [
    '• Email alerts to officials',
    '• Policy recommendations',
    '• Resource allocation',
    '• Stakeholder notification'
]
for i, item in enumerate(act_items):
    ax.text(7.75, 4.35 - i*0.15, item, fontsize=8, ha='center')

# ACT icon (action/bolt)
action_icon = ax.text(8.7, 5.5, '⚡', fontsize=24, ha='center', va='center')

# ============================================================================
# PHASE 4: LEARN (Bottom Left - Adaptation)
# ============================================================================
learn_box = FancyBboxPatch((0.5, 4.0), 2.5, 1.8, 
                          boxstyle="round,pad=0.15", 
                          edgecolor=colors['learn'], 
                          facecolor=colors['learn'], 
                          alpha=0.2, 
                          linewidth=3)
ax.add_patch(learn_box)

ax.text(1.75, 5.4, 'LEARN', fontsize=16, fontweight='bold', 
       ha='center', color=colors['learn'])
ax.text(1.75, 5.0, 'Model Adaptation', fontsize=11, 
       ha='center', style='italic')
ax.text(1.75, 4.6, '⏱ Temporal: Monthly', fontsize=9, ha='center', fontweight='bold')

# LEARN details
learn_items = [
    '• Policy effectiveness metrics',
    '• Model retraining',
    '• Parameter optimization',
    '• Performance feedback'
]
for i, item in enumerate(learn_items):
    ax.text(1.75, 4.35 - i*0.15, item, fontsize=8, ha='center')

# LEARN icon (refresh/cycle)
learn_icon = ax.text(0.8, 5.5, '🔄', fontsize=24, ha='center', va='center')

# ============================================================================
# ARROWS - Clockwise Flow
# ============================================================================

# SENSE → REASON (Top, left to right)
arrow1 = FancyArrowPatch((3.1, 8.4), (6.4, 8.4),
                        arrowstyle='->,head_width=0.4,head_length=0.3',
                        color='black', linewidth=2.5, zorder=5)
ax.add_patch(arrow1)
ax.text(4.75, 8.7, 'Data Processing', fontsize=9, ha='center', 
       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))

# REASON → ACT (Right side, top to bottom)
arrow2 = FancyArrowPatch((7.75, 7.4), (7.75, 5.9),
                        arrowstyle='->,head_width=0.4,head_length=0.3',
                        color='black', linewidth=2.5, zorder=5)
ax.add_patch(arrow2)
ax.text(8.4, 6.65, 'Alert\nTrigger', fontsize=9, ha='center', va='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))

# ACT → LEARN (Bottom, right to left)
arrow3 = FancyArrowPatch((6.4, 4.9), (3.1, 4.9),
                        arrowstyle='->,head_width=0.4,head_length=0.3',
                        color='black', linewidth=2.5, zorder=5)
ax.add_patch(arrow3)
ax.text(4.75, 4.6, 'Impact Assessment', fontsize=9, ha='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))

# LEARN → SENSE (Left side, bottom to top)
arrow4 = FancyArrowPatch((1.75, 5.9), (1.75, 7.4),
                        arrowstyle='->,head_width=0.4,head_length=0.3',
                        color='black', linewidth=2.5, zorder=5)
ax.add_patch(arrow4)
ax.text(1.0, 6.65, 'Model\nUpdate', fontsize=9, ha='center', va='center',
       bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))

# ============================================================================
# FEEDBACK LOOPS (Dashed Arrows)
# ============================================================================

# Diagonal feedback: ACT → REASON (Policy effectiveness)
feedback1 = FancyArrowPatch((7.2, 5.8), (7.2, 7.5),
                           arrowstyle='->,head_width=0.3,head_length=0.25',
                           color=colors['feedback'], linewidth=2, 
                           linestyle='dashed', alpha=0.7, zorder=3)
ax.add_patch(feedback1)
ax.text(6.5, 6.65, 'Effectiveness\nFeedback', fontsize=7, ha='center', 
       style='italic', color=colors['feedback'])

# Diagonal feedback: REASON → LEARN (Model metrics)
feedback2 = FancyArrowPatch((6.9, 7.6), (2.6, 5.7),
                           arrowstyle='->,head_width=0.3,head_length=0.25',
                           color=colors['feedback'], linewidth=2, 
                           linestyle='dashed', alpha=0.7, zorder=3)
ax.add_patch(feedback2)
ax.text(4.75, 6.2, 'Performance\nMetrics', fontsize=7, ha='center', 
       style='italic', color=colors['feedback'])

# Diagonal feedback: LEARN → SENSE (Optimized parameters)
feedback3 = FancyArrowPatch((2.6, 7.6), (2.6, 5.7),
                           arrowstyle='<->,head_width=0.3,head_length=0.25',
                           color=colors['feedback'], linewidth=2, 
                           linestyle='dashed', alpha=0.7, zorder=3)
ax.add_patch(feedback3)
ax.text(3.3, 6.65, 'Parameter\nTuning', fontsize=7, ha='center', 
       style='italic', color=colors['feedback'])

# ============================================================================
# CENTRAL DATA HUB
# ============================================================================
center_x, center_y = 5.0, 6.65
hub_circle = Circle((center_x, center_y), 0.8, 
                   color=colors['highlight'], alpha=0.15, 
                   edgecolor=colors['highlight'], linewidth=2.5, zorder=1)
ax.add_patch(hub_circle)

ax.text(center_x, center_y + 0.35, 'ALPS', fontsize=14, fontweight='bold', 
       ha='center', color=colors['highlight'])
ax.text(center_x, center_y + 0.05, 'Data Hub', fontsize=10, ha='center', style='italic')
ax.text(center_x, center_y - 0.25, '742 Districts', fontsize=8, ha='center')
ax.text(center_x, center_y - 0.45, 'PostgreSQL + PostGIS', fontsize=7, ha='center')

# ============================================================================
# KEY PERFORMANCE INDICATORS (Bottom Panel)
# ============================================================================
kpi_box = FancyBboxPatch((0.5, 0.3), 8.5, 2.5, 
                        boxstyle="round,pad=0.15", 
                        edgecolor='black', 
                        facecolor='#ecf0f1', 
                        alpha=0.3, 
                        linewidth=2)
ax.add_patch(kpi_box)

ax.text(4.75, 2.5, '📊 Key Performance Indicators (KPIs)', fontsize=13, 
       fontweight='bold', ha='center')

# KPI Grid (2 rows x 4 columns)
kpis = [
    {'label': 'Satellite Observations', 'value': '847,250', 'icon': '🛰️', 'color': colors['sense']},
    {'label': 'ML Model Accuracy', 'value': 'R² = 0.952', 'icon': '🎯', 'color': colors['reason']},
    {'label': 'Alert Precision', 'value': '94.2%', 'icon': '✓', 'color': colors['act']},
    {'label': 'Predictive Lead Time', 'value': '18-36 hours', 'icon': '⏱️', 'color': colors['learn']},
]

kpi_positions = [
    (1.5, 1.5), (3.5, 1.5), (5.5, 1.5), (7.5, 1.5)
]

for kpi, pos in zip(kpis, kpi_positions):
    # KPI box
    kpi_mini_box = FancyBboxPatch((pos[0] - 0.7, pos[1] - 0.4), 1.4, 0.8,
                                 boxstyle="round,pad=0.1",
                                 edgecolor=kpi['color'],
                                 facecolor='white',
                                 linewidth=2, zorder=8)
    ax.add_patch(kpi_mini_box)
    
    # Icon
    ax.text(pos[0] - 0.5, pos[1] + 0.15, kpi['icon'], fontsize=16, ha='center', va='center')
    
    # Value (large, bold)
    ax.text(pos[0] + 0.25, pos[1] + 0.15, kpi['value'], fontsize=11, 
           fontweight='bold', ha='center', va='center', color=kpi['color'])
    
    # Label (below)
    ax.text(pos[0], pos[1] - 0.25, kpi['label'], fontsize=7, 
           ha='center', va='top', style='italic')

# Additional metrics (bottom row)
ax.text(4.75, 0.7, 'System Uptime: 99.7% | Data Latency: <2 hours | Alert Response Time: 15 minutes | Model Retraining Frequency: Monthly',
       fontsize=7, ha='center', style='italic', color='#34495e')

# ============================================================================
# TITLE AND ANNOTATIONS
# ============================================================================
fig.suptitle('ALPS Autonomous Sense-Reason-Act-Learn Framework', 
            fontsize=18, fontweight='bold', y=0.98)

subtitle = (
    'Closed-loop policy system with continuous learning and adaptation. '
    'Temporal scales range from hourly satellite ingestion to monthly model retraining. '
    'Dashed feedback arrows indicate real-time performance optimization.'
)
ax.text(5.0, 9.8, subtitle, fontsize=9, ha='center', style='italic', wrap=True)

# Legend for arrow types
legend_x, legend_y = 0.7, 3.3
ax.plot([legend_x, legend_x + 0.4], [legend_y, legend_y], 'k-', linewidth=2.5)
ax.text(legend_x + 0.5, legend_y, 'Primary Flow', fontsize=8, va='center')

ax.plot([legend_x, legend_x + 0.4], [legend_y - 0.25, legend_y - 0.25], 
       color=colors['feedback'], linestyle='dashed', linewidth=2)
ax.text(legend_x + 0.5, legend_y - 0.25, 'Feedback Loop', fontsize=8, va='center')

# ============================================================================
# CAPTION
# ============================================================================
caption = (
    "Figure 3. ALPS autonomous framework implementing a four-phase policy loop: (1) SENSE phase ingests hourly VIIRS satellite data "
    "(847,250 observations), (2) REASON phase applies XGBoost ML model (R² = 0.952) for daily anomaly detection with 18-36 hour "
    "predictive lead time, (3) ACT phase deploys real-time email alerts with 94.2% precision, and (4) LEARN phase performs monthly "
    "model adaptation based on policy effectiveness metrics. Dashed feedback arrows indicate continuous performance optimization. "
    "Central data hub manages 742 district time-series using PostgreSQL with PostGIS spatial extensions."
)
fig.text(0.5, 0.01, caption, wrap=True, ha='center', fontsize=8, style='italic')

plt.tight_layout(rect=[0, 0.04, 1, 0.96])

# Save
output_pdf = 'd:/agentic-light-sentinel/tmp/exports/figures/figure3_framework.pdf'
output_png = 'd:/agentic-light-sentinel/tmp/exports/figures/figure3_framework.png'

plt.savefig(output_pdf, dpi=300, bbox_inches='tight')
print(f"✅ Saved: {output_pdf}")

plt.savefig(output_png, dpi=300, bbox_inches='tight')
print(f"✅ Saved: {output_png}")

plt.close()

print("\n🎯 Figure 3 (ALPS Framework) generated successfully!")
print("   ✓ Four-phase policy loop: SENSE → REASON → ACT → LEARN")
print("   ✓ Temporal scales: Hourly → Daily → Real-time → Monthly")
print("   ✓ Feedback loops: 3 dashed arrows for continuous improvement")
print("   ✓ KPIs included:")
print("     • Satellite observations: 847,250")
print("     • ML model accuracy: R² = 0.952")
print("     • Alert precision: 94.2%")
print("     • Predictive lead time: 18-36 hours")
print("   ✓ Central ALPS Data Hub with 742 districts")
print("   ✓ Format: PNG at 300 DPI (IEEE compliant)")
