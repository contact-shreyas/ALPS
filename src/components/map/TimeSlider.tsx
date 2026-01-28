import { useCallback } from 'react';
import { motion } from 'framer-motion';

type TimeSliderProps = {
  value: [Date, Date];
  onChange: (value: [Date, Date]) => void;
  min: Date;
  max: Date;
};

export default function TimeSlider({ value, onChange, min, max }: TimeSliderProps) {
  const [start, end] = value;
  const totalRange = max.getTime() - min.getTime();

  const getPosition = useCallback((date: Date) => {
    return ((date.getTime() - min.getTime()) / totalRange) * 100;
  }, [min, totalRange]);

  const handleDrag = useCallback((isStart: boolean) => (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    const sliderWidth = document.querySelector('.time-slider')?.getBoundingClientRect().width || 0;
    const newPosition = (info.offset.x / sliderWidth) * totalRange + min.getTime();
    const newDate = new Date(Math.max(min.getTime(), Math.min(max.getTime(), newPosition)));

    onChange(isStart ? [newDate, end] : [start, newDate]);
  }, [min, max, totalRange, start, end, onChange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-96">
      <div className="relative h-12 time-slider">
        {/* Background track */}
        <div className="absolute h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full top-1/2 -translate-y-1/2" />

        {/* Selected range */}
        <div
          className="absolute h-2 bg-blue-500 rounded-full top-1/2 -translate-y-1/2"
          style={{
            left: `${getPosition(start)}%`,
            right: `${100 - getPosition(end)}%`
          }}
        />

        {/* Start handle */}
        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          onDrag={handleDrag(true)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-2 border-blue-500 cursor-pointer shadow-lg"
          style={{ left: `${getPosition(start)}%` }}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 1.1 }}
        />

        {/* End handle */}
        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          onDrag={handleDrag(false)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full border-2 border-blue-500 cursor-pointer shadow-lg"
          style={{ left: `${getPosition(end)}%` }}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 1.1 }}
        />
      </div>

      <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
        <span>{start.toLocaleDateString()}</span>
        <span>{end.toLocaleDateString()}</span>
      </div>
    </div>
  );
}
