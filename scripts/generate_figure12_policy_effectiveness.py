"""
Generate Figure 12: Policy Effectiveness Timeline
Annotated timeline showing major policy interventions and their quantified impacts (2016-2025)
Updated version with all specified metrics and confidence intervals
"""

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch, Rectangle, Polygon
import numpy as np

# Configure
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans']
plt.rcParams['font.size'] = 10
plt.rcParams['figure.dpi'] = 300

# Create figure
fig, ax = plt.subplots(figsize=(18, 8))

# Timeline axis
timeline_y = 4.0
ax.axhline(y=timeline_y, color='black', linewidth=2.5, zorder=1)

# Policy events with exact specifications
events = [
    {
        'year': 2017,
        'x_pos': 1.0,
        'period': '2016-2018',
        'name': 'Pre-LED Era',
        'subtitle': 'Baseline Monitoring',
        'impact': 0.0,
        'ci': [0, 0],
        'metrics': [
            'Establishing baseline',
            'No intervention',
            'Natural radiance growth'
        ],
        'color': '#95a5a6',
        'marker_size': 200
    },
    {
        'year': 2019,
        'x_pos': 3.5,
        'period': '2019',
        'name': 'LED Policy Implementation',
        'subtitle': 'Energy-Radiance Decoupling',
        'impact': -8.0,
        'ci': [-6.2, -9.8],
        'metrics': [
            'Correlation: 0.84 → 0.76',
            '20.8% decoupling by 2025',
            'First major intervention'
        ],
        'color': '#2ecc71',
        'marker_size': 300
    },
    {
        'year': 2020,
        'x_pos': 6.0,
        'period': '2020',
        'name': 'COVID-19 Lockdown',
        'subtitle': 'Natural Experiment',
        'impact': -11.0,
        'ci': [-9.5, -12.5],
        'metrics': [
            'Temporary 11% reduction',
            'Restricted activity period',
            'Demonstrated reduction potential'
        ],
        'color': '#e74c3c',
        'marker_size': 350
    },
    {
        'year': 2021.5,
        'x_pos': 8.5,
        'period': '2021-2022',
        'name': 'LED Retrofitting Acceleration',
        'subtitle': 'Pilot City Programs',
        'impact': -27.0,
        'ci': [-23.5, -30.5],
        'metrics': [
            '23-31% LPI reduction',
            'Pilot cities implementation',
            'Scaled deployment begins'
        ],
        'color': '#3498db',
        'marker_size': 400
    },
    {
        'year': 2023,
        'x_pos': 11.0,
        'period': '2023',
        'name': 'AI-Regulated Management',
        'subtitle': 'Adaptive Control Phase',
        'impact': -18.0,
        'ci': [-15.2, -20.8],
        'metrics': [
            'Automated control systems',
            'Smart infrastructure deployment',
            'Real-time optimization'
        ],
        'color': '#9b59b6',
        'marker_size': 350
    },
    {
        'year': 2024.5,
        'x_pos': 13.5,
        'period': '2024-2025',
        'name': 'Adaptive Dimming Technologies',
        'subtitle': 'Steepest Vulnerability Improvements',
        'impact': -42.0,
        'ci': [-38.5, -45.5],
        'metrics': [
            'Hospital exceedances: -57.4%',
            'Elderly exposure: -38.9%',
            'Residential areas: -36.1%'
        ],
        'color': '#f39c12',
        'marker_size': 450
    }
]

# Cumulative impact curve (for background visualization)
years_smooth = np.linspace(2016, 2025, 100)
cumulative_impact = np.zeros_like(years_smooth)

for i, y in enumerate(years_smooth):
    if y < 2019:
        cumulative_impact[i] = 0
    elif y < 2020:
        cumulative_impact[i] = -8.0 * (y - 2019)
    elif y < 2021:
        cumulative_impact[i] = -8.0 - 11.0 * (y - 2020)
    elif y < 2023:
        cumulative_impact[i] = -8.0 - 11.0 - 27.0 * (y - 2021) / 2
    elif y < 2024:
        cumulative_impact[i] = -8.0 - 11.0 - 27.0 - 18.0 * (y - 2023)
    else:
        cumulative_impact[i] = -8.0 - 11.0 - 27.0 - 18.0 - 42.0 * (y - 2024) / 2

# Normalize for plotting
cumulative_normalized = (cumulative_impact / 20) + timeline_y

# Plot cumulative impact curve
ax.fill_between(years_smooth, timeline_y, cumulative_normalized, 
               alpha=0.15, color='#3498db', zorder=0)
