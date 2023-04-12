// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract SBT {
    struct Soul {
        string identity;
        string name;
        string email;
        uint age;
        bool KYC;
        uint8 roleWeight;
        address owner;
    }

    mapping(address => Soul) private souls;

    string public name;
    string public title;
    address public owner;
    bytes32 zeroHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;

    modifier OnlyOwner {
        require(owner == msg.sender, "Not Owner");
        _;
    }

    constructor (string memory _name, string memory _title) {
        name = _name;
        title = _title;
        owner = msg.sender;
    }

    function createSoul (address addrSoul, string calldata _name, string calldata _email,  uint _age, uint8 _roleWeight, address _owner) public OnlyOwner {
        require(keccak256(bytes(souls[addrSoul].identity)) == zeroHash, "Soul already exists");
        souls[addrSoul].identity = "1";
        souls[addrSoul].name = _name;
        souls[addrSoul].name = _email;
        souls[addrSoul].age = _age;
        souls[addrSoul].KYC = false;
        souls[addrSoul].roleWeight = _roleWeight;
        souls[addrSoul].owner = _owner;
    }

    function deleteSoul (address addrSoul) public OnlyOwner {
        require(keccak256(bytes(souls[addrSoul].identity)) != zeroHash, "Soul does not exist");
        delete souls[addrSoul];
    }

    function turnKYC(address addrSoul, bool _kyc) public OnlyOwner {
        souls[addrSoul].KYC = _kyc;
    }

    function updateDataSoul (address addrSoul, Soul memory data) public OnlyOwner {
        require(keccak256(bytes(souls[addrSoul].identity)) != zeroHash, "Soul does not exist");
        souls[addrSoul] = data;
    }

    function checkKYC(address addrSoul) public view returns(bool){
        return souls[addrSoul].KYC ? true : false;
    }

    function getSoul(address addrSoul) public view returns(Soul memory){
        return souls[addrSoul];
    }

    function getRole(address addrSoul) public view returns(uint8) {
        return souls[addrSoul].roleWeight;
    }

    function getOwner(address addrSoul) public view returns(address) {
        return souls[addrSoul].owner;
    }

    function addModerator(address user) public OnlyOwner {
        require(keccak256(bytes(souls[user].identity)) != zeroHash, "Soul does not exist");
        require(souls[user].roleWeight < 1, "Already has role");
        souls[user].roleWeight = 1;
    }

    function removeModerator(address user) public OnlyOwner {
        require(souls[user].roleWeight != 2, "Admin can't be deleted");
        souls[user].roleWeight = 0;
    }
}