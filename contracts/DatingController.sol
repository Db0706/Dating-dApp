// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./HeartToken.sol";
import "./MatchNFT.sol";

/**
 * @title DatingController
 * @dev Main logic contract for the dating dApp
 * Handles match creation, reward distribution, and boost purchases
 */
contract DatingController is Ownable, ReentrancyGuard {
    HeartToken public heartToken;
    MatchNFT public matchNFT;

    // Reward amounts (in wei, 18 decimals)
    uint256 public matchReward = 10 * 10**18;  // 10 HEART per match
    uint256 public likeReward = 1 * 10**18;     // 1 HEART per like

    // Boost settings
    uint256 public boostPrice = 0.01 ether;     // 0.01 AVAX
    uint256 public boostDuration = 30 minutes;   // 30 minutes

    // Boost tracking
    mapping(address => uint256) public boostedUntil;

    // Track matches to prevent duplicates
    mapping(bytes32 => bool) public matchExists;

    // Events
    event MatchCreated(
        address indexed userA,
        address indexed userB,
        uint256 tokenIdA,
        uint256 tokenIdB
    );

    event BoostPurchased(
        address indexed user,
        uint256 boostedUntil,
        uint256 amountPaid
    );

    event RewardPaid(
        address indexed to,
        uint256 amount,
        string reason
    );

    event RewardRatesUpdated(
        uint256 newMatchReward,
        uint256 newLikeReward
    );

    event BoostSettingsUpdated(
        uint256 newBoostPrice,
        uint256 newBoostDuration
    );

    constructor(
        address _heartToken,
        address _matchNFT
    ) Ownable(msg.sender) {
        require(_heartToken != address(0), "Invalid HeartToken address");
        require(_matchNFT != address(0), "Invalid MatchNFT address");

        heartToken = HeartToken(_heartToken);
        matchNFT = MatchNFT(_matchNFT);
    }

    /**
     * @dev Confirm a match between two users and mint NFTs + rewards
     * @param userA First user's wallet
     * @param userB Second user's wallet
     * @param tokenURI Metadata URI for the match NFT
     */
    function confirmMatch(
        address userA,
        address userB,
        string memory tokenURI
    ) external onlyOwner nonReentrant {
        require(userA != address(0) && userB != address(0), "Invalid addresses");
        require(userA != userB, "Cannot match with self");

        // Create a unique match identifier (order-independent)
        bytes32 matchId = _getMatchId(userA, userB);
        require(!matchExists[matchId], "Match already exists");

        // Mark match as created
        matchExists[matchId] = true;

        // Mint Match NFTs to both users
        uint256 tokenIdA = matchNFT.mintMatchNFT(userA, userB, tokenURI);
        uint256 tokenIdB = matchNFT.mintMatchNFT(userB, userA, tokenURI);

        // Mint HEART rewards to both users
        heartToken.mint(userA, matchReward);
        heartToken.mint(userB, matchReward);

        emit MatchCreated(userA, userB, tokenIdA, tokenIdB);
        emit RewardPaid(userA, matchReward, "match");
        emit RewardPaid(userB, matchReward, "match");
    }

    /**
     * @dev Reward a user for sending a like
     * @param liker The wallet that sent the like
     */
    function rewardLike(address liker) external onlyOwner {
        require(liker != address(0), "Invalid address");

        heartToken.mint(liker, likeReward);
        emit RewardPaid(liker, likeReward, "like");
    }

    /**
     * @dev Purchase a visibility boost
     * User pays AVAX and gets boosted for a duration
     */
    function purchaseBoost() external payable nonReentrant {
        require(msg.value >= boostPrice, "Insufficient payment");

        // Calculate new boost end time
        uint256 currentBoostEnd = boostedUntil[msg.sender];
        uint256 newBoostEnd;

        // If already boosted, extend from current end time
        // Otherwise, start from now
        if (currentBoostEnd > block.timestamp) {
            newBoostEnd = currentBoostEnd + boostDuration;
        } else {
            newBoostEnd = block.timestamp + boostDuration;
        }

        boostedUntil[msg.sender] = newBoostEnd;

        emit BoostPurchased(msg.sender, newBoostEnd, msg.value);

        // Refund excess payment
        if (msg.value > boostPrice) {
            (bool success, ) = msg.sender.call{value: msg.value - boostPrice}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @dev Check if a user is currently boosted
     * @param user The wallet to check
     * @return isBoosted True if currently boosted
     * @return timeRemaining Seconds remaining (0 if not boosted)
     */
    function checkBoostStatus(address user) external view returns (
        bool isBoosted,
        uint256 timeRemaining
    ) {
        if (boostedUntil[user] > block.timestamp) {
            return (true, boostedUntil[user] - block.timestamp);
        }
        return (false, 0);
    }

    /**
     * @dev Update reward rates (owner only)
     * @param newMatchReward New reward for matches (in wei)
     * @param newLikeReward New reward for likes (in wei)
     */
    function updateRewardRates(
        uint256 newMatchReward,
        uint256 newLikeReward
    ) external onlyOwner {
        matchReward = newMatchReward;
        likeReward = newLikeReward;
        emit RewardRatesUpdated(newMatchReward, newLikeReward);
    }

    /**
     * @dev Update boost settings (owner only)
     * @param newBoostPrice New price in AVAX (in wei)
     * @param newBoostDuration New duration in seconds
     */
    function updateBoostSettings(
        uint256 newBoostPrice,
        uint256 newBoostDuration
    ) external onlyOwner {
        require(newBoostDuration > 0, "Duration must be positive");
        boostPrice = newBoostPrice;
        boostDuration = newBoostDuration;
        emit BoostSettingsUpdated(newBoostPrice, newBoostDuration);
    }

    /**
     * @dev Withdraw accumulated AVAX from boost purchases (owner only)
     * @param to Address to send funds to
     */
    function withdrawFunds(address payable to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = to.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get a unique match identifier for two users (order-independent)
     */
    function _getMatchId(address userA, address userB) private pure returns (bytes32) {
        // Ensure consistent ordering
        if (userA < userB) {
            return keccak256(abi.encodePacked(userA, userB));
        } else {
            return keccak256(abi.encodePacked(userB, userA));
        }
    }

    /**
     * @dev Check if a match exists between two users
     */
    function doesMatchExist(address userA, address userB) external view returns (bool) {
        bytes32 matchId = _getMatchId(userA, userB);
        return matchExists[matchId];
    }
}
