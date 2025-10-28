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

  const [showMobileOptions, setShowMobileOptions] = useState(false);

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  function openInMetaMask() {
    const currentUrl = window.location.href;
    const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
    window.open(metamaskUrl, '_blank');
  }

  function openInCoreWallet() {
    const currentUrl = window.location.href;
    const dappUrl = encodeURIComponent(currentUrl);
    const coreWalletUrl = `https://wallet.avax.network/dapp?url=${dappUrl}`;
    window.open(coreWalletUrl, '_blank');
  }

  function copyUrlForWallet() {
    navigator.clipboard.writeText(window.location.href);
    toast.success('URL copied! Open your wallet browser and paste the URL');
  }

  async function connectWallet() {
    if (typeof window === 'undefined') return;

    // Mobile: Show wallet options modal if no provider detected
    if (isMobile() && !window.ethereum) {
      setShowMobileOptions(true);
      return;
    }

    // Desktop or mobile with wallet installed
    if (!window.ethereum) {
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

  // Mobile Wallet Options Modal
  if (showMobileOptions) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-light rounded-3xl shadow-2xl max-w-md w-full p-6 border border-primary/20">
          <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Choose how you want to connect your wallet
          </p>

          <div className="space-y-3">
            <button
              onClick={openInMetaMask}
              className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🦊</span>
              Open in MetaMask
            </button>

            <button
              onClick={openInCoreWallet}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-3"
            >
              <span className="text-2xl">⛰️</span>
              Open in Core Wallet
            </button>

            <button
              onClick={copyUrlForWallet}
              className="w-full px-6 py-4 bg-dark border border-primary/30 hover:border-primary/50 text-white rounded-xl font-semibold transition flex items-center justify-center gap-3"
            >
              <span className="text-2xl">📋</span>
              Copy URL for Wallet Browser
            </button>
          </div>

          <button
            onClick={() => setShowMobileOptions(false)}
            className="w-full mt-4 px-6 py-3 text-gray-400 hover:text-white transition font-semibold"
          >
            Cancel
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Open this dApp inside your wallet's browser to connect
          </p>
        </div>
      </div>
    );
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
