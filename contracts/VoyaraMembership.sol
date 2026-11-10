// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Voyara Membership
/// @notice Soulbound membership NFT with an on-chain tier and generated card art.
contract VoyaraMembership is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint8 public constant EXPLORER = 1;
    uint8 public constant VOYAGER = 2;
    uint8 public constant LUMINARY = 3;

    uint256 private _nextTokenId = 1;
    mapping(uint256 => uint8) private _tier;
    mapping(address => uint256) private _membershipOf;

    event MembershipMinted(address indexed member, uint256 indexed tokenId, uint8 tier);
    event MembershipUpgraded(uint256 indexed tokenId, uint8 previousTier, uint8 newTier);

    constructor(address admin) ERC721("Voyara Membership", "VOYARA") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function mintMembership(address member, uint8 tier) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(_membershipOf[member] == 0, "MEMBERSHIP_EXISTS");
        require(_validTier(tier), "INVALID_TIER");

        uint256 tokenId = _nextTokenId++;
        _membershipOf[member] = tokenId;
        _tier[tokenId] = tier;
        _safeMint(member, tokenId);

        emit MembershipMinted(member, tokenId, tier);
        return tokenId;
    }

    function upgradeTier(uint256 tokenId, uint8 newTier) external onlyRole(MINTER_ROLE) {
        uint8 currentTier = _tier[tokenId];
        require(_validTier(newTier) && newTier > currentTier, "INVALID_UPGRADE");
        _tier[tokenId] = newTier;
        emit MembershipUpgraded(tokenId, currentTier, newTier);
    }

    function tierOf(uint256 tokenId) public view returns (uint8) {
        _requireOwned(tokenId);
        return _tier[tokenId];
    }

    function tokenOf(address member) external view returns (uint256) {
        return _membershipOf[member];
    }

    function tierOfAddress(address member) external view returns (uint8) {
        uint256 tokenId = _membershipOf[member];
        return tokenId == 0 ? 0 : _tier[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint8 tier = _tier[tokenId];
        string memory tierName = _tierName(tier);
        string memory palette = _palette(tier);

        string memory svg = string.concat(
            "<svg xmlns='http://www.w3.org/2000/svg' width='720' height='440' viewBox='0 0 720 440'>",
            "<rect width='720' height='440' rx='32' fill='#102A23'/>",
            "<rect x='18' y='18' width='684' height='404' rx='24' fill='none' stroke='",
            palette,
            "' stroke-opacity='0.55'/>",
            "<text x='52' y='78' fill='",
            palette,
            "' font-family='Georgia,serif' font-size='26' letter-spacing='8'>VOYARA</text>",
            "<text x='52' y='245' fill='#F5EFE3' font-family='Georgia,serif' font-size='64'>",
            tierName,
            "</text>",
            "<text x='54' y='286' fill='#F5EFE3' fill-opacity='0.65' font-family='Arial,sans-serif' font-size='15' letter-spacing='4'>MEMBERSHIP No. ",
            tokenId.toString(),
            "</text>",
            "<circle cx='590' cy='300' r='88' fill='none' stroke='",
            palette,
            "' stroke-opacity='0.4'/>",
            "<circle cx='590' cy='300' r='64' fill='",
            palette,
            "' fill-opacity='0.14'/>",
            "<path d='M562 314 L590 268 L618 314 M574 314 L590 288 L606 314' fill='none' stroke='",
            palette,
            "' stroke-width='2'/>",
            "<text x='52' y='374' fill='#F5EFE3' fill-opacity='0.5' font-family='Arial,sans-serif' font-size='12' letter-spacing='3'>THE TRAVEL REWARDS NETWORK</text>",
            "</svg>"
        );

        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name":"Voyara ',
                    tierName,
                    " #",
                    tokenId.toString(),
                    '","description":"A soulbound Voyara membership card. One membership, a world of places.","attributes":[{"trait_type":"Tier","value":"',
                    tierName,
                    '"},{"trait_type":"Member Since","value":"',
                    block.timestamp.toString(),
                    '"}],"image":"data:image/svg+xml;base64,',
                    Base64.encode(bytes(svg)),
                    '"}'
                )
            )
        );

        return string.concat("data:application/json;base64,", json);
    }

    function _validTier(uint8 tier) private pure returns (bool) {
        return tier == EXPLORER || tier == VOYAGER || tier == LUMINARY;
    }

    function _tierName(uint8 tier) private pure returns (string memory) {
        if (tier == LUMINARY) return "LUMINARY";
        if (tier == VOYAGER) return "VOYAGER";
        return "EXPLORER";
    }

    function _palette(uint8 tier) private pure returns (string memory) {
        if (tier == LUMINARY) return "#D9B872";
        if (tier == VOYAGER) return "#D07A52";
        return "#B8C5B1";
    }

    // Memberships are permanently bound to the member's wallet.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "MEMBERSHIP_SOULBOUND");
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
