import { ethers } from 'ethers';

// Contract ABIs (minimal - include only what we need)
export const HEART_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function mint(address to, uint256 amount)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export const MATCH_NFT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function getMatchData(uint256 tokenId) view returns (address userA, address userB, uint256 timestamp)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)',
];

export const DATING_CONTROLLER_ABI = [
  'function confirmMatch(address userA, address userB, string memory tokenURI)',
  'function rewardLike(address liker)',
  'function purchaseBoost() payable',
  'function checkBoostStatus(address user) view returns (bool isBoosted, uint256 timeRemaining)',
  'function boostedUntil(address user) view returns (uint256)',
  'function matchReward() view returns (uint256)',
  'function likeReward() view returns (uint256)',
  'function boostPrice() view returns (uint256)',
  'function boostDuration() view returns (uint256)',
  'function doesMatchExist(address userA, address userB) view returns (bool)',
  'event MatchCreated(address indexed userA, address indexed userB, uint256 tokenIdA, uint256 tokenIdB)',
  'event BoostPurchased(address indexed user, uint256 boostedUntil, uint256 amountPaid)',
  'event RewardPaid(address indexed to, uint256 amount, string reason)',
];

// Contract addresses from environment variables
export const CONTRACTS = {
  HEART_TOKEN: process.env.NEXT_PUBLIC_HEART_TOKEN_ADDRESS || '',
  MATCH_NFT: process.env.NEXT_PUBLIC_MATCH_NFT_ADDRESS || '',
  DATING_CONTROLLER: process.env.NEXT_PUBLIC_DATING_CONTROLLER_ADDRESS || '',
};

// Network configuration
export const AVALANCHE_FUJI = {
  chainId: `0x${Number(43113).toString(16)}`,
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

/**
 * Get ethers provider (read-only)
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(AVALANCHE_FUJI.rpcUrls[0]);
}

/**
 * Get signer from wallet
 */
export async function getSigner(): Promise<ethers.Signer> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet detected');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

/**
 * Get HeartToken contract instance
 */
export async function getHeartTokenContract(withSigner = false) {
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACTS.HEART_TOKEN, HEART_TOKEN_ABI, signer);
  }
  const provider = getProvider();
  return new ethers.Contract(CONTRACTS.HEART_TOKEN, HEART_TOKEN_ABI, provider);
}

/**
 * Get MatchNFT contract instance
 */
export async function getMatchNFTContract(withSigner = false) {
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACTS.MATCH_NFT, MATCH_NFT_ABI, signer);
  }
  const provider = getProvider();
  return new ethers.Contract(CONTRACTS.MATCH_NFT, MATCH_NFT_ABI, provider);
}

/**
 * Get DatingController contract instance
 */
export async function getDatingControllerContract(withSigner = false) {
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(CONTRACTS.DATING_CONTROLLER, DATING_CONTROLLER_ABI, signer);
  }
  const provider = getProvider();
  return new ethers.Contract(CONTRACTS.DATING_CONTROLLER, DATING_CONTROLLER_ABI, provider);
}

/**
 * Get HEART token balance for an address
 */
export async function getHeartBalance(address: string): Promise<string> {
  const contract = await getHeartTokenContract();
  const balance = await contract.balanceOf(address);
  return ethers.formatEther(balance);
}

/**
 * Get boost status for an address
 */
export async function getBoostStatus(address: string): Promise<{
  isBoosted: boolean;
  timeRemaining: number;
}> {
  const contract = await getDatingControllerContract();
  const [isBoosted, timeRemaining] = await contract.checkBoostStatus(address);
  return {
    isBoosted,
    timeRemaining: Number(timeRemaining),
  };
}

/**
 * Purchase a boost
 */
export async function purchaseBoost(): Promise<ethers.TransactionReceipt> {
  const contract = await getDatingControllerContract(true);
  const boostPrice = await contract.boostPrice();

  const tx = await contract.purchaseBoost({ value: boostPrice });
  return tx.wait();
}

/**
 * Get all Match NFTs owned by an address
 */
export async function getUserMatchNFTs(address: string): Promise<
  Array<{
    tokenId: number;
    partner: string;
    timestamp: number;
    tokenURI: string;
  }>
> {
  const contract = await getMatchNFTContract();
  const balance = await contract.balanceOf(address);
  const matches = [];

  for (let i = 0; i < Number(balance); i++) {
    try {
      const tokenId = await contract.tokenOfOwnerByIndex(address, i);
      const [userA, userB, timestamp] = await contract.getMatchData(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);

      // Partner is the other address
      const partner = userA.toLowerCase() === address.toLowerCase() ? userB : userA;

      matches.push({
        tokenId: Number(tokenId),
        partner,
        timestamp: Number(timestamp),
        tokenURI,
      });
    } catch (error) {
      console.error(`Error fetching NFT at index ${i}:`, error);
    }
  }

  return matches;
}

/**
 * Get boost price from contract
 */
export async function getBoostPrice(): Promise<string> {
  const contract = await getDatingControllerContract();
  const price = await contract.boostPrice();
  return ethers.formatEther(price);
}

/**
 * Shorten wallet address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if user has the correct network
 */
export async function checkNetwork(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  return Number(network.chainId) === 43113;
}

/**
 * Switch to Avalanche Fuji network
 */
export async function switchToFuji(): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet detected');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AVALANCHE_FUJI.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [AVALANCHE_FUJI],
      });
    } else {
      throw switchError;
    }
  }
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