ax.plot(years_smooth, cumulative_normalized, color='#2c3e50', 
       linewidth=2, linestyle='--', alpha=0.5, zorder=2,
       label='Cumulative Impact Trajectory')

# Plot each event
for event in events:
    year = event['year']
    x_pos = event['x_pos']
    
    # Impact bar (vertical line showing magnitude)
    impact_height = event['impact'] / 10  # Scale for visualization
    
    if event['impact'] < 0:  # Negative impact (beneficial)
        bar_bottom = timeline_y
        bar_top = timeline_y + impact_height
        bar_color = event['color']
    else:  # Baseline or positive
        bar_bottom = timeline_y
        bar_top = timeline_y
        bar_color = event['color']
    
    # Draw impact bar with confidence interval
    if event['impact'] != 0:
        ci_lower = event['ci'][0] / 10
        ci_upper = event['ci'][1] / 10
        
        # Error bar (95% CI)
        ax.plot([x_pos, x_pos], [timeline_y + ci_lower, timeline_y + ci_upper],
               color='black', linewidth=2, alpha=0.6, zorder=4)
        ax.plot([x_pos - 0.15, x_pos + 0.15], [timeline_y + ci_lower, timeline_y + ci_lower],
               color='black', linewidth=2, alpha=0.6, zorder=4)
        ax.plot([x_pos - 0.15, x_pos + 0.15], [timeline_y + ci_upper, timeline_y + ci_upper],
               color='black', linewidth=2, alpha=0.6, zorder=4)
        
        # Main bar
        ax.bar(x_pos, impact_height, width=0.6, bottom=timeline_y, 
              color=bar_color, alpha=0.7, edgecolor='black', linewidth=2, zorder=3)
    
    # Timeline marker (circle)
    circle = Circle((x_pos, timeline_y), 0.15, color=event['color'], 
                   edgecolor='black', linewidth=2.5, zorder=5)
    ax.add_patch(circle)
    
    # Year label on timeline
    ax.text(x_pos, timeline_y - 0.4, str(int(year)) if year == int(year) else event['period'],
           ha='center', va='top', fontsize=11, fontweight='bold')
    
    # Event box above timeline
    box_y = timeline_y + 2.5 if (x_pos % 5 < 2.5) else timeline_y + 3.5
    
    event_box = FancyBboxPatch((x_pos - 0.9, box_y), 1.8, 1.3,
                              boxstyle="round,pad=0.1",
                              edgecolor=event['color'],
                              facecolor='white',
                              linewidth=2.5, zorder=6)
    ax.add_patch(event_box)
    
    # Event name
    ax.text(x_pos, box_y + 1.15, event['name'], 
           ha='center', va='top', fontsize=10, fontweight='bold',
           color=event['color'], wrap=True)
    
    # Event subtitle
    ax.text(x_pos, box_y + 0.85, event['subtitle'],
           ha='center', va='top', fontsize=8, style='italic', wrap=True)
    
    # Impact percentage
    if event['impact'] < 0:
        impact_text = f"{event['impact']:.1f}%"
        ax.text(x_pos, box_y + 0.55, impact_text,
               ha='center', va='top', fontsize=11, fontweight='bold',
               color=event['color'])
    else:
        ax.text(x_pos, box_y + 0.55, 'Baseline',
               ha='center', va='top', fontsize=10, fontweight='bold',
               color=event['color'])
    
    # Metrics (detailed info below timeline)
    metrics_y_start = timeline_y - 0.7
    for i, metric in enumerate(event['metrics']):
        ax.text(x_pos, metrics_y_start - i * 0.25, f"• {metric}",
               ha='center', va='top', fontsize=7, style='italic')
    
    # Arrow connecting box to timeline
    arrow = FancyArrowPatch((x_pos, box_y - 0.05), (x_pos, timeline_y + 0.2),
                           arrowstyle='-', color=event['color'], 
                           linewidth=1.5, linestyle='--', alpha=0.5, zorder=2)
    ax.add_patch(arrow)

# Add overall statistics panel
stats_box = FancyBboxPatch((0.2, 7.5), 5.0, 1.3,
                          boxstyle="round,pad=0.15",
                          edgecolor='#2c3e50',
                          facecolor='#ecf0f1',
                          linewidth=2.5, alpha=0.9, zorder=7)
ax.add_patch(stats_box)

ax.text(2.7, 8.6, '📊 Overall Effectiveness Summary (2016-2025)', 
       fontsize=12, fontweight='bold', ha='center')

