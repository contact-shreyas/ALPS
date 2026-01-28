import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GenerativeInsightsProps {
  region?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly';
}

export function GenerativeInsightsPanel({ region, timeframe = 'weekly' }: GenerativeInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'policy' | 'education'>('insights');

  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeframe,
          region,
          type: activeTab,
          audience: 'general',
          topic: 'Light Pollution Impact'
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setInsights(data.result);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
        <div className="space-x-2">
          <Button
            variant={activeTab === 'insights' ? 'default' : 'outline'}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </Button>
          <Button
            variant={activeTab === 'policy' ? 'default' : 'outline'}
            onClick={() => setActiveTab('policy')}
          >
            Policy
          </Button>
          <Button
            variant={activeTab === 'education' ? 'default' : 'outline'}
            onClick={() => setActiveTab('education')}
          >
            Education
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={generateContent}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </Button>

        {insights && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: insights }} />
          </div>
        )}
      </div>
    </Card>
  );
}