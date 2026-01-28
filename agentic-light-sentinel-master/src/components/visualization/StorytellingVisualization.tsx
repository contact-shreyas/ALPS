import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('@/components/map/Map'), { ssr: false });

interface Story {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    zoom: number;
  };
  metrics: {
    before: number;
    after: number;
    impact: string;
  };
  images: string[];
}

export function StorytellingVisualization() {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStory, setCurrentStory] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (playing && stories.length > 0) {
      timer = setInterval(() => {
        setCurrentStory((prev) => (prev + 1) % stories.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [playing, stories.length]);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  if (stories.length === 0) return null;

  const story = stories[currentStory];

  return (
    <div className="relative h-[80vh]">
      <Map
        center={[story.location.lat, story.location.lng]}
        zoom={story.location.zoom}
        className="w-full h-full"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="absolute bottom-0 left-0 right-0 p-6"
        >
          <Card className="bg-white/90 backdrop-blur p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{story.title}</h2>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStory((prev) => (prev + 1) % stories.length)}
                >
                  Next
                </Button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">{story.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">
                  {story.metrics.before.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Before (nW)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {story.metrics.after.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">After (nW)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {story.metrics.impact}
                </div>
                <div className="text-sm text-gray-500">Impact Score</div>
              </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              {story.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Story visual ${index + 1}`}
                  className="h-24 w-auto rounded-lg"
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-2">
        <div className="text-sm font-medium">
          Story {currentStory + 1} of {stories.length}
        </div>
        <div className="w-32 h-1 bg-gray-200 rounded-full mt-1">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentStory + 1) / stories.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}