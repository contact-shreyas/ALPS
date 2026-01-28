import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { ImpactMetrics } from '@/lib/sustainability';

interface SustainabilityDashboardProps {
  region: string;
}

export function SustainabilityDashboard({ region }: SustainabilityDashboardProps) {
  const [impact, setImpact] = useState<{
    daily: ImpactMetrics;
    monthly: ImpactMetrics;
    yearly: ImpactMetrics;
    recommendations: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchImpactData();
  }, [region]);

  const fetchImpactData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sustainability/impact?region=${region}`);
      const data = await response.json();
      setImpact(data);
    } catch (error) {
      console.error('Error fetching impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading impact data...</div>;
  if (!impact) return null;

  const chartData = [
    {
      name: 'Daily',
      energySavings: impact.daily.energySavings,
      co2Reduction: impact.daily.co2Reduction,
    },
    {
      name: 'Monthly',
      energySavings: impact.monthly.energySavings,
      co2Reduction: impact.monthly.co2Reduction,
    },
    {
      name: 'Yearly',
      energySavings: impact.yearly.energySavings,
      co2Reduction: impact.yearly.co2Reduction,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Environmental Impact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Energy Saved"
            value={`${Math.round(impact.yearly.energySavings).toLocaleString()} kWh`}
            description="Annual energy savings from light pollution reduction"
          />
          <MetricCard
            title="CO2 Reduced"
            value={`${Math.round(impact.yearly.co2Reduction).toLocaleString()} kg`}
            description="Annual carbon dioxide emissions prevented"
          />
          <MetricCard
            title="Wildlife Impact Score"
            value={`${impact.yearly.wildlifeImpact.toFixed(1)}/10`}
            description="Positive impact on local wildlife and ecosystems"
          />
          <MetricCard
            title="Cost Savings"
            value={`$${Math.round(impact.yearly.costSavings).toLocaleString()}`}
            description="Annual monetary savings from reduced energy use"
          />
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="energySavings"
                stackId="1"
                stroke="#2563eb"
                fill="#3b82f6"
              />
              <Area
                type="monotone"
                dataKey="co2Reduction"
                stackId="2"
                stroke="#16a34a"
                fill="#22c55e"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-2">
            {impact.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}