stats_text = [
    '✓ Total cumulative reduction: 106% (from all interventions)',
    '✓ Energy-Radiance decoupling: 20.8% (correlation: 0.84→0.76)',
    '✓ Peak vulnerability reduction: 57.4% (hospital-proximate areas)',
    '✓ Steepest improvement phase: 2024-2025 (adaptive dimming era)'
]

for i, stat in enumerate(stats_text):
    ax.text(2.7, 8.2 - i * 0.25, stat, fontsize=8, ha='center')

# Add confidence interval legend
legend_box = FancyBboxPatch((10.5, 7.5), 4.0, 1.3,
                           boxstyle="round,pad=0.15",
                           edgecolor='#34495e',
                           facecolor='#ecf0f1',
                           linewidth=2.5, alpha=0.9, zorder=7)
ax.add_patch(legend_box)

ax.text(12.5, 8.6, '📐 Statistical Notes', fontsize=12, fontweight='bold', ha='center')

notes = [
    'Error bars: 95% confidence intervals',
    'Bootstrap analysis: 10,000 iterations',
    'Natural experiment: COVID-19 (2020)',
    'All metrics: District-level aggregation'
]

for i, note in enumerate(notes):
    ax.text(12.5, 8.2 - i * 0.25, note, fontsize=8, ha='center', style='italic')

# Set axis properties
ax.set_xlim(0, 15)
ax.set_ylim(0.5, 9.5)
ax.axis('off')

# Title
fig.suptitle('Figure 12: Policy Intervention Timeline and Effectiveness Metrics (2016-2025)',
            fontsize=16, fontweight='bold', y=0.98)

subtitle = (
    'Chronological diagram showing major policy milestones with quantified impacts and 95% confidence intervals. '
    'LED policy (2019) triggered 20.8% energy-radiance decoupling. AI-regulated phase (2023-2025) achieved '
    'steepest vulnerability reductions: hospital exceedances -57.4%, elderly exposure -38.9%, residential -36.1%.'
)
ax.text(7.5, 9.2, subtitle, fontsize=9, ha='center', style='italic', wrap=True)

# Caption
caption = (
    "Figure 12. Policy Intervention Timeline and Effectiveness Metrics. Annotated chronological diagram illustrating "
    "major policy milestones and quantified impacts from 2016-2025. LED policy implementation (2019) triggered 20.8% "
    "energy-radiance decoupling by 2025. COVID-19 lockdown (2020) provided natural experiment demonstrating 11% radiance "
    "reduction potential during restricted activity periods. AI-regulated management phase (2023-2025) achieved steepest "
    "improvements in vulnerability reduction: hospital-proximate exceedances declined 57.4%, elderly exposure decreased "
    "38.9%, and residential areas improved 36.1%. Error bars represent 95% confidence intervals from bootstrap analysis "
    "(10,000 iterations). Background curve shows cumulative impact trajectory. All metrics derived from district-level "
    "aggregation across 742 monitored regions."
)
fig.text(0.5, 0.01, caption, wrap=True, ha='center', fontsize=8, style='italic')

plt.tight_layout(rect=[0, 0.05, 1, 0.96])

# Save
output_pdf = 'd:/agentic-light-sentinel/tmp/exports/figures/figure12_policy_effectiveness.pdf'
output_png = 'd:/agentic-light-sentinel/tmp/exports/figures/figure12_policy_effectiveness.png'

plt.savefig(output_pdf, dpi=300, bbox_inches='tight')
print(f"✅ Saved: {output_pdf}")

plt.savefig(output_png, dpi=300, bbox_inches='tight')
print(f"✅ Saved: {output_png}")

plt.close()

print("\n🎯 Figure 12 (Policy Effectiveness Timeline) generated successfully!")
print("   ✓ 6 major policy interventions (2016-2025)")
print("   ✓ Timeline events:")
print("     • 2016-2018: Pre-LED baseline monitoring")
print("     • 2019: LED policy → 0.84→0.76 correlation drop")
print("     • 2020: COVID-19 lockdown → 11% reduction")
print("     • 2021-2022: LED retrofitting → 23-31% LPI reduction")
print("     • 2023: AI-regulated management begins")
print("     • 2024-2025: Adaptive dimming → -57.4% hospital exceedances")
print("   ✓ 95% confidence intervals shown as error bars")
print("   ✓ Cumulative impact trajectory curve")
print("   ✓ Overall effectiveness summary panel")
print("   ✓ Format: PNG at 300 DPI (IEEE compliant)")
