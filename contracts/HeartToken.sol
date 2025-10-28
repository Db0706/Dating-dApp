// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HeartToken
 * @dev ERC-20 reward token for the dating dApp
 * Only the authorized minter (DatingController) can mint new tokens
 */
contract HeartToken is ERC20, Ownable {
    address public minter;

    event MinterUpdated(address indexed oldMinter, address indexed newMinter);

    constructor(uint256 initialSupply) ERC20("Heart Token", "HEART") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, initialSupply);
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
     * @dev Mint tokens to a user (only callable by authorized minter)
     * @param to Recipient address
     * @param amount Amount to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Only minter can mint");
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
