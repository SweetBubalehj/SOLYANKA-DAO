// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    address public owner;

    constructor (uint totalSupply) ERC20("SBToken", "SBT") {
        owner = msg.sender;
        _mint(msg.sender, totalSupply);
    }

    modifier OnlyOwner {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function mint(address addr, uint amount) public OnlyOwner {
        _mint(addr, amount);
    }
}