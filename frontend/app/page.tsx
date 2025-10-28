'use client';

import { useEffect, useState } from 'react';
import { useWalletStore } from '@/lib/store';
import { getUserProfile } from '@/lib/firebase';
import SwipeDeck from '@/components/SwipeDeck';
import ProfileSetup from '@/components/ProfileSetup';
import { motion } from 'framer-motion';
import { FaHeart, FaWallet } from 'react-icons/fa';

export default function HomePage() {
  const { address, userProfile, setUserProfile } = useWalletStore();
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfile();
  }, [address]);

  async function checkProfile() {
    if (!address) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const profile = await getUserProfile(address);
      if (profile) {
        setUserProfile(profile);
        setNeedsProfile(false);
      } else {
        setNeedsProfile(true);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setNeedsProfile(true);
    } finally {
      setLoading(false);
    }
  }

  function handleProfileComplete() {
    setNeedsProfile(false);
    checkProfile();
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12 border-2 border-primary/20">
            <FaWallet className="text-5xl md:text-6xl text-primary mx-auto mb-4 md:mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
              Welcome to <span className="text-primary">DatingDApp</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base mb-6 md:mb-8">
              Connect your wallet to start meeting amazing people on Web3
            </p>
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-500">
              <FaHeart className="text-primary" />
              <span>Built on Avalanche</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 180px)' }}>
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm md:text-base">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (needsProfile) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)' }}>
      <div className="text-center mb-4 md:mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-bold mb-1 md:mb-2"
        >
          Find Your <span className="text-primary">Match</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-xs md:text-base"
        >
          Swipe, match, and earn HEART tokens
        </motion.p>
      </div>

      <SwipeDeck />
    </div>
  );
}
