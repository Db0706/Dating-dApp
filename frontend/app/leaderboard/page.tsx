'use client';

import Leaderboard from '@/components/Leaderboard';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 180px)' }}>
      <div className="text-center mb-4 md:mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-bold mb-1 md:mb-2"
        >
          Top <span className="text-primary">Daters</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-xs md:text-sm"
        >
          See who's earning the most HEART
        </motion.p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Leaderboard />
      </div>
    </div>
  );
}
