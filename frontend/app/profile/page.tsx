'use client';

import Profile from '@/components/Profile';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 180px)' }}>
      <div className="text-center mb-4 md:mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-bold mb-1 md:mb-2"
        >
          Your <span className="text-secondary">Profile</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-xs md:text-sm"
        >
          View your stats and matches
        </motion.p>
      </div>

      <Profile />
    </div>
  );
}
