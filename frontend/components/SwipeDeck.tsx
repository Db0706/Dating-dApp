'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useWalletStore, useMatchStore } from '@/lib/store';
import {
  getSwipeProfiles,
  recordLike,
  checkMutualLike,
  createMatch,
  UserProfile,
} from '@/lib/firebase';
import { getDatingControllerContract } from '@/lib/contracts';
import { createMatchMetadata } from '@/lib/ipfs';
import toast from 'react-hot-toast';
import { FaHeart, FaStar, FaTimes, FaInfoCircle, FaUndo, FaUser } from 'react-icons/fa';

export default function SwipeDeck() {
  const { address, userProfile } = useWalletStore();
  const { setMatchModal } = useMatchStore();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (address && userProfile) {
      loadProfiles();
    }
  }, [address, userProfile]);

  async function loadProfiles() {
    if (!address) return;

    setLoading(true);
    try {
      const newProfiles = await getSwipeProfiles(address, [], 50);
      setProfiles(newProfiles);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }

  async function handleSwipe(direction: 'left' | 'right', type: 'like' | 'superlike' | 'pass') {
    if (!address || !currentProfile) return;

    try {
      if (type !== 'pass') {
        await recordLike(address, currentProfile.wallet, type);

        const isMutual = await checkMutualLike(address, currentProfile.wallet);

        if (isMutual) {
          await processMatch(currentProfile);
        } else {
          toast.success(type === 'superlike' ? '⭐ Super Liked!' : '❤️ Liked!');
        }
      }

      setCurrentIndex((prev) => prev + 1);

      if (currentIndex >= profiles.length - 3) {
        loadProfiles();
      }
    } catch (error) {
      console.error('Error processing swipe:', error);
      toast.error('Failed to process action');
    }
  }

  async function processMatch(matchedUser: UserProfile) {
    if (!address) return;

    const loadingToast = toast.loading('Creating match on-chain...');

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const tokenURI = await createMatchMetadata(address, matchedUser.wallet, timestamp);

      const contract = await getDatingControllerContract(true);
      const tx = await contract.confirmMatch(address, matchedUser.wallet, tokenURI);
      const receipt = await tx.wait();

      const matchEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'MatchCreated';
        } catch {
          return false;
        }
      });

      let tokenIdA, tokenIdB;
      if (matchEvent) {
        const parsed = contract.interface.parseLog(matchEvent);
        tokenIdA = Number(parsed?.args.tokenIdA);
        tokenIdB = Number(parsed?.args.tokenIdB);
      }

      await createMatch(address, matchedUser.wallet, tokenIdA, tokenIdB);

      toast.dismiss(loadingToast);
      toast.success('Match created! 🎉');

      setMatchModal(true, matchedUser);
    } catch (error: any) {
      console.error('Error processing match:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to create match');
    }
  }

  function handleDragEnd(event: any, info: PanInfo) {
    if (info.offset.x > 100) {
      handleSwipe('right', 'like');
    } else if (info.offset.x < -100) {
      handleSwipe('left', 'pass');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 300px)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profiles...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 300px)' }}>
        <div className="text-center max-w-md px-4">
          <FaHeart className="text-6xl text-primary mx-auto mb-4" />
          <p className="text-xl text-gray-400 mb-4">Create your profile to start swiping</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 300px)' }}>
        <div className="text-center max-w-md px-4">
          <FaHeart className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400 mb-4">No more profiles</p>
          <button
            onClick={loadProfiles}
            className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Card Stack Preview */}
      <div className="relative" style={{ height: 'calc(100vh - 340px)', maxHeight: '600px', minHeight: '400px' }}>
        {/* Back cards (stack effect) */}
        {profiles.slice(currentIndex + 1, currentIndex + 3).map((profile, index) => (
          <div
            key={profile.wallet + index}
            className="absolute inset-0 bg-dark-light rounded-3xl shadow-xl"
            style={{
              transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * -10}px)`,
              zIndex: -(index + 1),
              opacity: 1 - (index + 1) * 0.3,
            }}
          />
        ))}

        {/* Current Card */}
        <motion.div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{
            x,
            rotate,
            opacity,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: 'grabbing' }}
        >
          <div className="relative w-full h-full bg-gradient-to-br from-dark-light to-dark rounded-3xl shadow-2xl overflow-hidden">
            {/* Profile Image */}
            <div className="absolute inset-0">
              {currentProfile.photos && currentProfile.photos[0] ? (
                <img
                  src={currentProfile.photos[0]}
                  alt={currentProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <FaUser className="text-9xl text-gray-600" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Boost Badge */}
            {currentProfile.boostedUntil > Date.now() && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-accent text-dark px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                  <FaStar className="text-sm" />
                  BOOSTED
                </div>
              </div>
            )}

            {/* Info Button */}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition"
            >
              <FaInfoCircle />
            </button>

            {/* Profile Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
              <motion.div
                initial={false}
                animate={{ height: showInfo ? 'auto' : 'auto' }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 flex items-center gap-2">
                  {currentProfile.displayName}
                  <span className="text-xl md:text-2xl text-white/80">{currentProfile.age}</span>
                </h2>

                {!showInfo ? (
                  <p className="text-white/90 text-xs md:text-sm line-clamp-2 mb-2">
                    {currentProfile.bio}
                  </p>
                ) : (
                  <div className="space-y-2 md:space-y-3 mb-3 bg-black/40 backdrop-blur-md rounded-2xl p-3 md:p-4">
                    <p className="text-white/90 text-xs md:text-sm">{currentProfile.bio}</p>

                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {currentProfile.interests.map((interest, i) => (
                          <span
                            key={i}
                            className="px-2 md:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] md:text-xs text-white font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Swipe Indicators */}
            <motion.div
              className="absolute top-1/4 left-8 transform -rotate-12"
              style={{ opacity: likeOpacity }}
            >
              <div className="px-6 py-3 border-4 border-green-500 text-green-500 text-3xl font-bold rounded-xl">
                LIKE
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/4 right-8 transform rotate-12"
              style={{ opacity: nopeOpacity }}
            >
              <div className="px-6 py-3 border-4 border-red-500 text-red-500 text-3xl font-bold rounded-xl">
                NOPE
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-3 md:gap-4 mt-4 md:mt-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('left', 'pass')}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:shadow-xl transition"
        >
          <FaTimes className="text-xl md:text-2xl" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right', 'superlike')}
          className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition"
        >
          <FaStar className="text-base md:text-lg" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSwipe('right', 'like')}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-secondary shadow-xl flex items-center justify-center text-white hover:shadow-2xl transition transform hover:scale-110"
        >
          <FaHeart className="text-2xl md:text-3xl" />
        </motion.button>
      </div>

      {/* Helper Text */}
      <p className="text-center text-gray-500 text-[10px] md:text-xs mt-3 md:mt-4">
        Swipe or tap buttons • {profiles.length - currentIndex} profiles remaining
      </p>
    </div>
  );
}
