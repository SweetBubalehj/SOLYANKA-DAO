// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SolyankaToken is ERC20 {
    uint256 immutable _totalSupply;

    constructor() ERC20("Solyanka", "SLK") {
        _totalSupply = 1000000 * 10 ** decimals();

        _mint(msg.sender, _totalSupply);
    }
}
