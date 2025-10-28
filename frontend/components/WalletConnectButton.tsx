'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWalletStore } from '@/lib/store';
import {
  getSigner,
  getHeartBalance,
  getBoostStatus,
  checkNetwork,
  switchToFuji,
  shortenAddress,
} from '@/lib/contracts';
import { getUserProfile } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function WalletConnectButton() {
  const {
    address,
    isConnected,
    heartBalance,
    setAddress,
    setHeartBalance,
    setBoostStatus,
    setUserProfile,
    disconnect,
  } = useWalletStore();

  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    // Small delay to avoid race conditions with Core Wallet
    const timer = setTimeout(() => {
      checkWalletConnection();
    }, 500);

    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Refresh balances periodically
  useEffect(() => {
    if (address) {
      const interval = setInterval(() => {
        refreshWalletData(address);
      }, 15000); // Every 15 seconds

      return () => clearInterval(interval);
    }
  }, [address]);

  async function checkWalletConnection() {
    if (typeof window === 'undefined' || !window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const userAddress = accounts[0];
        setAddress(userAddress);
        await refreshWalletData(userAddress);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }

  async function handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      disconnect();
      toast.error('Wallet disconnected');
    } else {
      setAddress(accounts[0]);
      await refreshWalletData(accounts[0]);
    }
  }

  async function connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast.error('Please install MetaMask or Core Wallet');
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAddress = accounts[0];

      // Check network
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        const shouldSwitch = confirm(
          'You are on the wrong network. Switch to Avalanche Fuji?'
        );
        if (shouldSwitch) {
          await switchToFuji();
        } else {
          throw new Error('Please switch to Avalanche Fuji network');
        }
      }

      // Set address
      setAddress(userAddress);

      // Load user data
      await refreshWalletData(userAddress);

      toast.success('Wallet connected!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }

  async function refreshWalletData(userAddress: string) {
    try {
      // Get HEART balance
      const balance = await getHeartBalance(userAddress);
      setHeartBalance(balance);

      // Get boost status
      const boostStatus = await getBoostStatus(userAddress);
      setBoostStatus(boostStatus.isBoosted, boostStatus.timeRemaining);

      // Get user profile from database
      const profile = await getUserProfile(userAddress);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing wallet data:', error);
    }
  }

  function handleDisconnect() {
    disconnect();
    toast.success('Wallet disconnected');
  }

  if (isConnecting) {
    return (
      <button
        disabled
        className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-600 text-white rounded-full font-semibold text-xs md:text-sm"
      >
        Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-light rounded-full border border-primary/20">
          <span className="text-accent font-bold text-sm">{parseFloat(heartBalance).toFixed(0)}</span>
          <span className="text-secondary text-xs">HEART</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-primary hover:bg-primary/80 text-white rounded-full font-semibold transition text-xs md:text-sm"
        >
          {shortenAddress(address, 2)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-1.5 md:px-6 md:py-2 bg-primary hover:bg-primary/80 text-white rounded-full font-semibold transition shadow-lg text-xs md:text-sm whitespace-nowrap"
    >
      Connect Wallet
    </button>
  );
}
