import axios from 'axios';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
const PINATA_JWT = process.env.PINATA_JWT || '';

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadMetadataToIPFS(metadata: {
  name: string;
  description: string;
  image?: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}): Promise<string> {
  try {
    // Use JWT if available, otherwise use API keys
    const headers = PINATA_JWT
      ? {
          Authorization: `Bearer ${PINATA_JWT}`,
          'Content-Type': 'application/json',
        }
      : {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          'Content-Type': 'application/json',
        };

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      { headers }
    );

    const ipfsHash = response.data.IpfsHash;
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
}

/**
 * Create match NFT metadata and upload to IPFS
 */
export async function createMatchMetadata(
  userA: string,
  userB: string,
  timestamp: number
): Promise<string> {
  // Generic match badge image (you can host this on IPFS or use a placeholder)
  const matchBadgeImage = 'https://gateway.pinata.cloud/ipfs/YOUR_MATCH_BADGE_IMAGE_HASH';

  const metadata = {
    name: `Match #${Date.now()}`,
    description: 'On-chain proof that two wallets matched on the Dating dApp',
    image: matchBadgeImage,
    attributes: [
      {
        trait_type: 'userA',
        value: userA,
      },
      {
        trait_type: 'userB',
        value: userB,
      },
      {
        trait_type: 'timestamp',
        value: timestamp,
      },
      {
        trait_type: 'platform',
        value: 'Dating dApp on Avalanche',
      },
    ],
  };

  return uploadMetadataToIPFS(metadata);
}

/**
 * Fetch metadata from IPFS
 */
export async function fetchMetadataFromIPFS(tokenURI: string): Promise<any> {
  try {
    // Convert ipfs:// to https gateway URL
    let url = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      const hash = tokenURI.replace('ipfs://', '');
      url = `https://gateway.pinata.cloud/ipfs/${hash}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    return null;
  }
}
