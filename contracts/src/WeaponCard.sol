// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

interface CharacterCardInterface {
    function deatchWeapon(
        uint _tokenIdofCharacter,
        uint _tokenIdofWeapon,
        address _user
    ) external;
}

contract RealmClashWeapons is ERC721,ERC721Enumerable, ERC721URIStorage {
    uint256 private _tokenIdCounter;
    mapping(address => bool) public _allowedMinters;
    address public CharacterCardContract;

    struct WeaponCardStats {
        string name;
        uint baseHealth; //100 - 200
        uint baseAttack; //10 - 20
        uint baseMagicPower; // 15 - 30
        uint baseWeaponSkill; // 1 - 5
        string className; // sword, staff, bow, spear, grimoire, wand, unidentified
        uint tokenId;
        uint equippedCharacterId;
    }

    mapping(uint => WeaponCardStats) public weaponStats;

    constructor() ERC721("RealmClashWeapons", "RCCW") {
        _allowedMinters[msg.sender] = true;
    }

    modifier Minters() {
        require(_allowedMinters[msg.sender], "Not allowed to Mint");
        _;
    }

    function mint(
        address to,
        string memory uri
    ) public Minters returns (uint256) {
        _tokenIdCounter++;
        _safeMint(to, _tokenIdCounter);
        _setTokenURI(_tokenIdCounter, uri);
        return _tokenIdCounter;
    }

    function burn(uint256 _tokenId) public Minters returns (uint256) {
        _burn(_tokenId);
        return _tokenId;
    }

    // In game mechanics
    function attachWeaponStats(
        uint _tokenId,
        string calldata _name,
        uint _baseHealth,
        uint _baseAttack,
        uint _baseMagicPower,
        uint _weaponHandling,
        string calldata _className
    ) public Minters {
        weaponStats[_tokenId] = WeaponCardStats(
            _name,
            _baseHealth,
            _baseAttack,
            _baseMagicPower,
            _weaponHandling,
            _className,
            _tokenId,
            0
        );
    }

    function detachWeapon(uint _tokenIdofWeapon) public {
        require(
            _isWeaponOwner(_tokenIdofWeapon, msg.sender),
            "Weapon does not belong to you"
        );
        CharacterCardInterface(CharacterCardContract).deatchWeapon(
            0,
            _tokenIdofWeapon,
            msg.sender
        );
    }

    function _isWeaponOwner(
        uint _tokenId,
        address _addr
    ) public view returns (bool) {
        return (ownerOf(_tokenId) == _addr);
    }

    function _isCharacterOwner(
        uint _tokenId,
        address _addr
    ) public view returns (bool) {
        return (ERC721(CharacterCardContract).ownerOf(_tokenId) == _addr);
    }

    function _weaponStatsMap(
        uint _tokenId
    ) external view returns (WeaponCardStats memory) {
        return weaponStats[_tokenId];
    }

   // Updated functions
    
    function setTokenURI (uint _tokenId, string memory _tokenURI ) Minters external {
        _setTokenURI(_tokenId, _tokenURI);
    }

    function _tokenOfOwnerByIndex (address owner, uint index) external view returns (uint) {
       return tokenOfOwnerByIndex(owner, index);
    }
      function _tokenByIndex (uint index) external view returns (uint) {
       return tokenByIndex(index);
    }
    function _getOwnerByIndex(uint index) public view returns (uint256) {
    // added `return`
    return tokenOfOwnerByIndex(address(msg.sender), index);
}
    function getOwnerByIndex(uint256 index) public view returns (address) {
    uint256 tokenId = tokenByIndex(index);
    address owner = ownerOf(tokenId);
    return owner;
}

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
