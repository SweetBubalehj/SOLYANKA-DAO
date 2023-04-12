// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract SBT {
    struct Soul {
        string identity;
        string name;
        uint age;
        bool KYC;
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

    function createSoul (address addrSoul, string calldata _name, uint _age) public OnlyOwner {
        require(keccak256(bytes(souls[addrSoul].identity)) == zeroHash, "Soul already exists");
        souls[addrSoul].identity = "1";
        souls[addrSoul].name = _name;
        souls[addrSoul].age = _age;
        souls[addrSoul].KYC = false;
    }

    function deleteSoul (address addrSoul) public OnlyOwner {
        require(keccak256(bytes(souls[addrSoul].identity)) != zeroHash, "Soul does not exist");
        delete souls[addrSoul];
    }

    function turnKYC(address addrSoul, bool _kyc) public OnlyOwner {
        souls[addrSoul].KYC = _kyc;
    }

    function updateDataSoul (address addrSoul, string calldata _name, uint _age) public OnlyOwner {
        require(keccak256(bytes(souls[addrSoul].identity)) != zeroHash, "Soul does not exist");
        souls[addrSoul].name = _name;
        souls[addrSoul].age = _age;
    }

    function checkKYC(address addrSoul) public view returns(bool){
        return souls[addrSoul].KYC ? true : false;
    }

    function getSoul(address addrSoul) public view returns(Soul memory){
        return souls[addrSoul];
    }
}