// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MatchNFT
 * @dev ERC-721 NFT minted when two users match
 * Each match creates two NFTs (one for each user)
 * Only the authorized minter (DatingController) can mint
 */
contract MatchNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    address public minter;

    // Mapping from token ID to match metadata
    struct MatchMetadata {
        address userA;
        address userB;
        uint256 timestamp;
    }

    mapping(uint256 => MatchMetadata) public matchData;

    event MinterUpdated(address indexed oldMinter, address indexed newMinter);
    event MatchNFTMinted(uint256 indexed tokenId, address indexed owner, address indexed partner);

    constructor() ERC721("Dating Match NFT", "MATCH") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start token IDs at 1
    }

    /**
     * @dev Set the authorized minter (should be DatingController contract)
     * @param _minter Address of the minter contract
     */
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Minter cannot be zero address");
        emit MinterUpdated(minter, _minter);
        minter = _minter;
    }

    /**
     * @dev Mint a Match NFT to a user
     * @param to Owner of this NFT
     * @param partner The other wallet in the match
     * @param tokenURI Metadata URI pointing to IPFS JSON
     * @return tokenId The newly minted token ID
     */
    function mintMatchNFT(
        address to,
        address partner,
        string memory tokenURI
    ) external returns (uint256) {
        require(msg.sender == minter, "Only minter can mint");
        require(to != address(0), "Cannot mint to zero address");
        require(partner != address(0), "Partner cannot be zero address");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Store match metadata on-chain
        matchData[tokenId] = MatchMetadata({
            userA: to,
            userB: partner,
            timestamp: block.timestamp
        });

        emit MatchNFTMinted(tokenId, to, partner);

        return tokenId;
    }

    /**
     * @dev Get match metadata for a token
     * @param tokenId The token ID to query
     * @return userA First user in the match
     * @return userB Second user in the match
     * @return timestamp When the match was created
     */
    function getMatchData(uint256 tokenId) external view returns (
        address userA,
        address userB,
        uint256 timestamp
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        MatchMetadata memory data = matchData[tokenId];
        return (data.userA, data.userB, data.timestamp);
    }

    /**
     * @dev Get total number of NFTs minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
}
