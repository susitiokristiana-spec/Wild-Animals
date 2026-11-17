import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CelebrationBurstProps {
  triggerKey: number;
}

const BURST_PARTICLES = [
  { id: 1, x: -72, y: -56, color: '#F59E0B', size: 16, rotate: -25 },
  { id: 2, x: 74, y: -52, color: '#16A34A', size: 14, rotate: 30 },
  { id: 3, x: -86, y: 12, color: '#EA580C', size: 12, rotate: -45 },
  { id: 4, x: 88, y: 18, color: '#0EA5E9', size: 14, rotate: 40 },
  { id: 5, x: -38, y: -82, color: '#EAB308', size: 18, rotate: 15 },
  { id: 6, x: 42, y: -80, color: '#22C55E', size: 16, rotate: -20 },
  { id: 7, x: 0, y: -92, color: '#F97316', size: 15, rotate: 0 },
];

export const CelebrationBurst: React.FC<CelebrationBurstProps> = ({ triggerKey }) => {
  if (triggerKey === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-20"
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout">
        {BURST_PARTICLES.map((p) => (
          <motion.svg
            key={`${triggerKey}-${p.id}`}
            viewBox="0 0 24 24"
            width={p.size}
            height={p.size}
            initial={{ opacity: 1, scale: 0.4, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: 0,
              scale: 1.2,
              x: p.x,
              y: p.y,
              rotate: p.rotate,
            }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
          >
            <path
              d="M12 2L14.9 8.6L22 9.3L16.6 14L18.2 21L12 17.3L5.8 21L7.4 14L2 9.3L9.1 8.6L12 2Z"
              fill={p.color}
            />
          </motion.svg>
        ))}
      </AnimatePresence>
    </div>
  );
};
