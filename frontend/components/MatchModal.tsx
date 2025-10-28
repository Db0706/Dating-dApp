'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMatchStore } from '@/lib/store';
import { FaTimes, FaComment, FaHeart } from 'react-icons/fa';

export default function MatchModal() {
  const { showMatchModal, matchedUser, setMatchModal } = useMatchStore();

  function closeModal() {
    setMatchModal(false);
  }

  function startChat() {
    // Navigate to chat with matched user
    closeModal();
    window.location.href = `/chat?user=${matchedUser?.wallet}`;
  }

  return (
    <AnimatePresence>
      {showMatchModal && matchedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <FaTimes className="text-white" />
            </button>

            {/* Match Animation */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="inline-block mb-4"
              >
                <FaHeart className="text-6xl text-white drop-shadow-lg" />
              </motion.div>

              <h2 className="text-4xl font-bold text-white mb-2">It's a Match!</h2>
              <p className="text-white/80">
                You and {matchedUser.displayName} have liked each other
              </p>
            </div>

            {/* Matched User Profile */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-4">
                {matchedUser.photos && matchedUser.photos[0] ? (
                  <img
                    src={matchedUser.photos[0]}
                    alt={matchedUser.displayName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/30">
                    {matchedUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {matchedUser.displayName}, {matchedUser.age}
                  </h3>
                  <p className="text-white/80 text-sm line-clamp-2">{matchedUser.bio}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={startChat}
                className="w-full py-4 bg-white hover:bg-white/90 text-primary font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <FaComment />
                <span>Start Chatting</span>
              </button>

              <button
                onClick={closeModal}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
              >
                Keep Swiping
              </button>
            </div>

            {/* NFT Badge Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white/60">
                🎉 Your match has been minted as an NFT!
                <br />
                You both earned HEART tokens
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
