// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SolyankaToken is ERC20 {

    uint8 constant _decimals = 18;
    uint256 constant _totalSupply = 100 * (10**6) * 10**_decimals;  // 100m tokens for distribution

    constructor() ERC20("Solyanka", "SLK") {        
        _mint(msg.sender, _totalSupply);
    }
}