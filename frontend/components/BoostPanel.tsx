'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/lib/store';
import { purchaseBoost, getBoostPrice, getBoostStatus } from '@/lib/contracts';
import { updateBoostStatus } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { FaRocket } from 'react-icons/fa';

export default function BoostPanel() {
  const { address, isBoosted, boostTimeRemaining, setBoostStatus } = useWalletStore();

  const [boostPrice, setBoostPrice] = useState('0.01');
  const [loading, setLoading] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    loadBoostPrice();
  }, []);

  useEffect(() => {
    if (address) {
      refreshBoostStatus();
      const interval = setInterval(refreshBoostStatus, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [address]);

  useEffect(() => {
    if (isBoosted && boostTimeRemaining > 0) {
      updateTimeDisplay();
      const interval = setInterval(updateTimeDisplay, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeDisplay('');
    }
  }, [isBoosted, boostTimeRemaining]);

  async function loadBoostPrice() {
    try {
      const price = await getBoostPrice();
      setBoostPrice(price);
    } catch (error) {
      console.error('Error loading boost price:', error);
    }
  }

  async function refreshBoostStatus() {
    if (!address) return;

    try {
      const status = await getBoostStatus(address);
      setBoostStatus(status.isBoosted, status.timeRemaining);
    } catch (error) {
      console.error('Error refreshing boost status:', error);
    }
  }

  function updateTimeDisplay() {
    if (boostTimeRemaining <= 0) {
      setTimeDisplay('');
      return;
    }

    const minutes = Math.floor(boostTimeRemaining / 60);
    const seconds = boostTimeRemaining % 60;
    setTimeDisplay(`${minutes}m ${seconds}s`);
  }

  async function handlePurchaseBoost() {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);

    try {
      const receipt = await purchaseBoost();

      // Update boost status in database
      const newBoostEnd = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes from now
      await updateBoostStatus(address, newBoostEnd);

      // Refresh status
      await refreshBoostStatus();

      toast.success('Boost activated! 🚀');
    } catch (error: any) {
      console.error('Error purchasing boost:', error);
      toast.error(error.message || 'Failed to purchase boost');
    } finally {
      setLoading(false);
    }
  }

  if (!address) {
    return (
      <div className="bg-dark-light rounded-2xl p-6 text-center">
        <p className="text-gray-400">Connect your wallet to use Boost</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl p-4 md:p-6 border-2 border-accent/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
          <FaRocket className="text-xl md:text-2xl text-dark" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white">Boost Your Profile</h3>
          <p className="text-xs md:text-sm text-gray-300">Get 10x more visibility</p>
        </div>
      </div>

      {isBoosted ? (
        <div className="space-y-4">
          <div className="bg-accent/20 backdrop-blur-sm rounded-xl p-4 border border-accent/30">
            <p className="text-sm text-gray-300 mb-2">Your boost is active!</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-accent">{timeDisplay}</span>
              <span className="text-gray-400">remaining</span>
            </div>
          </div>

          <button
            onClick={handlePurchaseBoost}
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent/80 disabled:bg-gray-600 text-dark font-bold rounded-xl transition"
          >
            {loading ? 'Processing...' : `Extend Boost (${boostPrice} AVAX)`}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-dark/30 backdrop-blur-sm rounded-xl p-4">
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>Appear first in the swipe deck</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>10x profile visibility for 30 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent">✓</span>
                <span>Get more matches faster</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handlePurchaseBoost}
            disabled={loading}
            className="w-full py-4 bg-accent hover:bg-accent/80 disabled:bg-gray-600 text-dark font-bold rounded-xl text-lg transition shadow-lg transform hover:scale-105"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <span>Boost Me ({boostPrice} AVAX)</span>
            )}
          </button>

          <p className="text-xs text-center text-gray-400">
            Boost can be stacked for longer visibility
          </p>
        </div>
      )}
    </div>
  );
}
