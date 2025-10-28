'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, UserProfile } from '@/lib/firebase';
import { getHeartBalance, shortenAddress } from '@/lib/contracts';
import { FaTrophy, FaMedal, FaAward, FaStar, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface LeaderboardUser extends UserProfile {
  heartBalance: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);

    try {
      const profiles = await getLeaderboard(10);

      const usersWithBalances = await Promise.all(
        profiles.map(async (profile) => {
          try {
            const balance = await getHeartBalance(profile.wallet);
            return {
              ...profile,
              heartBalance: parseFloat(balance),
            };
          } catch (error) {
            console.error(`Error fetching balance for ${profile.wallet}:`, error);
            return {
              ...profile,
              heartBalance: 0,
            };
          }
        })
      );

      usersWithBalances.sort((a, b) => b.heartBalance - a.heartBalance);

      setUsers(usersWithBalances);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankIcon(index: number) {
    switch (index) {
      case 0:
        return <FaTrophy className="text-xl text-yellow-400" />;
      case 1:
        return <FaMedal className="text-xl text-gray-300" />;
      case 2:
        return <FaAward className="text-xl text-orange-400" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{index + 1}</span>;
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-light rounded-2xl p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-light rounded-2xl p-4">
      {/* Leaderboard List */}
      <div className="space-y-2">
        {users.map((user, index) => (
          <motion.div
            key={user.wallet}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition
              ${
                index < 3
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30'
                  : 'bg-dark/50 hover:bg-dark'
              }
            `}
          >
            {/* Rank */}
            <div className="w-8 flex-shrink-0 flex justify-center">
              {getRankIcon(index)}
            </div>

            {/* Profile Picture */}
            {user.photos && user.photos[0] ? (
              <img
                src={user.photos[0]}
                alt={user.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <FaUser className="text-sm text-gray-500" />
              </div>
            )}

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">
                {user.displayName}
              </h3>
              <p className="text-xs text-gray-400">{shortenAddress(user.wallet, 3)}</p>
            </div>

            {/* HEART Balance */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-accent">
                {user.heartBalance.toFixed(0)}
              </div>
              <p className="text-[10px] text-gray-400">HEART</p>
            </div>

            {/* Boosted Badge */}
            {user.boostedUntil > Date.now() && (
              <div className="px-2 py-1 bg-accent/20 text-accent text-[10px] font-bold rounded-full flex items-center gap-1">
                <FaStar className="text-[8px]" />
                <span>BOOST</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No users on the leaderboard yet</p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={loadLeaderboard}
        className="w-full mt-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition text-sm"
      >
        Refresh
      </button>
    </div>
  );
}
