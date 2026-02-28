// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillMatrixCertificate is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event CertificateMinted(address indexed recipient, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("SkillMatrixCertificate", "SMC") Ownable(msg.sender) {}

    /**
     * @dev Mints a new certificate to `studentAddress` with the specified `metadataURI`.
     * Only the owner (the backend wallet) can mint certificates.
     */
    function mintCertificate(address studentAddress, string memory metadataURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(studentAddress, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit CertificateMinted(studentAddress, tokenId, metadataURI);
        
        return tokenId;
    }
}
