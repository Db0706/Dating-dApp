'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/lib/store';
import { getUserMatchNFTs, shortenAddress, formatDate } from '@/lib/contracts';
import { FaHeart, FaImage, FaWallet, FaCopy, FaExternalLinkAlt, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Profile() {
  const { address, heartBalance, userProfile } = useWalletStore();
  const [matchNFTs, setMatchNFTs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadProfileData();
    }
  }, [address]);

  async function loadProfileData() {
    if (!address) return;

    setLoading(true);
    try {
      const nfts = await getUserMatchNFTs(address);
      setMatchNFTs(nfts);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }

  function copyAddress() {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!');
    }
  }

  if (!address) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
        <div className="text-center">
          <FaWallet className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-xl text-gray-400">Connect wallet to view profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl p-6 border-2 border-primary/30"
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {userProfile?.photos && userProfile.photos[0] ? (
            <img
              src={userProfile.photos[0]}
              alt={userProfile.displayName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-2 border-white/30">
              <FaUser className="text-3xl text-gray-500" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white mb-1">
              {userProfile?.displayName || 'Anonymous'}
              {userProfile?.age && <span className="text-secondary">, {userProfile.age}</span>}
            </h1>

            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
              {userProfile?.bio || 'No bio yet'}
            </p>

            {/* Interests */}
            {userProfile?.interests && userProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {userProfile.interests.slice(0, 3).map((interest, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white font-medium"
                  >
                    {interest}
                  </span>
                ))}
                {userProfile.interests.length > 3 && (
                  <span className="px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/60 font-medium">
                    +{userProfile.interests.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent mb-1">
              {parseFloat(heartBalance).toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">HEART Tokens</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">{matchNFTs.length}</div>
            <div className="text-xs text-gray-400">Matches</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-secondary mb-1">
              {userProfile?.interests?.length || 0}
            </div>
            <div className="text-xs text-gray-400">Interests</div>
          </div>
        </div>
      </motion.div>

      {/* Wallet Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-light rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-400">Wallet Address</h3>
          <button
            onClick={copyAddress}
            className="p-2 hover:bg-white/5 rounded-lg transition"
          >
            <FaCopy className="text-gray-400" />
          </button>
        </div>
        <div className="font-mono text-sm text-white bg-dark/50 px-3 py-2 rounded-lg break-all">
          {address}
        </div>
      </motion.div>

      {/* Match NFTs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-light rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaImage className="text-primary" />
            Match NFTs
          </h2>
          <span className="text-sm text-gray-400">{matchNFTs.length} total</span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : matchNFTs.length === 0 ? (
          <div className="text-center py-8">
            <FaHeart className="text-4xl text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No matches yet</p>
            <p className="text-gray-500 text-xs mt-1">Start swiping to find your match!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {matchNFTs.map((nft) => (
              <motion.div
                key={nft.tokenId}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-3 border border-primary/30"
              >
                {/* NFT Icon */}
                <div className="aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg flex items-center justify-center mb-2">
                  <FaHeart className="text-3xl text-white/80" />
                </div>

                {/* NFT Info */}
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm">Match #{nft.tokenId}</h3>
                  <p className="text-xs text-gray-400">
                    {shortenAddress(nft.partner, 3)}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(nft.timestamp)}</p>
                </div>

                {/* View Button */}
                <button
                  onClick={() =>
                    window.open(
                      `https://testnet.snowtrace.io/token/${process.env.NEXT_PUBLIC_MATCH_NFT_ADDRESS}?a=${nft.tokenId}`,
                      '_blank'
                    )
                  }
                  className="mt-2 w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1"
                >
                  <FaExternalLinkAlt className="text-[10px]" />
                  View
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
