// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVoyaraToken {
    function mint(address to, uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
}

/// @title Voyara Loyalty Manager
/// @notice Registers network merchants and records every earn and redemption on-chain.
contract LoyaltyManager is AccessControl, ReentrancyGuard {
    IVoyaraToken public immutable token;

    struct Merchant {
        string name;
        address wallet;
        bool active;
    }

    uint256 public merchantCount;
    mapping(uint256 => Merchant) public merchants;
    mapping(address => uint256) public merchantIdByWallet;

    event MerchantRegistered(uint256 indexed merchantId, address indexed wallet, string name);
    event MerchantStatusChanged(uint256 indexed merchantId, bool active);
    event RewardEarned(
        address indexed user,
        uint256 indexed merchantId,
        bytes32 indexed campaignRef,
        uint256 points,
        uint256 timestamp
    );
    event RewardRedeemed(address indexed user, bytes32 indexed rewardRef, uint256 points, uint256 timestamp);

    constructor(address tokenAddress, address admin) {
        require(tokenAddress != address(0), "TOKEN_REQUIRED");
        token = IVoyaraToken(tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function registerMerchant(address wallet, string calldata name) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        require(wallet != address(0), "WALLET_REQUIRED");
        require(merchantIdByWallet[wallet] == 0, "MERCHANT_EXISTS");
        require(bytes(name).length > 0, "NAME_REQUIRED");

        uint256 merchantId = ++merchantCount;
        merchants[merchantId] = Merchant({name: name, wallet: wallet, active: true});
        merchantIdByWallet[wallet] = merchantId;

        emit MerchantRegistered(merchantId, wallet, name);
        return merchantId;
    }

    function setMerchantActive(uint256 merchantId, bool active) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Merchant storage merchant = merchants[merchantId];
        require(merchant.wallet != address(0), "UNKNOWN_MERCHANT");
        merchant.active = active;
        emit MerchantStatusChanged(merchantId, active);
    }

    function award(address user, bytes32 campaignRef, uint256 points) external nonReentrant {
        require(user != address(0), "USER_REQUIRED");
        require(points > 0, "POINTS_REQUIRED");

        uint256 merchantId = merchantIdByWallet[msg.sender];
        Merchant storage merchant = merchants[merchantId];
        require(merchant.active, "MERCHANT_INACTIVE");

        token.mint(user, points);
        emit RewardEarned(user, merchantId, campaignRef, points, block.timestamp);
    }

    function redeem(bytes32 rewardRef, uint256 points) external nonReentrant {
        require(points > 0, "POINTS_REQUIRED");
        token.burnFrom(msg.sender, points);
        emit RewardRedeemed(msg.sender, rewardRef, points, block.timestamp);
    }
}
