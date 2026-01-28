import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function CommunityEngagement() {
  const [feedbackType, setFeedbackType] = useState<'report' | 'suggestion' | 'story'>('report');
  const [submission, setSubmission] = useState({
    title: '',
    description: '',
    location: '',
    impact: '',
    contact: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/community/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          ...submission
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit feedback');
      
      // Reset form
      setSubmission({
        title: '',
        description: '',
        location: '',
        impact: '',
        contact: ''
      });
      
      alert('Thank you for your contribution!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Community Voice</h2>
      
      <div className="space-x-4 mb-6">
        <Button
          variant={feedbackType === 'report' ? 'default' : 'outline'}
          onClick={() => setFeedbackType('report')}
        >
          Report Issue
        </Button>
        <Button
          variant={feedbackType === 'suggestion' ? 'default' : 'outline'}
          onClick={() => setFeedbackType('suggestion')}
        >
          Suggest Solution
        </Button>
        <Button
          variant={feedbackType === 'story' ? 'default' : 'outline'}
          onClick={() => setFeedbackType('story')}
        >
          Share Story
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={submission.title}
            onChange={(e) => setSubmission({ ...submission, title: e.target.value })}
            placeholder={`Enter the title of your ${feedbackType}`}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={submission.description}
            onChange={(e) => setSubmission({ ...submission, description: e.target.value })}
            placeholder="Provide details about your submission"
            required
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <Input
            value={submission.location}
            onChange={(e) => setSubmission({ ...submission, location: e.target.value })}
            placeholder="Enter the relevant location"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Impact</label>
          <Textarea
            value={submission.impact}
            onChange={(e) => setSubmission({ ...submission, impact: e.target.value })}
            placeholder="Describe the environmental or community impact"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact Information (Optional)</label>
          <Input
            value={submission.contact}
            onChange={(e) => setSubmission({ ...submission, contact: e.target.value })}
            placeholder="Email or phone number for follow-up"
          />
        </div>

        <Button type="submit" className="w-full">
          Submit {feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)}
        </Button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Why Participate?</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Help identify light pollution hotspots in your community</li>
          <li>Share successful mitigation strategies</li>
          <li>Contribute to environmental protection efforts</li>
          <li>Connect with others concerned about light pollution</li>
        </ul>
      </div>
    </Card>
  );
}